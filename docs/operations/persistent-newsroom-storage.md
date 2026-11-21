# GLOBAL FUNN persistent newsroom storage

This setup is intentionally separate from the existing `wild-lilly-db` and `retailpulse` Supabase projects. Do not apply it to either of those projects.

## What it creates

- `newsroom_stories`: owner-scoped story records, status and flexible JSON story payload.
- `newsroom_story_sources`: source links and verification state, constrained to a story owned by the same user.
- `newsroom_corrections`: correction history, constrained to the same story owner.
- Indexes for owner/status/time-based dashboard queries.
- Row Level Security on all three tables. Authenticated users can access only rows whose `owner_id` equals `auth.uid()`; anonymous access is revoked.

## Safe setup sequence

1. Create/select a dedicated GLOBAL FUNN Supabase project in the intended organization and region. Do not reuse a project belonging to another app.
2. Review `supabase/sql/newsroom_storage.sql` and apply it in that dedicated project's SQL Editor.
3. In Supabase Auth, disable open public sign-ups for a private newsroom. Add the newsroom owner/editor accounts deliberately; require email verification and use strong passwords or an approved SSO method.
4. In Project Settings / Connect, obtain the project URL and publishable key. Put them in local `.env.local` and the deployment provider's environment settings. Never commit real keys.
5. Use the documented `@supabase/ssr` cookie-based server/client integration. Validate the signed-in user on server-side protected routes; rely on RLS as the database authorization boundary too.
6. Test with two separate authenticated users: user A must not read, update, or delete user B's story, sources, or corrections. Also test unauthenticated requests return no rows and cannot write.
7. Run Supabase Security and Performance Advisors after applying the schema.

## Important boundaries

- This is a reviewed bootstrap SQL script, not yet an applied database migration.
- No database project was created or modified by this change.
- No Supabase URL/key is configured in this repository, so the web app is not connected yet.
- The existing browser-local drafts are not automatically migrated. Add a reviewed export/import step before moving any real drafts.
- This schema stores source URLs and editorial metadata, not media binaries. Use a separate private Storage bucket and owner-scoped policies if media persistence is added.
- No service-role or secret key belongs in browser code or any `NEXT_PUBLIC_` variable.
- A successful SQL execution and cross-user isolation test are required before calling persistent storage live.

## Current environment placeholders

The repository's `.env.example` contains only:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Install and pin `@supabase/ssr` and `@supabase/supabase-js` with a committed lockfile when the dedicated project is ready to connect. Follow the current Supabase Next.js SSR guide rather than copying stale auth middleware examples.
