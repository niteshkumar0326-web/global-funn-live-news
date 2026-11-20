
create index audit_events_actor_id_idx on public.audit_events(actor_id);
create index collections_collected_by_idx on public.collections(collected_by);
create index collections_order_business_idx on public.collections(order_id, business_id);
create index collections_retailer_business_idx on public.collections(retailer_id, business_id);
create index daily_reports_salesperson_idx on public.daily_reports(salesperson_id);
create index field_visits_retailer_business_idx on public.field_visits(retailer_id, business_id);
create index field_visits_salesperson_idx on public.field_visits(salesperson_id);
create index order_items_business_idx on public.order_items(business_id);
create index order_items_order_business_idx on public.order_items(order_id, business_id);
create index order_items_product_business_idx on public.order_items(product_id, business_id);
create index orders_placed_by_idx on public.orders(placed_by);
create index orders_retailer_business_idx on public.orders(retailer_id, business_id);
create index stock_movements_created_by_idx on public.stock_movements(created_by);
create index stock_movements_product_business_idx on public.stock_movements(product_id, business_id);
