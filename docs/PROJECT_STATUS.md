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
- `/graphics` — local News Graphics Studio with square, landscape and vertical headline templates, live preview and SVG export
- `/media` — browser-local newsroom media library with file previews, category and rights tracking, download and metadata index export
- `/scripts` — bilingual English/Hindi presenter script workspace, YouTube copy and subtitle drafting with local save and TXT export
- `/research` — claim-by-claim evidence worksheet with source details, supporting/contradicting/context/unclear assessments and JSON export
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
- Research Desk records human-entered claim assessments only; it does not fetch URLs, compare documents, verify sources or perform AI fact-checking. Notes are browser-local and exportable as JSON.
- No automated source verification or fact-checking.
- Broadcast Desk includes a browser-local teleprompter reader with adjustable text size; it is a script display aid only and does not fact-check, record video/audio or transmit.
- No live news API/feed connection or correspondent/field reporting ingestion.
- News Graphics Studio exports editable SVG design files only. Its source reference field is a label, not a source validator; every graphic remains an editorial preview until a human editor checks facts, evidence and rights.
- Media Library stores selected files in this browser's IndexedDB only; no cloud upload, encrypted access control or cross-device sync. Exported index contains metadata only; original files need separate backup.
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


## Superpowers development workflow integration
- Selected upstream `obra/superpowers` skills are stored in `.agents/skills/`.
- Included: using-superpowers, brainstorming, writing-plans, test-driven-development, systematic-debugging, requesting-code-review, receiving-code-review and finishing-a-development-branch.
- Upstream MIT license notice is retained at `.agents/skills/SUPERPOWERS-LICENSE`.
- Repository-level instructions are in `AGENTS.md`; integration notes are in `docs/SUPERPOWERS-INTEGRATION.md`.
- This is a source-level skill integration only. It does not install a running agent into the deployed website, add AI news verification, or enable automated publishing. The imported set is selected, not a complete upstream mirror.


## Build 18 — Presenter & Brand Identity Studio
- Added `components/PresenterBrandStudio.tsx` and route `/presenter`.
- Editable presenter name, role, channel name, location and tagline.
- User-selected JPG/PNG/WebP image (900 KB maximum) shown in a live preview; no generated or substituted face.
- Three layouts: landscape broadcast, vertical presenter card and square channel identity.
- Exports an editable SVG layout. Review image rights, crop, spelling and editorial approval before use.
- Profile and selected image are stored in the current browser's localStorage only; no server upload or cross-device sync.
- Does not create a talking avatar, generate video, record, verify identity or publish to social platforms.


## Build 19 — Shared Presenter Identity
- News Graphics Studio reads the presenter profile saved by Presenter Studio and uses the channel name as its initial graphic label.
- The presenter photo is displayed in the graphics preview and embedded in the exported SVG when present.
- Broadcast Desk reads the same profile, pre-fills the anchor name when the default placeholder is still in use, and displays the selected presenter photo and profile details.
- Users can still edit the broadcast anchor independently.
- Both integrations read browser-local profile data from the same browser and device. This does not sync between devices or upload personal photos to the server.
- Existing graphics and broadcast editorial review safeguards remain in place; linking a presenter profile does not approve a story or authorise publication.


## Build 20 — Unified Video Production Workspace
- Added `components/VideoProductionWorkspace.tsx` and route `/production`.
- One production brief for programme title, producer/editor and production notes.
- Nine-step checklist links Story Queue, Research Desk, Verification, Script Studio, Broadcast Desk, Presenter Studio, Graphics Studio and Media Library.
- Progress indicator, local browser save and TXT production-sheet export.
- Completion is a self-attested checklist only; it does not verify evidence, authorise publication, record video or publish to any platform.
- Production data remains in the current browser and is not synced across devices or newsroom users.
- Dashboard navigation now links to Video Production.
