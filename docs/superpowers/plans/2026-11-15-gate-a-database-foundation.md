# Gate A Database Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure, durable Supabase data foundation for scheduled GLOBAL FUNN news intake and automatic publication eligibility decisions.

**Architecture:** Preserve the existing Next.js App Router and initial draft migration. Add one forward-only Supabase migration for feed sources, ingest runs, publication jobs and append-only audit events, with database-enforced idempotency and fail-closed publication checks. Add pgTAP tests for role boundaries, duplicate prevention, audit immutability and emergency pause; do not connect or apply this to a paid/production database in this phase.

**Tech Stack:** PostgreSQL/Supabase SQL migrations, Row Level Security, pgTAP, existing Next.js 15 / TypeScript 5 project.

**Spec:** `docs/superpowers/specs/2026-11-15-gate-a-database-foundation-design.md`

## Global Constraints

- Keep the existing `supabase/migrations/0001_initial_schema_draft.sql` unchanged.
- Keep routine eligible publication automatic without per-video manual approval.
- Fail closed on missing, stale, conflicting or unavailable evidence and QC.
- Hold sensitive, disputed, unsupported, privacy-invasive or high-consequence stories for human review.
- No service-role key in browser code or `NEXT_PUBLIC_*` variables.
- No paid database provisioning, live migration, public upload or production deployment in Gate A.
- Do not claim cloud persistence until a real database is connected and verified.

## Review Focus

- Anonymous or untrusted clients attempting to read/write newsroom records — test every exposed table under anon and authenticated roles.
- A reporter attempting to set approval/publication fields or create a publish job — test that the database rejects it.
- Two workers inserting the same canonical story or enqueueing the same media package concurrently — test unique idempotency constraints.
- A client attempting to mutate/delete audit history — test append-only behavior.
- Missing/stale source evidence or emergency pause active — test automatic publication eligibility returns hold/false.

---

### Task 1: Add the Gate A database migration

**Files:**
- Create: `supabase/migrations/0002_automated_news_pipeline_foundation.sql`
- Preserve: `supabase/migrations/0001_initial_schema_draft.sql`

**Interfaces:**
- Consumes: existing `public.news_stories`, `public.story_sources`, `public.user_roles`, and `public.has_news_role(text)`.
- Produces: `public.news_feed_sources`, `public.news_ingest_runs`, `public.news_publication_jobs`, `public.news_audit_events`, and a server-side publication eligibility function.

- [ ] **Step 1: Write pgTAP tests** for source registry defaults, ingest-run uniqueness, publication-job idempotency, audit append-only behavior, reporter restrictions and fail-closed eligibility in `supabase/tests/database/0002_automated_news_pipeline_foundation.test.sql`.
- [ ] **Step 2: Run the focused test** with `npx supabase test db --local` and confirm it fails because the new tables/functions do not exist yet.
- [ ] **Step 3: Implement the migration** with RLS enabled on every new table; no anonymous policies; server-only writes for ingest and publication workers; unique constraints for source/run and package idempotency; immutable audit events; and an eligibility function that returns false/hold unless story evidence, rights, safety, QC and emergency-pause conditions are all satisfied.
- [ ] **Step 4: Run the focused pgTAP test** and confirm it passes; add explicit policy tests for anon, reporter, editor and admin identities.
- [ ] **Step 5: Review the SQL** for SECURITY DEFINER search_path pinning, least-privilege grants, safe function execute grants, and no accidental public exposure.
- [ ] **Step 6: Commit** as `feat(db): add automated newsroom pipeline foundation`.

### Task 2: Document safe environment and migration operation

**Files:**
- Modify: `.env.example`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/AUTOMATED_NEWS_PIPELINE.md`

**Interfaces:**
- Consumes: table names and server-only access model from Task 1.
- Produces: accurate environment variable names and operator instructions; no secret values.

- [ ] **Step 1: Add documentation checks** that ensure `.env.example` contains placeholders only and no credential values.
- [ ] **Step 2: Implement** server-only variable placeholders for the Supabase URL and service role key, clearly labelled server-only and never prefixed `NEXT_PUBLIC_`; do not add any real secret.
- [ ] **Step 3: Document** local migration/test commands, required environment setup, current non-connected state and the exact point at which a real project must be provisioned.
- [ ] **Step 4: Verify** `npm run build` and the available SQL tests; record any unavailable local Supabase/Docker dependency honestly.
- [ ] **Step 5: Commit** as `docs(db): document Gate A setup and verification`.

### Task 3: Verify branch readiness

**Files:**
- Review: all files changed by Tasks 1–2.

**Interfaces:**
- Consumes: migration, tests and setup docs.
- Produces: a verified draft PR update with clear limitations and no production claims.

- [ ] **Step 1: Run** `npm run build` and `npx supabase test db --local`.
- [ ] **Step 2: Inspect** the diff for secrets, policy bypasses, non-idempotent operations and unprotected tables.
- [ ] **Step 3: Confirm** no workflow, scheduler or public upload was accidentally enabled.
- [ ] **Step 4: Update** PR #5 description with exact test results and remaining infrastructure requirements.

