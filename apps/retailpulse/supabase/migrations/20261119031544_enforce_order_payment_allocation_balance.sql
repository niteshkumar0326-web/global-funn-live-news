create or replace function public.record_retailer_collection(
 p_business_id uuid,
 p_retailer_id uuid,
 p_amount numeric,
 p_method text,
 p_order_id uuid default null,
 p_reference text default null
) returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
 v_uid uuid := auth.uid();
 v_role text;
 v_id uuid;
 v_order_total numeric;
 v_paid numeric;
begin
 if v_uid is null then raise exception 'Sign in required'; end if;
 select bm.role into v_role
 from public.business_memberships bm
 where bm.business_id=p_business_id and bm.user_id=v_uid and bm.active=true
 limit 1;
 if v_role is null or v_role not in ('owner','manager','salesperson') then
  raise exception 'Active business membership required';
 end if;
 if p_amount is null or p_amount<=0 or p_amount>100000000 then
  raise exception 'Enter a valid positive collection amount';
 end if;
 if p_method not in ('cash','upi','bank_transfer','cheque','other') then
  raise exception 'Unsupported payment method';
 end if;
 perform 1 from public.retailers r
 where r.id=p_retailer_id and r.business_id=p_business_id and r.active=true
 for update;
 if not found then raise exception 'Active retailer not found in this business'; end if;
 if p_order_id is not null then
  select o.total into v_order_total
  from public.orders o
  where o.id=p_order_id and o.business_id=p_business_id and o.retailer_id=p_retailer_id
  for update;
  if not found then raise exception 'Order does not belong to this retailer and business'; end if;
  select coalesce(sum(c.amount),0) into v_paid
  from public.collections c
  where c.business_id=p_business_id and c.order_id=p_order_id;
  if p_amount > greatest(v_order_total-v_paid,0) then
   raise exception 'Collection exceeds the remaining balance on this order';
  end if;
 end if;
 insert into public.collections(business_id,retailer_id,order_id,amount,method,reference,collected_by)
 values(p_business_id,p_retailer_id,p_order_id,p_amount,p_method,left(coalesce(p_reference,''),200),v_uid)
 returning id into v_id;
 insert into public.audit_events(business_id,actor_id,action,entity_type,entity_id,safe_metadata)
 values(p_business_id,v_uid,'collection.recorded','collection',v_id,
 jsonb_build_object('method',p_method,'amount',p_amount,'retailer_id',p_retailer_id,'order_id',p_order_id));
 return v_id;
end;
$function$;