-- GLOBAL FUNN — Gate A database contract tests.
-- Run only against the local Supabase stack: supabase test db.
-- These tests intentionally fail until migration 0002 is implemented.
begin;

create extension if not exists pgtap with schema extensions;
select plan(19);

-- Durable pipeline tables and required columns.
select has_table('public', 'news_feed_sources', 'feed registry exists');
select has_table('public', 'news_ingest_runs', 'ingest ledger exists');
select has_table('public', 'news_publication_jobs', 'publication queue exists');
select has_table('public', 'news_audit_events', 'audit ledger exists');
select has_table('public', 'news_pipeline_controls', 'owner pipeline controls exist');

select has_column('public', 'news_feed_sources', 'source_key', 'feed registry has stable source key');
select has_column('public', 'news_feed_sources', 'feed_url', 'feed registry stores feed URL');
select has_column('public', 'news_ingest_runs', 'run_key', 'ingest runs have idempotency key');
select has_column('public', 'news_publication_jobs', 'idempotency_key', 'publication jobs have idempotency key');
select has_column('public', 'news_publication_jobs', 'hold_reason', 'publication jobs expose hold reason');
select has_column('public', 'news_audit_events', 'event_data', 'audit events retain event payload');
select has_column('public', 'news_pipeline_controls', 'emergency_pause', 'owner can pause automation');

-- Every new public table must have RLS enabled.
select is(
  (select count(*)::integer
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in ('news_feed_sources', 'news_ingest_runs', 'news_publication_jobs',
                       'news_audit_events', 'news_pipeline_controls')
     and c.relrowsecurity),
  5,
  'RLS is enabled on all five pipeline tables'
);

-- No browser-facing role can access worker/audit records directly.
select ok(to_regclass('public.news_feed_sources') is null
          or not has_table_privilege('anon', to_regclass('public.news_feed_sources'), 'SELECT'),
  'anon cannot read feed registry');
select ok(to_regclass('public.news_ingest_runs') is null
          or not has_table_privilege('authenticated', to_regclass('public.news_ingest_runs'), 'INSERT'),
  'authenticated clients cannot create ingest runs');
select ok(to_regclass('public.news_publication_jobs') is null
          or not has_table_privilege('authenticated', to_regclass('public.news_publication_jobs'), 'INSERT'),
  'authenticated clients cannot enqueue publication jobs');
select ok(to_regclass('public.news_audit_events') is null
          or (not has_table_privilege('authenticated', to_regclass('public.news_audit_events'), 'UPDATE')
              and not has_table_privilege('authenticated', to_regclass('public.news_audit_events'), 'DELETE')),
  'authenticated clients cannot alter or delete audit history');

-- Eligibility must be enforced by a server-side function; its behavior is
-- tested in the follow-up integration suite after the function exists.
select has_function('public', 'news_story_is_publishable', array['uuid'],
  'server-side publication eligibility function exists');

select * from finish();
rollback;
