# GLOBAL FUNN — Automated News Pipeline Foundation

Status: design and readiness specification only. This document does not enable scheduled jobs, generate media, or publish to YouTube.

## Operating objective

Check for meaningful news updates every 10 minutes (Asia/Kolkata). A check is not a promise to publish a video. Publish only when a genuinely new, attributable story passes the configured evidence, editorial, rights, technical, and platform-policy gates.

## Proposed stages

1. **Scheduled intake** — poll approved RSS/API sources; record source URL, publisher, published time, observed time, and canonical story URL.
2. **Normalize and deduplicate** — normalize URLs/headlines; compare story fingerprints and event identifiers against durable server-side records. Do not rely on browser localStorage.
3. **Evidence review** — preserve source excerpts/metadata; distinguish primary statements from independently verified facts; flag conflicting or single-source consequential claims.
4. **Hindi editorial package** — draft a concise Hindi script with attribution, event time vs publication time, uncertainty labels, and source references.
5. **Rights and media check** — use owned/licensed assets or clearly labelled AI illustrations. Never pass old footage off as current.
6. **Render and quality control** — generate narration and video; validate audio presence, duration, captions, source slate, output file integrity, and duplicate similarity.
7. **Publication gate** — initial rollout should be dry-run only. Enable unattended publishing only after the owner explicitly approves the policy change, test results, and credential setup. Critical, disputed, sensitive, or insufficiently sourced stories must remain held for human review.
8. **YouTube upload and audit** — upload through official YouTube OAuth; save video ID, status, timestamps, source list, script hash, media hash, and error details in durable server-side storage.

## Schedule and publishing limits

- Check cadence: every 10 minutes.
- Do not create an empty video when there is no qualifying update.
- Do not publish duplicate or near-duplicate packages.
- YouTube Data API upload quota must be checked against the current project quota before launch. The default quota previously reviewed was 100 `videos.insert` calls/day; a 10-minute schedule is 144 checks/day, not 144 guaranteed uploads/day. Any quota increase must be approved by YouTube.
- Respect YouTube spam, repetitive-content, and monetization policies. Volume is subordinate to distinct reporting value and accuracy.

## Required infrastructure

- Durable database and migrations (Supabase is a candidate, not yet provisioned).
- Server-side scheduler/worker with locking and retry/backoff.
- Approved news feed/API credentials and source allowlist.
- Hindi TTS/audio provider and server-side video renderer.
- Object storage for generated media and immutable audit metadata.
- YouTube Data API enabled in Google Cloud and OAuth consent completed by the channel owner.
- Monitoring for failed jobs, stale feeds, quota exhaustion, duplicate detection, and upload state.

## Secrets policy

Store credentials only in the deployment platform's encrypted environment/secrets store. Never commit them or paste them into chat. Expected names may include `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`, feed-provider credentials, database server credentials, and TTS credentials. Do not expose privileged database keys to browser code or `NEXT_PUBLIC_*` variables.

## Rollout gates

- **Gate A — Foundation:** database, auth/roles, server-side story records, audit trail, source registry.
- **Gate B — Intake:** scheduled feed polling, URL canonicalization, deduplication, failure handling; dry-run only.
- **Gate C — Editorial:** evidence capture, Hindi script draft, source panel, uncertainty and correction workflow.
- **Gate D — Production:** TTS, renderer, captions, asset-rights validation, automated QC.
- **Gate E — Publishing:** owner-authorized YouTube OAuth, unlisted/private test upload, playback/audio check, then explicitly enabled public publishing.
- **Gate F — Operations:** monitor schedule, errors, quota, corrections, and emergency pause.

## Current repository gap

The current project-status record describes browser-local story data, no production database/auth, no connected live feed, no automated fact-checking, no downloadable AI voice recording, no final video rendering, and no social publishing connection. This specification does not claim those capabilities already exist.

## Acceptance criteria before public auto-publishing

- A failed or stale feed cannot be interpreted as “no news” or as verified news.
- Every published factual claim has traceable source references and visible attribution.
- Duplicate detection works across devices and concurrent workers.
- Retries are idempotent and cannot upload the same package twice.
- Sensitive/disputed/unsupported stories are held.
- Generated audio is present and intelligible; final MP4 passes technical checks.
- Owner can pause publishing immediately.
- OAuth refresh and upload failures are logged without exposing secrets.
- A human-reviewed pilot and private/unlisted test upload pass before public automation is enabled.
