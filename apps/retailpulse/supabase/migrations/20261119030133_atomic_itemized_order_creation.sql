
create or replace function public.create_order_with_items(
  p_business_id uuid,
  p_retailer_id uuid,
  p_items jsonb,
  p_discount numeric default 0
)
returns table(order_id uuid, order_number text, subtotal numeric, discount numeric, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
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
  v_unit_price numeric(14,2);
  v_line_total numeric(14,2);
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if p_business_id is null or p_retailer_id is null then raise exception 'Business and retailer are required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Add between 1 and 50 product lines';
  end if;
  if v_discount < 0 then raise exception 'Discount cannot be negative'; end if;

  select bm.role into v_role
  from public.business_memberships bm
  where bm.business_id = p_business_id and bm.user_id = v_uid and bm.active = true
  limit 1;
  if v_role not in ('owner','manager','salesperson') then raise exception 'You do not have permission to create orders'; end if;

  perform 1 from public.retailers r
  where r.id = p_retailer_id and r.business_id = p_business_id and r.active = true;
  if not found then raise exception 'Retailer not found in this business'; end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
      v_quantity := (v_item->>'quantity')::numeric;
    exception when others then raise exception 'Each line needs a valid product and quantity'; end;
    if v_quantity <= 0 or v_quantity > 1000000 then raise exception 'Quantity must be positive and within allowed limits'; end if;

    select p.sale_price into v_unit_price
    from public.products p
    where p.id = v_product_id and p.business_id = p_business_id and p.active = true
    for update;
    if not found then raise exception 'A product is unavailable in this business'; end if;

    v_line_total := round(v_quantity * v_unit_price,2);
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  if v_discount > v_subtotal then raise exception 'Discount cannot exceed the subtotal'; end if;

  v_order_number := 'RP-' || to_char(clock_timestamp() at time zone 'UTC','YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,4));
  insert into public.orders(business_id,retailer_id,order_number,status,subtotal,discount,total,placed_by)
  values(p_business_id,p_retailer_id,v_order_number,'received',v_subtotal,v_discount,v_subtotal-v_discount,v_uid)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    select p.sale_price into v_unit_price
    from public.products p
    where p.id = v_product_id and p.business_id = p_business_id and p.active = true;
    v_line_total := round(v_quantity * v_unit_price,2);
    insert into public.order_items(business_id,order_id,product_id,quantity,unit_price,line_total)
    values(p_business_id,v_order_id,v_product_id,v_quantity,v_unit_price,v_line_total);
  end loop;

  return query select v_order_id,v_order_number,v_subtotal,v_discount,v_subtotal-v_discount;
end;
$$;

revoke all on function public.create_order_with_items(uuid,uuid,jsonb,numeric) from public, anon;
grant execute on function public.create_order_with_items(uuid,uuid,jsonb,numeric) to authenticated;
