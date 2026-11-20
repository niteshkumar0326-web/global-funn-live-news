
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  preferred_language text not null default 'en' check (preferred_language in ('en','hi')),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('owner','manager','salesperson')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, user_id),
  unique (id, business_id)
);

create table public.retailers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  phone text,
  address text,
  area text,
  credit_limit numeric(12,2) not null default 0 check (credit_limit >= 0),
  opening_balance numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  sku text not null,
  name text not null check (length(trim(name)) between 1 and 160),
  unit text not null default 'pcs',
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  purchase_price numeric(12,2) not null default 0 check (purchase_price >= 0),
  reorder_level numeric(12,3) not null default 0 check (reorder_level >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, sku),
  unique (id, business_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  retailer_id uuid not null,
  order_number text not null,
  status text not null default 'received' check (status in ('received','confirmed','processing','packed','dispatched','delivered','cancelled')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  placed_by uuid references auth.users(id) on delete set null,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, order_number),
  unique (id, business_id),
  foreign key (retailer_id, business_id) references public.retailers(id, business_id) on delete restrict,
  check (discount <= subtotal)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  order_id uuid not null,
  product_id uuid not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  foreign key (order_id, business_id) references public.orders(id, business_id) on delete restrict,
  foreign key (product_id, business_id) references public.products(id, business_id) on delete restrict
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  retailer_id uuid not null,
  order_id uuid,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('cash','upi','bank_transfer','cheque','other')),
  reference text,
  collected_by uuid references auth.users(id) on delete set null,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (retailer_id, business_id) references public.retailers(id, business_id) on delete restrict,
  foreign key (order_id, business_id) references public.orders(id, business_id) on delete restrict
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  product_id uuid not null,
  movement_type text not null check (movement_type in ('opening','purchase','sale','return','adjustment','damage')),
  quantity numeric(12,3) not null check (quantity <> 0),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (product_id, business_id) references public.products(id, business_id) on delete restrict
);

create table public.field_visits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  retailer_id uuid,
  salesperson_id uuid references auth.users(id) on delete set null,
  visit_status text not null default 'planned' check (visit_status in ('planned','visited','not_available','order_taken','payment_collected')),
  notes text,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (retailer_id, business_id) references public.retailers(id, business_id) on delete restrict
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  salesperson_id uuid not null references auth.users(id) on delete restrict,
  report_date date not null,
  visits_count integer not null default 0 check (visits_count >= 0),
  orders_count integer not null default 0 check (orders_count >= 0),
  collection_total numeric(12,2) not null default 0 check (collection_total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, salesperson_id, report_date)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index retailers_business_name_idx on public.retailers(business_id, name);
create index products_business_name_idx on public.products(business_id, name);
create index orders_business_placed_at_idx on public.orders(business_id, placed_at desc);
create index orders_business_status_idx on public.orders(business_id, status);
create index collections_business_collected_at_idx on public.collections(business_id, collected_at desc);
create index collections_business_retailer_idx on public.collections(business_id, retailer_id);
create index stock_movements_business_product_idx on public.stock_movements(business_id, product_id, created_at desc);
create index field_visits_business_date_idx on public.field_visits(business_id, visited_at desc);
create index daily_reports_business_date_idx on public.daily_reports(business_id, report_date desc);
create index audit_events_business_created_idx on public.audit_events(business_id, created_at desc);
create index memberships_user_business_idx on public.business_memberships(user_id, business_id) where active;

create or replace function private.has_business_access(p_business_id uuid)
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
  );
$$;

revoke all on function private.has_business_access(uuid) from public;
grant execute on function private.has_business_access(uuid) to authenticated;

alter table public.businesses enable row level security;
alter table public.business_memberships enable row level security;
alter table public.retailers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.collections enable row level security;
alter table public.stock_movements enable row level security;
alter table public.field_visits enable row level security;
alter table public.daily_reports enable row level security;
alter table public.audit_events enable row level security;

create policy businesses_select_member on public.businesses
for select to authenticated using ((select private.has_business_access(id)));

create policy memberships_select_self on public.business_memberships
for select to authenticated using (user_id = (select auth.uid()));

create policy retailers_select_member on public.retailers
for select to authenticated using ((select private.has_business_access(business_id)));
create policy retailers_insert_member on public.retailers
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy retailers_update_member on public.retailers
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy retailers_delete_member on public.retailers
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy products_select_member on public.products
for select to authenticated using ((select private.has_business_access(business_id)));
create policy products_insert_member on public.products
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy products_update_member on public.products
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy products_delete_member on public.products
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy orders_select_member on public.orders
for select to authenticated using ((select private.has_business_access(business_id)));
create policy orders_insert_member on public.orders
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy orders_update_member on public.orders
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy orders_delete_member on public.orders
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy order_items_select_member on public.order_items
for select to authenticated using ((select private.has_business_access(business_id)));
create policy order_items_insert_member on public.order_items
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy order_items_update_member on public.order_items
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy order_items_delete_member on public.order_items
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy collections_select_member on public.collections
for select to authenticated using ((select private.has_business_access(business_id)));
create policy collections_insert_member on public.collections
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy collections_update_member on public.collections
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy collections_delete_member on public.collections
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy stock_movements_select_member on public.stock_movements
for select to authenticated using ((select private.has_business_access(business_id)));
create policy stock_movements_insert_member on public.stock_movements
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy stock_movements_update_member on public.stock_movements
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy stock_movements_delete_member on public.stock_movements
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy field_visits_select_member on public.field_visits
for select to authenticated using ((select private.has_business_access(business_id)));
create policy field_visits_insert_member on public.field_visits
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy field_visits_update_member on public.field_visits
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy field_visits_delete_member on public.field_visits
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy daily_reports_select_member on public.daily_reports
for select to authenticated using ((select private.has_business_access(business_id)));
create policy daily_reports_insert_member on public.daily_reports
for insert to authenticated with check ((select private.has_business_access(business_id)));
create policy daily_reports_update_member on public.daily_reports
for update to authenticated using ((select private.has_business_access(business_id))) with check ((select private.has_business_access(business_id)));
create policy daily_reports_delete_member on public.daily_reports
for delete to authenticated using ((select private.has_business_access(business_id)));

create policy audit_events_select_member on public.audit_events
for select to authenticated using ((select private.has_business_access(business_id)));

grant select on public.businesses, public.business_memberships, public.audit_events to authenticated;
grant select, insert, update, delete on public.retailers, public.products, public.orders, public.order_items, public.collections, public.stock_movements, public.field_visits, public.daily_reports to authenticated;
