# Gate A — Database Foundation Design

Date: 2026-11-15
Status: Proposed design; implementation must wait for owner approval.

## Intent

Prepare GLOBAL FUNN for durable, server-side newsroom records so scheduled news intake can later run safely across devices and workers. The immediate outcome is a reviewed database foundation, not a live feed, public publishing, or a production database connection.

## Current state observed

- The application is a Next.js App Router project. Most newsroom records currently live in browser localStorage; media files use browser IndexedDB.
- `docs/PROJECT_STATUS.md` says there is no production database, server-side story storage, authentication, role system, or live feed connection.
- `supabase/migrations/0001_initial_schema_draft.sql` is explicitly a draft. It creates profiles, roles, stories, sources and corrections with RLS, but it does not yet provide a source registry, durable ingest-job ledger, global deduplication keys, or a complete immutable audit trail.
- `docs/EDITORIAL_POLICY.md` requires human editor approval before publication. This design preserves that rule.
- Supabase is a candidate only; no project or credentials are connected. No paid project will be provisioned as part of this work.

## Goals

1. Establish a durable data model for stories, source records, evidence references, feed/source registry, ingest runs, and audit events.
2. Enforce global deduplication at the database boundary, including concurrent worker attempts.
3. Keep role assignment privileged and prevent reporters from approving or publishing stories.
4. Preserve correction history and record who performed sensitive workflow transitions.
5. Keep all public publishing disabled. Initial intake work must be dry-run only.
6. Make schema changes reviewable and testable before any live database migration.

## Non-goals

- Creating or paying for a Supabase project.
- Connecting credentials or deploying server-side endpoints.
- Enabling scheduled polling, AI fact-checking, TTS, video rendering, or YouTube uploads.
- Replacing the current browser-local newsroom or migrating personal/browser data without an explicit migration plan.
- Removing the human editorial approval gate.

## Approaches considered

### A. Replace the existing draft migration

Rewrite `0001_initial_schema_draft.sql` as a complete production schema. This makes the first migration appear tidy, but risks changing an already reviewed draft in place and makes it harder to understand what changed.

### B. Add a separately numbered Gate A migration (recommended)

Keep the existing draft intact. Add a follow-on migration for source registry, ingest runs, deduplication, evidence metadata and audit controls; tighten any unsafe policies with explicit SQL changes. This preserves history and makes review/rollback boundaries clearer. No migration is applied to a live project.

### C. Add application endpoints before a durable database exists

Build Next.js endpoints against placeholder/local storage. This risks creating a false impression of cloud persistence and would have to be replaced once the real database is provisioned. Not recommended.

## Proposed design

- **Stories:** canonical story identity, headline/body, desk/location, editorial status, created/updated timestamps and explicit approval metadata. A database constraint/trigger must ensure only an authenticated editor/admin can set approval fields and the approver is the current authenticated user.
- **Sources and evidence:** normalized source URL, publisher, source publication time, first-observed time, canonical URL, evidence note/reference and verification metadata. A URL is not itself proof.
- **Source registry:** allowlisted RSS/API sources with enabled state, polling interval, last-success time and health/error state. No external feed credentials in browser-visible settings.
- **Ingest runs:** one row per scheduled/manual run, status, start/end time, source, fetched count, inserted count, duplicate count and safe error summary. Use a uniqueness/locking strategy so overlapping runs cannot create duplicate work.
- **Deduplication:** normalized canonical URL plus stable fingerprint/unique constraints; store event/story identity where available. Application checks alone are insufficient.
- **Audit events:** append-only records for story creation, status changes, approval, correction and future publication actions. Ordinary client roles must not update or delete audit events.
- **Security:** RLS enabled on every exposed table; no anonymous access; role writes restricted to trusted admin tooling; no service-role key in browser code; least-privilege grants. Add policy tests for anonymous, reporter, editor and admin roles.
- **Publication:** no publish endpoint or upload worker in Gate A. Approval remains a human action and later publishing must check the approved state server-side.

## Verification plan

1. Review the existing draft migration and document policy gaps before writing a follow-on migration.
2. Add SQL tests for RLS/role boundaries, immutable audit records, approval attribution and deduplication under repeated inserts.
3. Run static SQL checks and the repository build where tooling permits; report unavailable database-backed tests honestly.
4. Do not apply migrations until the owner has approved the database provider/project and the migration review is complete.
5. Keep preview-only changes separate from production.

## Constraints and decisions

- Platform: existing Supabase candidate and Next.js App Router; no new provider is introduced.
- Database schema can be prepared in GitHub without provisioning a billable service.
- Any database project creation, credentials, production migration, or deployment requires explicit owner authorization.
- The editorial policy remains human-approved. This design does not authorize unattended public publishing.

## Approval requested

Approve this Gate A design so the implementation plan and migration/test work can be prepared. The recommended approach is **B: a separately numbered follow-on migration**, preserving the current draft and keeping all live services disabled.
