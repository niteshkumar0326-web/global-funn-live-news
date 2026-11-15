# Gate A — Database Foundation Design

Date: 2026-11-15
Status: Owner-directed design; implementation is authorized within the boundaries below.

## Intent

Prepare GLOBAL FUNN for durable, server-side newsroom records so scheduled news intake and routine publication can run automatically across devices and workers. The owner has directed that routine qualifying videos should not require per-video manual approval. This is not authorization to bypass evidence, safety, rights, platform, credential or quota requirements.

## Current state observed

- The application is a Next.js App Router project. Most newsroom records currently live in browser localStorage; media files use browser IndexedDB.
- `docs/PROJECT_STATUS.md` says there is no production database, server-side story storage, authentication, role system, or live feed connection.
- `supabase/migrations/0001_initial_schema_draft.sql` is explicitly a draft. It creates profiles, roles, stories, sources and corrections with RLS, but it does not yet provide a source registry, durable ingest-job ledger, global deduplication keys, or a complete immutable audit trail.
- Supabase is a candidate only; no project or credentials are connected. No paid project will be provisioned as part of this work.
- The editorial policy is being aligned to owner-authorized automatic publication for routine items, with fail-closed safety gates and human review only for exceptions.

## Goals

1. Establish a durable data model for stories, source records, evidence references, feed/source registry, ingest runs, publication jobs, and audit events.
2. Enforce global deduplication at the database boundary, including concurrent worker attempts.
3. Keep role assignment privileged and preserve owner-controlled emergency pause.
4. Preserve correction history and record every automated workflow transition.
5. Permit routine automatic publication only after all evidence, rights, safety, technical and platform checks pass.
6. Hold sensitive, disputed, unsupported or uncertain stories rather than publishing them automatically.
7. Make schema changes reviewable and testable before any live database migration.

## Non-goals

- Bypassing source verification, copyright, YouTube rules, API quota or OAuth authorization.
- Publishing when a dependency fails or evidence is incomplete.
- Creating or paying for a Supabase project without the necessary account/billing authorization.
- Committing credentials or exposing privileged keys in browser code.
- Replacing the current browser-local newsroom or migrating personal/browser data without a migration plan.

## Approaches considered

### A. Replace the existing draft migration

Rewrite `0001_initial_schema_draft.sql` as a complete production schema. This risks obscuring the change history and is not recommended.

### B. Add a separately numbered Gate A migration (recommended)

Keep the existing draft intact. Add a follow-on migration for source registry, ingest runs, deduplication, publication jobs, evidence metadata and audit controls; tighten policies with explicit SQL changes. This preserves history and makes review/rollback boundaries clearer.

### C. Add application endpoints before a durable database exists

Build endpoints against placeholder/local storage. This risks creating a false impression of cloud persistence and is not recommended.

## Proposed design

- **Stories:** canonical story identity, headline/body, desk/location, editorial status, created/updated timestamps and approval/decision metadata. Automated publication decisions must be represented distinctly from human review; never forge a human approver identity.
- **Sources and evidence:** normalized source URL, publisher, source publication time, first-observed time, canonical URL, evidence note/reference and verification metadata. A URL is not itself proof.
- **Source registry:** allowlisted RSS/API sources with enabled state, polling interval, last-success time and health/error state. No external feed credentials in browser-visible settings.
- **Ingest runs:** one row per scheduled/manual run, status, start/end time, source, fetched count, inserted count, duplicate count and safe error summary. Use locking/idempotency so overlapping runs cannot create duplicate work.
- **Deduplication:** normalized canonical URL plus stable fingerprint/unique constraints; store event/story identity where available. Application checks alone are insufficient.
- **Publication jobs:** durable queue with idempotency key, eligibility result, hold reason, retry count, media hash, upload ID, state and timestamps. Publishing is allowed only after all automated gates pass.
- **Audit events:** append-only records for story creation, evidence checks, status changes, automated eligibility decisions, corrections and publication attempts. Ordinary client roles must not update or delete audit events.
- **Security:** RLS enabled on every exposed table; no anonymous access; role writes restricted to trusted admin tooling; no service-role key in browser code; least-privilege grants. Add policy tests for anonymous, reporter, editor and admin roles.
- **Automated publication:** no per-video manual approval for routine eligible stories. Fail closed on missing evidence, source conflicts, stale feeds, duplicate uncertainty, rights issues, safety flags, failed media QC or unavailable policy checks. Route exception cases to a human review queue. Provide owner emergency pause.
- **Secrets:** credentials only in encrypted server-side environment/secrets storage; never in source control, browser bundles or chat.

## Verification plan

1. Review the existing draft migration and document policy gaps before writing a follow-on migration.
2. Add SQL tests for RLS/role boundaries, immutable audit records, publication eligibility, emergency pause and deduplication under repeated/concurrent inserts.
3. Run static SQL checks and the repository build where tooling permits; report unavailable database-backed tests honestly.
4. Keep migrations unapplied until a real database project is connected and its target is verified.
5. Keep preview-only changes separate from production.
6. Before first public auto-publication, pass a dry-run pilot, private/unlisted test upload, audio/playback QC and quota checks.

## Constraints and decisions

- Platform: existing Supabase candidate and Next.js App Router; no new provider is introduced.
- The owner has directed fully automatic routine publishing with no per-video approval.
- Safety holds for sensitive, disputed, unsupported or uncertain stories remain mandatory.
- Schema and code can be prepared in GitHub without provisioning a billable service.
- Paid infrastructure, account OAuth consent and any external billing step cannot be completed without the account owner's own authorized action.
- No production database migration or production deployment is claimed by this design.

## Implementation direction

Proceed with Approach B: a separately numbered follow-on migration, preserving the existing draft. Build the schema and tests first, then dry-run intake, media generation/QC, and finally YouTube publishing integration. Routine publishing remains disabled until required infrastructure, OAuth and acceptance checks are actually available.
