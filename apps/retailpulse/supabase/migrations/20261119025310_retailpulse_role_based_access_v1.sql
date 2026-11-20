
create or replace function private.has_business_role(p_business_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_memberships as m
    where m.business_id = p_business_id
      and m.user_id = (select auth.uid())
      and m.active = true
      and m.role = any(p_roles)
  );
$$;

revoke all on function private.has_business_role(uuid, text[]) from public;
revoke all on function private.has_business_role(uuid, text[]) from anon;
grant execute on function private.has_business_role(uuid, text[]) to authenticated;

drop policy if exists retailers_insert_member on public.retailers;
drop policy if exists retailers_update_member on public.retailers;
drop policy if exists retailers_delete_member on public.retailers;
create policy retailers_insert_managers on public.retailers
for insert to authenticated with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy retailers_update_managers on public.retailers
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy retailers_delete_owners on public.retailers
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists products_insert_member on public.products;
drop policy if exists products_update_member on public.products;
drop policy if exists products_delete_member on public.products;
create policy products_insert_managers on public.products
for insert to authenticated with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy products_update_managers on public.products
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy products_delete_owners on public.products
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists orders_insert_member on public.orders;
drop policy if exists orders_update_member on public.orders;
drop policy if exists orders_delete_member on public.orders;
create policy orders_insert_roles on public.orders
for insert to authenticated with check (
  placed_by = (select auth.uid())
  and (select private.has_business_role(business_id, array['owner','manager','salesperson']::text[]))
);
create policy orders_update_managers on public.orders
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy orders_delete_owners on public.orders
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists order_items_insert_member on public.order_items;
drop policy if exists order_items_update_member on public.order_items;
drop policy if exists order_items_delete_member on public.order_items;
create policy order_items_insert_roles on public.order_items
for insert to authenticated with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (
    (select private.has_business_role(business_id, array['salesperson']::text[]))
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.business_id = business_id and o.placed_by = (select auth.uid())
    )
  )
);
create policy order_items_update_managers on public.order_items
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy order_items_delete_owners on public.order_items
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists collections_insert_member on public.collections;
drop policy if exists collections_update_member on public.collections;
drop policy if exists collections_delete_member on public.collections;
create policy collections_insert_roles on public.collections
for insert to authenticated with check (
  collected_by = (select auth.uid())
  and (select private.has_business_role(business_id, array['owner','manager','salesperson']::text[]))
);
create policy collections_update_managers on public.collections
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy collections_delete_owners on public.collections
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists stock_movements_insert_member on public.stock_movements;
drop policy if exists stock_movements_update_member on public.stock_movements;
drop policy if exists stock_movements_delete_member on public.stock_movements;
create policy stock_movements_insert_managers on public.stock_movements
for insert to authenticated with check (
  created_by = (select auth.uid())
  and (select private.has_business_role(business_id, array['owner','manager']::text[]))
);
create policy stock_movements_update_managers on public.stock_movements
for update to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])))
with check ((select private.has_business_role(business_id, array['owner','manager']::text[])));
create policy stock_movements_delete_owners on public.stock_movements
for delete to authenticated using ((select private.has_business_role(business_id, array['owner']::text[])));

drop policy if exists field_visits_insert_member on public.field_visits;
drop policy if exists field_visits_update_member on public.field_visits;
drop policy if exists field_visits_delete_member on public.field_visits;
create policy field_visits_insert_roles on public.field_visits
for insert to authenticated with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (
    salesperson_id = (select auth.uid())
    and (select private.has_business_role(business_id, array['salesperson']::text[]))
  )
);
create policy field_visits_update_roles on public.field_visits
for update to authenticated using (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (salesperson_id = (select auth.uid()) and (select private.has_business_role(business_id, array['salesperson']::text[])))
) with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (salesperson_id = (select auth.uid()) and (select private.has_business_role(business_id, array['salesperson']::text[])))
);
create policy field_visits_delete_managers on public.field_visits
for delete to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])));

drop policy if exists daily_reports_insert_member on public.daily_reports;
drop policy if exists daily_reports_update_member on public.daily_reports;
drop policy if exists daily_reports_delete_member on public.daily_reports;
create policy daily_reports_insert_roles on public.daily_reports
for insert to authenticated with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (
    salesperson_id = (select auth.uid())
    and (select private.has_business_role(business_id, array['salesperson']::text[]))
  )
);
create policy daily_reports_update_roles on public.daily_reports
for update to authenticated using (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (salesperson_id = (select auth.uid()) and (select private.has_business_role(business_id, array['salesperson']::text[])))
) with check (
  (select private.has_business_role(business_id, array['owner','manager']::text[]))
  or (salesperson_id = (select auth.uid()) and (select private.has_business_role(business_id, array['salesperson']::text[])))
);
create policy daily_reports_delete_managers on public.daily_reports
for delete to authenticated using ((select private.has_business_role(business_id, array['owner','manager']::text[])));
