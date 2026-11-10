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


## Build 21 — Video & Audio Studio
- Added `components/VideoAudioStudio.tsx` and route `/video-studio`.
- Browser-local video/audio media bin with IndexedDB file storage (100 MB maximum per file).
- Preview for media supported by the user's browser, editable source in/out points, clip sequence ordering and production notes.
- Export a CSV edit decision list with clip order and trim-point metadata.
- Draft time-coded subtitle / voice-over cues and export SubRip (.srt).
- Project name and subtitle cues save in browser localStorage; media files stay in browser IndexedDB.
- No final video rendering, clip concatenation, transcoding, automatic speech recognition, translation, AI voice synthesis, cloud sync or social publishing.
- The exported CSV/SRT are production hand-off files, not a finished video or verified captions.


## Build 22 — Voice & Pronunciation Studio
- Added `components/VoiceStudio.tsx` and route `/voice-studio`.
- Presenter voice-over script editor with title, word count and estimated read time.
- Browser speech preview using available device/browser voices, language selection, rate, pitch and volume controls.
- Pronunciation dictionary applies user-defined spelling substitutions to preview/export text while preserving the original script.
- Exports a TXT voice-over script and CSV pronunciation guide.
- Project data is stored in browser localStorage on this device only.
- Browser speech preview is not a hosted AI voice service and does not create a downloadable audio recording.
- No automatic transcription, voice cloning, identity imitation, audio generation file, cloud sync or social publishing.
- Editorial checklist is a manual reminder only; human review and sign-off remain mandatory.


## Build 23 — Presenter Scene Studio
- Added `components/PresenterSceneStudio.tsx` and route `/presenter-scenes`.
- Reads the saved presenter identity and selected photo from Presenter Studio's browser-local profile; can show/hide the photo in the preview.
- Four scene formats: studio anchor, vertical presenter, square update and headline-only; four background themes.
- Editable headline and supporting line, live scene preview, SVG export and ordered scene rundown.
- Scene rundown supports duration, lower-third, ticker and production notes; exports CSV.
- Reads the existing Script Studio English presenter copy for a read-only hand-off preview.
- No generated/talking avatar, face alteration, voice-to-lip synchronisation, video rendering, AI image generation, cloud sync or social publishing.
- Presenter profile and scene plan remain in browser-local storage; user-selected photo is not uploaded to GitHub or a server.
- Every scene remains an editorial draft and requires human review of facts, image rights and attribution.


## Build 24 — Newsroom Storyboard & Shot Planner
- Added `components/StoryboardPlanner.tsx` and route `/storyboard`.
- Creates an ordered shot list with scene name, visual/camera description, source or media asset, narration, on-screen text, duration, manual status and production notes.
- Includes a starter four-shot news bulletin, add/remove/reorder controls, total runtime estimate and manual Ready count.
- Reads a read-only preview of available English/Hindi Script Studio text from the same browser.
- Saves the plan in browser localStorage and exports a CSV shot list plus a TXT director's brief.
- Dashboard navigation now links to Newsroom Storyboard.
- This is a production planning and hand-off tool only; it does not fetch footage, render/edit video, validate source claims or image rights, record audio, generate AI voice, sync lips or publish.
- The Ready status is manually selected and is not an automated editorial, factual or rights approval. Human editor sign-off remains mandatory.
- Storyboard data stays in the current browser and is not cloud synced.


## Build 25 — Newsroom Control & Quality Dashboard
- Expanded `components/NewsroomControlCentre.tsx` into an operations overview embedded on the main dashboard.
- Reads browser-local story draft count, correction count, broadcast segment count and storyboard shot count.
- Adds quick links to editorial, verification, research, script, media, presenter, storyboard and production workspaces.
- Adds a manual refresh control and displays the local refresh time.
- Adds a human quality-gate reminder for evidence, names/dates/locations, rights, corrections and editor sign-off.
- Browser-local counts are activity indicators only; they are not verified-story counts, live server metrics, quality scores or publication approvals.
- Media Library IndexedDB assets are not counted; other devices and users are not included. Same-tab changes may require manual refresh.
- No new cloud storage, authentication, automatic fact-checking or publishing connection was added.


## Build 26 — Data & Backup Centre
- Added `components/DataBackupCentre.tsx` and route `/backup`; linked from the main dashboard.
- Exports recognised browser-local newsroom records as a versioned JSON bundle: story queue/corrections, broadcast rundown, verification checklist, bilingual scripts, presenter profile, storyboard and production checklist, plus optional voice-studio data when present.
- Includes backup file inspection and explicit confirmation before restore. Merge mode updates records included in the backup; replace mode can also clear recognised keys marked absent.
- Restore accepts only the known bundle format/version and known storage keys; it is a local browser import, not a server upload.
- Presenter photo data can be embedded in the JSON bundle. Treat backups as private.
- Media Library original files are not embedded; download originals separately from Media Library. Its exported JSON index is metadata only.
- Export/import does not create cloud sync, authentication, encryption-at-rest, multi-user access or cross-device restore. Restore must run on the same application origin where browser data is stored.
- Browser storage capacity and partial restore failures remain possible; create a fresh backup before restore and verify each workspace after import.


## Build 27 — Editorial Shift Handover
- Added `components/ShiftHandover.tsx` and route `/shift-handover`; linked from the main dashboard.
- Records shift date/type, outgoing editor, top priority and free-form handover notes.
- Adds desk tasks with owner, priority, due note, status and task context; supports status updates and removal.
- Shows open/done counts and a manually derived task completion percentage.
- Saves to browser-local storage under `global-funn-shift-handover-v1`; exports JSON and readable TXT for transfer to the incoming shift.
- No staff accounts, automatic assignments, notifications, cloud sync or external messaging are connected. The receiving editor must verify current story facts and task status.


## Build 28 — Live Assignment Desk
- Added `components/AssignmentDesk.tsx` and route `/assignments`; linked from the main dashboard.
- Creates reporting assignments with headline, desk, location, reporter, assigning editor, priority, deadline, follow-up, source URL and assignment brief.
- Can link an assignment to an existing story draft in the current browser.
- Tracks Assigned, In progress, Awaiting update, Completed and On hold states, with editor-recorded status history.
- Shows active, overdue and completed counts and supports search/filter plus JSON export.
- Stores assignments locally under `global-funn-live-assignments-v1`. This is not a staff account system and does not send messages, notifications, GPS tracking or cross-device updates.
- Assignment completion is not fact verification or publication approval; human evidence review and editor sign-off remain required.


## Build 29 — Reporter Daily Plan & DSR
- Added `components/ReporterDSR.tsx` and route `/reporter-dsr`; linked from the main dashboard.
- Captures daily date, reporter, beat/territory, target, morning plan, blockers and end-of-day summary.
- Adds field activity entries for visits, interviews, source verification, media capture, follow-up calls and other work, with outcome, story notes and optional evidence URL.
- Supports reopening/editing a saved daily report, searching/filtering the register, and exporting JSON or CSV.
- Stores reports locally under `global-funn-reporter-dsr-v1`; no staff login, GPS tracking, photo scanning, WhatsApp delivery, cloud sync or automatic reminders are connected.
- Activity notes and evidence links are user-entered; the workspace does not independently verify facts, visits or submitted media.
