---
title: App overview
type: architecture
created: 2026-11-14
updated: 2026-11-14
sources:
  - code: package.json
  - code: next.config.ts
  - code: app/layout.tsx
  - code: app/page.tsx
  - code: README.md
verified_at: 2326c8b
---

# App overview

GLOBAL FUNN LIVE NEWS is a Next.js 15 (App Router) and React 19 newsroom dashboard written in
TypeScript, styled with Tailwind CSS and Lucide icons. Scripts are `dev`, `build`, `start`
and `lint` (`package.json`). The React strict mode flag is on (`next.config.ts`).

Each route is a folder under `app/` with a `page.tsx` (for example `app/stories/page.tsx`,
`app/verification/page.tsx`). Most pages render a panel component from `components/`, such as
`NewsroomControlCentre` on the home page (`app/page.tsx`).

> ⚠️ The home page is a hand-maintained starter. Its story cards and metrics are hardcoded
> literals in `app/page.tsx`, not data. The navigation links are also hardcoded in that file,
> so a new route does not appear on the home page until someone adds its link there.

> ⚠️ The home page shows "NOT CONNECTED TO LIVE NEWS FEEDS". No live feed is wired in yet, so
> do not describe the app as pulling live news.

## Editorial rules are part of the product

`README.md` sets the publishing rules: no fabricated stories, quotes or sources; no
"verified" label without accessible source references; AI visuals labelled AI ILLUSTRATION;
corrections and timestamps stay visible; a final editor approval before publication.

> ⚠️ Those rules are the reason the verification gate exists. Do not add a path that sets a
> story to verified, or publishes one, without the source trail and the editor approval step.

