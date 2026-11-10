# GLOBAL FUNN LIVE NEWS — Project Status

Updated: 2026-11-10

## Repository
- GitHub: `niteshkumar0326-web/global-funn-live-news`
- Default branch: `main`
- Current visibility: Public

## Implemented routes
- `/` — newsroom dashboard
- `/story-intake` — source-aware local story preview form
- `/verification` — human editorial verification checklist and sample proof card
- `/regional-desks` — directory for 28 states and 8 Union Territories
- `/international` — six regional international desks
- `/archive` — correction/update register prototype

## Shared UI and configuration
- Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons
- Dark navy, royal blue, gold and breaking-red visual system
- Global layout, metadata and responsive dashboard styles
- `.gitignore` and project README

## Not implemented / not connected
- No production database or durable story storage
- No authentication, roles or editor account management
- No automated source verification or fact-checking
- No live news API/feed connection
- No correspondent/field reporting ingestion
- No public story publishing or social publishing workflow
- No hosting/deployment configured or verified
- No Dropbox or Microsoft cloud mirror configured

## Important behavior
The story intake form creates only a local in-browser preview. It does not persist submissions or publish content. The desk directories are organisational placeholders, not live feeds or staffed bureaus. Sample archive entries are clearly marked as demonstrations.

## Next milestones
1. Select and connect a secure database and authentication provider.
2. Implement durable story records, evidence references and audit trail.
3. Add editor/reporter roles and explicit approval transitions.
4. Add source-link validation and human review tools; never auto-label a story verified solely because a URL exists.
5. Add safe, permissioned news-feed integrations and monitoring.
6. Add backups to approved cloud destinations.
7. Run install, typecheck, build and deployment checks before calling the app production-ready.
