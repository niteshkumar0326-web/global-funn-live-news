# GLOBAL FUNN — Compact AI Context Index

Use this file as the first project-context read. Do not load the full build history for routine work.

## Project
GLOBAL FUNN LIVE NEWS — source-led newsroom workspace.
Stack: Next.js App Router, React, TypeScript, Tailwind CSS.
Main entry: `app/page.tsx`.
Shared rules: `AGENTS.md`; Claude-specific quick notes: `CLAUDE.md`.
Detailed build history: `docs/PROJECT_STATUS.md` (read only the relevant entry).

## Feature map
- Editorial intake and queue: `/story-intake`, `/stories`, `/verification`, `/research`, `/archive`.
- News desks and scripts: `/regional-desks`, `/international`, `/scripts`.
- Broadcast and creative production: `/broadcast`, `/graphics`, `/media`, `/presenter`, `/production`, `/video-studio`, `/voice-studio`, `/presenter-scenes`, `/storyboard`.
- Operations: `/backup`, `/shift-handover`, `/assignments`, `/reporter-dsr`, `/performance`.
- Cloud route is a readiness view; it does not mean cloud database/auth is connected.

## Data boundaries
Most newsroom workflows use browser localStorage. Media Library uses browser IndexedDB. Data is not automatically shared across browsers/devices. Do not describe local data as cloud-synced. Do not add cloud DB/auth, paid APIs, public publishing, social posting or external messaging without explicit approval.

## Quality and safety
- Source links are references, not proof. Fact-checking and editor sign-off remain human responsibilities.
- Assignment completion is not story verification or publication approval.
- Never invent sources, quotes, eyewitnesses, facts, ratings or capabilities.
- Never commit credentials, private user photos, uploaded media or local graph database files.

## Commands
- Install: `npm install`
- Production build: `npm run build`
- Local graph status: `uvx code-review-graph status`
- Refresh graph: `uvx code-review-graph update`
- Change impact: `uvx code-review-graph detect-changes --brief`

## Token-efficient work
If Code Review Graph MCP is connected, begin with `get_minimal_context_tool`, then ask targeted graph queries with minimal detail. Verify findings in actual source and tests. If MCP is unavailable, use the connected GitHub repository integration and read only relevant files. Never claim a local graph is built or connected until verified.

## Current project milestone
Build 31 integrates Code Review Graph config, Windows setup, shared AI rules and GitHub PR review workflow. See the Build 31 entry in `docs/PROJECT_STATUS.md` for exact commit and verification status.
