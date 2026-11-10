-- GLOBAL FUNN LIVE NEWS
-- Draft migration for review before applying to Supabase.
-- Apply only after the Supabase project is created and reviewed.
-- All exposed tables use RLS. Roles must be assigned by a trusted admin process.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('reporter', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.news_stories (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  body text not null default '',
  desk text not null,
  location text,
  status text not null default 'developing'
    check (status in ('confirmed', 'developing', 'disputed', 'not_verified')),
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((approved_by is null) = (approved_at is null))
);

create table if not exists public.story_sources (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.news_stories(id) on delete cascade,
  source_name text not null,
  source_url text not null,
  published_at timestamptz,
  checked_by uuid references auth.users(id),
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.story_corrections (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.news_stories(id) on delete cascade,
  correction_note text not null,
  previous_text text,
  corrected_text text,
  changed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.has_news_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.news_stories enable row level security;
alter table public.story_sources enable row level security;
alter table public.story_corrections enable row level security;

-- Profiles: users can read and update only their own profile.
create policy "profile read own" on public.user_profiles
for select to authenticated using (user_id = auth.uid());
create policy "profile update own" on public.user_profiles
for update to authenticated using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Roles are readable only by the user or an admin; no client-side role writes.
create policy "role read own or admin" on public.user_roles
for select to authenticated
using (user_id = auth.uid() or public.has_news_role('admin'));

-- Stories: authenticated team members can read; reporters can create their own.
create policy "stories team read" on public.news_stories
for select to authenticated using (true);
create policy "reporter create own story" on public.news_stories
for insert to authenticated
with check (created_by = auth.uid() and approved_by is null and approved_at is null
  and published_at is null);
create policy "editor update stories" on public.news_stories
for update to authenticated
using (public.has_news_role('editor') or public.has_news_role('admin'))
with check (public.has_news_role('editor') or public.has_news_role('admin'));

-- Sources and correction history: team read; editors/admins manage.
create policy "sources team read" on public.story_sources
for select to authenticated using (true);
create policy "editors add sources" on public.story_sources
for insert to authenticated
with check (public.has_news_role('editor') or public.has_news_role('admin'));
create policy "editors update sources" on public.story_sources
for update to authenticated
using (public.has_news_role('editor') or public.has_news_role('admin'))
with check (public.has_news_role('editor') or public.has_news_role('admin'));

create policy "corrections team read" on public.story_corrections
for select to authenticated using (true);
create policy "editors record corrections" on public.story_corrections
for insert to authenticated
with check ((public.has_news_role('editor') or public.has_news_role('admin'))
  and changed_by = auth.uid());

grant select, update on public.user_profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update on public.news_stories to authenticated;
grant select, insert, update on public.story_sources to authenticated;
grant select, insert on public.story_corrections to authenticated;

-- IMPORTANT REVIEW ITEMS:
-- 1. Do not expose these tables through the Data API until reviewed.
-- 2. Assign roles only through trusted admin tooling, never a public signup form.
-- 3. Add desk-level permissions and stricter publication workflow before launch.
-- 4. Add storage policies for uploaded evidence/media separately.
-- 5. Test every policy with reporter, editor, admin, and anonymous sessions.
-- 6. Consider a trigger for updated_at and immutable audit logging before production.
