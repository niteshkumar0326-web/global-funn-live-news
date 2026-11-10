# GLOBAL FUNN LIVE NEWS — Cloud setup

## Current state
The GitHub application is built, but no Supabase project is currently connected to this account. The `/cloud` page is a readiness check only. It does not imply a database, authentication, or cloud sync is active.

## Connect a project
1. Create or select a Supabase project in the intended organization and region.
2. In Supabase, open the project's Connect dialog and copy the Project URL and Publishable key.
3. Add them to the deployment environment as:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. For local development, copy `.env.example` to `.env.local`.
5. Never expose a Supabase secret key or legacy service_role key in browser code or any `NEXT_PUBLIC_*` variable.

## Planned newsroom data model
- `profiles`: Auth user ID, display name, newsroom role (assigned only by a trusted admin process).
- `stories`: headline, body, desk, location, status, created_by, assigned_editor, timestamps.
- `story_sources`: story ID, source title, URL, publisher, published_at, evidence notes.
- `story_reviews`: story ID, reviewer, decision, notes, reviewed_at.
- `story_revisions`: append-only correction/update history with author and timestamp.

An initial draft migration is committed at `supabase/migrations/0001_initial_schema_draft.sql`. It currently uses `user_profiles`, `user_roles`, `news_stories`, `story_sources`, and `story_corrections`; this is a working draft and supersedes the conceptual names above for implementation planning. It has not been applied to any database.

## Security requirements before enabling data access
- Enable RLS on every exposed table.
- Reporters may create and view their permitted submissions; they must not approve or publish.
- Editors may review and change editorial status within assigned permissions.
- Role assignments must not trust user-editable auth metadata.
- Public readers must not see drafts or private reporter details.
- No service-role or secret key in the client bundle.
- Verify policies with authenticated and unauthenticated test cases before launch.

## Current limitations
No database project, tables, auth providers, credentials, live sync, or deployment environment is connected yet. The SQL migration in the repository is a draft only; it has not been run or security-tested against a live Supabase project. Story Queue and Broadcast Desk remain browser-local until the database integration is implemented and tested.
