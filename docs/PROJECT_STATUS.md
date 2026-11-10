# GLOBAL FUNN LIVE NEWS — Project Status

Updated: 2026-11-10

## Repository
- GitHub: `niteshkumar0326-web/global-funn-live-news`
- Default branch: `main`
- Visibility: Public (owner can change this in GitHub settings)

## Implemented routes
- `/` — newsroom dashboard and module navigation
- `/story-intake` — story submission with browser-local persistence, HTTP(S) primary-source validation and duplicate headline/source blocking
- `/stories` — local editorial queue, source links, correction recording, JSON export and draft/review/approved/rejected workflow markers
- `/verification` — interactive browser-local editorial verification checklist
- `/regional-desks` — directory for 28 states and 8 Union Territories
- `/international` — six regional international desks
- `/archive` — browser-local correction register connected to Story Queue records
- `/broadcast` — local programme rundown builder with segment ordering, presenter scripts, adjustable-font teleprompter mode, timing and text export
- `/cloud` — server-side environment readiness check for the planned Supabase connection

## Project assets and safeguards
- Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons
- Responsive dark navy / royal blue / gold newsroom visual system
- Editorial policy and README
- GitHub Actions workflow to run the Next.js production build on pushes and pull requests
- Source backup archive workflow

## Current story data behavior
- Story submissions are saved in browser localStorage on the current device/browser.
- The Story Queue reads those local records and allows JSON export.
- Editors can append correction records containing the previous headline, corrected headline, reason, editor, timestamp and optional evidence URL.
- The Archive page reads correction records from the same browser-local story store.
- Deleting a queue item deletes that browser-local record and its attached correction history; export a backup before deletion.
- Local browser storage is not a server database, not a multi-user system and not a cloud backup.
- Story intake requires a valid HTTP(S) primary-source URL, validates an optional second URL and blocks likely duplicate headlines or primary-source URLs already in this browser. This is a local duplicate guard, not global deduplication.
- Stories remain Not Verified by default. A URL alone never makes a story verified. Human editor review is required.
- Story Queue supports local workflow transitions: Draft → Submitted for Review → Approved or Rejected; rejected items may be resubmitted. Decisions record editor name, timestamp and optional/required reason as appropriate.
- The local Approved marker is not fact verification or publication permission. No public publishing action exists; workflow history is browser-editable and not authenticated.
- Verification checklist progress is also stored locally in the current browser.
- Dashboard Control Centre counts local drafts, correction records and broadcast segments from this browser; these are not cloud or server totals.

## Important limitations
- Correction history is browser-local and can be changed through browser storage; it is not a tamper-proof audit log or public transparency register.
- No production database or durable server-side story storage.
- Supabase setup guide, safe `.env.example`, and initial SQL/RLS draft are committed; no Supabase project or credentials are connected.
- No authentication, reporter/editor roles or access controls.
- No automated source verification or fact-checking.
- Broadcast Desk includes a browser-local teleprompter reader with adjustable text size; it is a script display aid only and does not fact-check, record video/audio or transmit.
- No live news API/feed connection or correspondent/field reporting ingestion.
- No public story publishing or social publishing workflow.
- No hosting/deployment configured or verified.
- Dropbox and OneDrive project folders, where present, are not verified full source backups.

## Next milestones
1. Obtain explicit owner approval for the Supabase organization and any project cost; do not create a project before approval.
2. Review and test the draft migration in `supabase/migrations/0001_initial_schema_draft.sql` before applying it.
3. Implement server-side story records, evidence references and a tamper-resistant audit trail.
4. Add authentication, reporter/editor roles and explicit approval transitions.
5. Add safe, permissioned news-feed integrations and source review tools.
6. Add backups to approved cloud destinations.
7. Verify CI and deploy only after production configuration and security review.
