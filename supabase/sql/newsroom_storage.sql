-- GLOBAL FUNN newsroom persistence bootstrap.
-- Apply only to a dedicated GLOBAL FUNN Supabase project after reviewing this file.
-- Every record is private to its authenticated owner; no anon/public policies exist.

create table if not exists public.newsroom_stories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  headline text not null check (char_length(btrim(headline)) between 1 and 300),
  slug text,
  status text not null default 'inbox'
    check (status in ('inbox','researching','needs_review','approved','rejected','published','archived')),
  story_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(story_data) = 'object'),
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table if not exists public.newsroom_story_sources (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_url text not null check (char_length(source_url) between 1 and 2048),
  source_title text,
  source_type text not null default 'article'
    check (source_type in ('article','official_statement','document','dataset','interview','other')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','reviewing','corroborated','disputed','rejected')),
  notes text,
  created_at timestamptz not null default now(),
  constraint newsroom_sources_story_owner_fk
    foreign key (story_id, owner_id)
    references public.newsroom_stories(id, owner_id) on delete cascade
);

create table if not exists public.newsroom_corrections (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  correction text not null check (char_length(btrim(correction)) between 1 and 10000),
  reason text,
  corrected_at timestamptz not null default now(),
  constraint newsroom_corrections_story_owner_fk
    foreign key (story_id, owner_id)
    references public.newsroom_stories(id, owner_id) on delete cascade
);

create index if not exists newsroom_stories_owner_updated_idx
  on public.newsroom_stories(owner_id, updated_at desc);
create index if not exists newsroom_stories_owner_status_idx
  on public.newsroom_stories(owner_id, status, updated_at desc);
create index if not exists newsroom_sources_story_idx
  on public.newsroom_story_sources(story_id, created_at desc);
create index if not exists newsroom_corrections_story_idx
  on public.newsroom_corrections(story_id, corrected_at desc);

alter table public.newsroom_stories enable row level security;
alter table public.newsroom_story_sources enable row level security;
alter table public.newsroom_corrections enable row level security;

drop policy if exists "owners manage their newsroom stories" on public.newsroom_stories;
create policy "owners manage their newsroom stories"
  on public.newsroom_stories for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "owners manage their story sources" on public.newsroom_story_sources;
create policy "owners manage their story sources"
  on public.newsroom_story_sources for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.newsroom_stories s
      where s.id = story_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists "owners manage their story corrections" on public.newsroom_corrections;
create policy "owners manage their story corrections"
  on public.newsroom_corrections for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.newsroom_stories s
      where s.id = story_id and s.owner_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on
  public.newsroom_stories,
  public.newsroom_story_sources,
  public.newsroom_corrections
to authenticated;
revoke all on
  public.newsroom_stories,
  public.newsroom_story_sources,
  public.newsroom_corrections
from anon;
