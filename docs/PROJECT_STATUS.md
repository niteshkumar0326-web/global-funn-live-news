# GLOBAL FUNN LIVE NEWS — Project Status

Updated: 2026-11-10

## Repository
- GitHub: `niteshkumar0326-web/global-funn-live-news`
- Default branch: `main`
- Visibility: Public (owner can change this in GitHub settings)

## Implemented routes
- `/` — newsroom dashboard and module navigation
- `/story-intake` — story submission with browser-local persistence
- `/stories` — local editorial queue, source links and JSON export
- `/verification` — interactive browser-local editorial verification checklist with progress indicator and sample proof card
- `/regional-desks` — directory for 28 states and 8 Union Territories
- `/international` — six regional international desks
- `/archive` — correction/update register prototype\n- `/broadcast` — local programme rundown builder with segment ordering, presenter scripts, timing and text export
- `/cloud` — server-side environment readiness check for the planned Supabase connection

## Project assets and safeguards
- Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons
- Responsive dark navy / royal blue / gold newsroom visual system
- Editorial policy and README
- `.gitignore`
- GitHub Actions workflow to run the Next.js production build on pushes and pull requests

## Current story data behavior
- Story submissions are saved in browser localStorage on the current device/browser.
- The story queue reads those local records and allows JSON export.
- Deleting a queue item deletes that browser-local record.
- Local browser storage is not a server database, not a multi-user system and not a cloud backup. Export JSON and store it securely until cloud persistence is implemented.
- Stories remain Not Verified by default. A URL alone never makes a story verified. Human editor review is required.

## Not implemented / not connected
- Broadcast rundowns are also saved in browser localStorage on the current device only.\n- No production database or durable server-side story storage
- Supabase cloud setup guide, safe `.env.example`, and an initial SQL schema/RLS draft are committed; no Supabase project or credentials are connected
- No authentication, reporter/editor roles or access controls
- No automated source verification or fact-checking
- No live news API/feed connection
- No correspondent/field reporting ingestion
- No public story publishing or social publishing workflow
- No hosting/deployment configured or verified
- No Dropbox or OneDrive project mirror configured

## Next milestones
1. Obtain explicit owner approval for the Supabase organization and any project cost; then create/select a project and configure deployment environment variables.
2. Review and test the draft migration in `supabase/migrations/0001_initial_schema_draft.sql` before applying it; then connect authentication.
3. Implement server-side story records, evidence references and immutable audit trail.
4. Add reporter/editor roles and explicit approval transitions.
5. Add source-link checks and human review tools; never auto-label a story verified solely because a URL exists.
6. Add safe, permissioned news-feed integrations and monitoring.
7. Add backups to approved cloud destinations.
8. Confirm CI build status and resolve any reported errors before deployment.
