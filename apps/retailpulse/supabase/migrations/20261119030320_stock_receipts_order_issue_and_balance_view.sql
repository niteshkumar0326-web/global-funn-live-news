
create or replace function public.record_stock_receipt(
 p_business_id uuid,p_product_id uuid,p_quantity numeric,p_note text default null
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_role text; v_id uuid;
begin
 if v_uid is null then raise exception 'Sign in required'; end if;
 select bm.role into v_role from public.business_memberships bm
 where bm.business_id=p_business_id and bm.user_id=v_uid and bm.active=true limit 1;
 if v_role is null or v_role not in ('owner','manager') then raise exception 'Owner or manager permission required'; end if;
 if p_quantity is null or p_quantity<=0 or p_quantity>1000000 then raise exception 'Quantity must be positive'; end if;
 perform 1 from public.products p where p.id=p_product_id and p.business_id=p_business_id and p.active=true for update;
 if not found then raise exception 'Active product not found in this business'; end if;
 insert into public.stock_movements(business_id,product_id,movement_type,quantity,reference_type,note,created_by)
 values(p_business_id,p_product_id,'in',p_quantity,'manual_receipt',left(p_note,500),v_uid) returning id into v_id;
 return v_id;
end; $$;

create or replace function public.post_order_stock_out()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 insert into public.stock_movements(business_id,product_id,movement_type,quantity,reference_type,reference_id,note,created_by)
 values(new.business_id,new.product_id,'out',new.quantity,'order',new.order_id,'Automatic stock issue for order',auth.uid());
 return new;
end; $$;
drop trigger if exists trg_order_item_stock_out on public.order_items;
create trigger trg_order_item_stock_out after insert on public.order_items
for each row execute function public.post_order_stock_out();

create or replace view public.product_stock_balances
with (security_invoker=true) as
select p.business_id,p.id as product_id,p.sku,p.name,p.unit,p.reorder_level,
 coalesce(sum(case when sm.movement_type='in' then sm.quantity
                   when sm.movement_type='out' then -sm.quantity
                   when sm.movement_type='adjustment' then sm.quantity else 0 end),0)::numeric(14,3) as on_hand
from public.products p left join public.stock_movements sm
 on sm.product_id=p.id and sm.business_id=p.business_id
group by p.business_id,p.id,p.sku,p.name,p.unit,p.reorder_level;

revoke all on function public.record_stock_receipt(uuid,uuid,numeric,text) from public,anon;
grant execute on function public.record_stock_receipt(uuid,uuid,numeric,text) to authenticated;
revoke all on function public.post_order_stock_out() from public,anon,authenticated;
grant select on public.product_stock_balances to authenticated;
