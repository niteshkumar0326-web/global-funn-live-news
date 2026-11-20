# RetailPulse database migrations

This directory contains the ordered SQL migration history recovered from the connected dedicated RetailPulse Supabase project's `supabase_migrations.schema_migrations` table on 2026-11-20.

## Important

- The hosted project already has these migrations recorded as applied. **Do not apply this recovered history to that existing project again.**
- This history is intended to make a clean development/test database reproducible and to support schema review.
- Before connecting a fresh project, use the Supabase CLI migration workflow and verify that all migrations apply in timestamp order.
- Compare the resulting schema, function definitions, grants, RLS policies and views with the hosted project before treating the reconstruction as equivalent.
- Never put Supabase service-role keys, access tokens, customer data or production credentials in this repository.
- Keep new schema changes in a new timestamped SQL file; never edit an already-applied migration.

## Fresh local database

From the repository root, initialize/configure Supabase CLI for this app if it is not already configured, then run the standard local Supabase start/reset workflow against a disposable local database. Review every SQL migration before applying it. Do not link or push these historical migrations to the existing hosted project.

## Provenance

The files were exported from the project's recorded migration statements, preserving their original versions, names and order. This repairs the source-control history gap; it does not certify production security or prove two-tenant authorization tests have passed.
