-- GLOBAL FUNN — Gate A database contract tests.
-- Run only against the local Supabase stack: supabase test db.
-- These tests intentionally fail until migration 0002 is implemented.
begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

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

-- No browser-facing role can access worker/audit/control records directly.
select ok(not has_table_privilege('anon', 'public.news_feed_sources', 'SELECT'),
  'anon cannot read feed registry');
select ok(not has_table_privilege('authenticated', 'public.news_ingest_runs', 'INSERT'),
  'authenticated clients cannot create ingest runs');
select ok(not has_table_privilege('authenticated', 'public.news_publication_jobs', 'INSERT'),
  'authenticated clients cannot enqueue publication jobs');
select ok(not has_table_privilege('authenticated', 'public.news_audit_events', 'UPDATE,DELETE'),
  'authenticated clients cannot alter audit history');

-- The eligibility function must fail closed for an unknown story.
select has_function('public', 'news_story_is_publishable', array['uuid'],
  'server-side publication eligibility function exists');
select is(public.news_story_is_publishable('00000000-0000-0000-0000-000000000000'::uuid),
  false, 'unknown story is never eligible for automatic publication');

select * from finish();
rollback;
