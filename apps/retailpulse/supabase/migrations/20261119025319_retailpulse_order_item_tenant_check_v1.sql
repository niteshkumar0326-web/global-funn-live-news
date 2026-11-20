
drop policy if exists order_items_insert_roles on public.order_items;
create policy order_items_insert_roles on public.order_items
for insert to authenticated with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (
    (select private.has_business_role(business_id, array['salesperson']::text[]))
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.business_id = public.order_items.business_id
        and o.placed_by = (select auth.uid())
    )
  )
);
