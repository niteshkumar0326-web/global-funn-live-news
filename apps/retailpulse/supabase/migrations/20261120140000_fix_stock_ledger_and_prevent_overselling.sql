-- Repair the stock movement vocabulary and make order booking consume stock atomically.
-- Quantities are stored as positive magnitudes for opening/purchase/return/sale/damage;
-- adjustment quantities are signed. The balance view applies the movement sign.

create or replace view public.product_stock_balances as
select
  p.business_id,
  p.id as product_id,
  p.sku,
  p.name,
  p.unit,
  p.reorder_level,
  coalesce(sum(
    case
      when sm.movement_type in ('opening','purchase','return') then sm.quantity
      when sm.movement_type in ('sale','damage') then -sm.quantity
      when sm.movement_type = 'adjustment' then sm.quantity
      else 0::numeric
    end
  ), 0::numeric)::numeric(14,3) as on_hand
from public.products p
left join public.stock_movements sm
  on sm.product_id = p.id
 and sm.business_id = p.business_id
group by p.business_id, p.id, p.sku, p.name, p.unit, p.reorder_level;

create or replace function public.record_stock_receipt(
  p_business_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_note text default null
) returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;

  select bm.role into v_role
  from public.business_memberships bm
  where bm.business_id = p_business_id
    and bm.user_id = v_uid
    and bm.active = true
  limit 1;

  if v_role is null or v_role not in ('owner','manager') then
    raise exception 'Owner or manager permission required';
  end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 1000000 then
    raise exception 'Quantity must be positive';
  end if;

  perform 1
  from public.products p
  where p.id = p_product_id
    and p.business_id = p_business_id
    and p.active = true
  for update;

  if not found then raise exception 'Active product not found in this business'; end if;

  insert into public.stock_movements(
    business_id, product_id, movement_type, quantity,
    reference_type, note, created_by
  )
  values(
    p_business_id, p_product_id, 'purchase', p_quantity,
    'manual_receipt', left(coalesce(p_note,''),500), v_uid
  )
  returning id into v_id;

  return v_id;
end;
$function$;

create or replace function public.create_order_with_items(
  p_business_id uuid,
  p_retailer_id uuid,
  p_items jsonb,
  p_discount numeric default 0
) returns table(
  order_id uuid,
  order_number text,
  subtotal numeric,
  discount numeric,
  total numeric
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(14,2) := 0;
  v_discount numeric(14,2) := coalesce(p_discount,0);
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric(14,3);
  v_requested numeric(14,3);
  v_available numeric(14,3);
  v_unit_price numeric(14,2);
  v_line_total numeric(14,2);
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if p_business_id is null or p_retailer_id is null then
    raise exception 'Business and retailer are required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Add between 1 and 50 product lines';
  end if;
  if v_discount < 0 then raise exception 'Discount cannot be negative'; end if;

  select bm.role into v_role
  from public.business_memberships bm
  where bm.business_id = p_business_id
    and bm.user_id = v_uid
    and bm.active = true
  limit 1;
  if v_role is null or v_role not in ('owner','manager','salesperson') then
    raise exception 'You do not have permission to create orders';
  end if;

  perform 1
  from public.retailers r
  where r.id = p_retailer_id
    and r.business_id = p_business_id
    and r.active = true;
  if not found then raise exception 'Retailer not found in this business'; end if;

  -- Validate every submitted line before locking stock.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
      v_quantity := (v_item->>'quantity')::numeric;
    exception when others then
      raise exception 'Each line needs a valid product and quantity';
    end;
    if v_product_id is null or v_quantity is null
       or v_quantity <= 0 or v_quantity > 1000000 then
      raise exception 'Each product needs a positive valid quantity';
    end if;
  end loop;

  -- Lock distinct product rows in stable order. Concurrent orders for the
  -- same SKU serialize here, preventing two sessions from overselling stock.
  for v_product_id in
    select distinct (x.value->>'product_id')::uuid
    from jsonb_array_elements(p_items) as x(value)
    order by 1
  loop
    perform 1
    from public.products p
    where p.id = v_product_id
      and p.business_id = p_business_id
      and p.active = true
    for update;
    if not found then raise exception 'A product is unavailable in this business'; end if;

    select coalesce(sum((x.value->>'quantity')::numeric),0)::numeric(14,3)
      into v_requested
    from jsonb_array_elements(p_items) as x(value)
    where (x.value->>'product_id')::uuid = v_product_id;

    select coalesce(sum(
      case
        when sm.movement_type in ('opening','purchase','return') then sm.quantity
        when sm.movement_type in ('sale','damage') then -sm.quantity
        when sm.movement_type = 'adjustment' then sm.quantity
        else 0::numeric
      end
    ),0)::numeric(14,3)
    into v_available
    from public.stock_movements sm
    where sm.business_id = p_business_id
      and sm.product_id = v_product_id;

    if v_requested > v_available then
      raise exception 'Insufficient stock for product %. Available: %, requested: %',
        v_product_id, v_available, v_requested;
    end if;
  end loop;

  -- Re-read locked catalogue prices and calculate the order total server-side.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    select p.sale_price into v_unit_price
    from public.products p
    where p.id = v_product_id
      and p.business_id = p_business_id
      and p.active = true;
    v_subtotal := v_subtotal + round(v_quantity * v_unit_price,2);
  end loop;

  if v_discount > v_subtotal then raise exception 'Discount cannot exceed the subtotal'; end if;

  v_order_number := 'RP-' ||
    to_char(clock_timestamp() at time zone 'UTC','YYMMDDHH24MISS') ||
    '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,4));

  insert into public.orders(
    business_id, retailer_id, order_number, status,
    subtotal, discount, total, placed_by
  )
  values(
    p_business_id, p_retailer_id, v_order_number, 'received',
    v_subtotal, v_discount, v_subtotal-v_discount, v_uid
  )
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    select p.sale_price into v_unit_price
    from public.products p
    where p.id = v_product_id
      and p.business_id = p_business_id
      and p.active = true;
    v_line_total := round(v_quantity * v_unit_price,2);

    insert into public.order_items(
      business_id, order_id, product_id, quantity, unit_price, line_total
    )
    values(
      p_business_id, v_order_id, v_product_id, v_quantity, v_unit_price, v_line_total
    );
  end loop;

  -- One positive-magnitude sale movement per product; the balance view
  -- subtracts sales. Any failure rolls back the order, lines and movements.
  insert into public.stock_movements(
    business_id, product_id, movement_type, quantity,
    reference_type, reference_id, note, created_by
  )
  select
    p_business_id,
    (x.value->>'product_id')::uuid,
    'sale',
    sum((x.value->>'quantity')::numeric),
    'order',
    v_order_id,
    'Order ' || v_order_number,
    v_uid
  from jsonb_array_elements(p_items) as x(value)
  group by (x.value->>'product_id')::uuid;

  return query
  select v_order_id, v_order_number, v_subtotal, v_discount, v_subtotal-v_discount;
end;
$function$;
