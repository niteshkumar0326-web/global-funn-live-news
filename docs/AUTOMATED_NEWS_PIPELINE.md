# GLOBAL FUNN — Automated News Pipeline

Status: owner-directed automatic-publishing design. The repository still does not have a connected production database, scheduler, media renderer or YouTube OAuth credentials; this document does not claim that automation is live.

## Operating objective

Check approved news feeds every 10 minutes (Asia/Kolkata). Automatically create and publish a video when a genuinely new story passes every configured evidence, attribution, rights, safety, technical and platform-policy gate. No per-video owner approval is required for routine eligible stories. A check is not a promise to publish a video.

## Proposed stages

1. **Scheduled intake** — poll allowlisted RSS/API sources; record source URL, publisher, published time, observed time and canonical story URL.
2. **Normalize and deduplicate** — normalize URLs/headlines; compare story fingerprints and event identifiers against durable server-side records. Do not rely on browser localStorage.
3. **Evidence review** — preserve source excerpts/metadata; distinguish primary statements from independently verified facts; flag conflicting or single-source consequential claims. Missing, stale or conflicting evidence fails closed.
4. **Hindi editorial package** — draft a concise Hindi script with attribution, event time vs publication time, uncertainty labels and source references.
5. **Rights and media check** — use owned/licensed assets or clearly labelled AI illustrations. Never pass old footage off as current.
6. **Render and quality control** — generate narration and video; validate audio presence, duration, captions, source slate, output integrity and duplicate similarity.
7. **Automated publication gate** — routine eligible items publish without per-video manual approval only when every check passes. Sensitive, disputed, unsupported, privacy-invasive or high-consequence stories are held for human review. Any failed/unknown check means hold.
8. **YouTube upload and audit** — upload through official YouTube OAuth; save video ID, status, timestamps, source list, script hash, media hash and error details in durable server-side storage.

## Schedule and publishing limits

- Check cadence: every 10 minutes.
- Do not create an empty video when there is no qualifying update.
- Do not publish duplicate or near-duplicate packages.
- YouTube Data API upload quota must be checked against the live project quota before launch. A 10-minute schedule is 144 checks/day, not 144 guaranteed uploads/day. Quota increases are subject to YouTube approval.
- Respect YouTube spam, repetitive-content and monetization policies. Volume is subordinate to distinct reporting value and accuracy.

## Required infrastructure

- Durable database and migrations (Supabase is a candidate, not yet provisioned).
- Server-side scheduler/worker with locking and retry/backoff.
- Approved news feed/API sources and source allowlist.
- Hindi TTS/audio provider and server-side video renderer.
- Object storage for generated media and immutable audit metadata.
- YouTube Data API enabled in Google Cloud and OAuth consent completed by the channel owner.
- Monitoring for failed jobs, stale feeds, quota exhaustion, duplicate detection and upload state.
- Owner-controlled emergency pause.

## Secrets policy

Store credentials only in the deployment platform's encrypted environment/secrets store. Never commit them or paste them into chat. Never expose privileged database keys in browser code or `NEXT_PUBLIC_*` variables.

## Rollout gates

- **Gate A — Foundation:** database schema, auth/roles, server-side story records, audit trail, source registry, publication-job ledger.
- **Gate B — Intake:** scheduled feed polling, URL canonicalization, deduplication, failure handling; dry-run first.
- **Gate C — Editorial:** evidence capture, Hindi script, source panel, uncertainty and correction workflow.
- **Gate D — Production:** TTS, renderer, captions, asset-rights validation and automated QC.
- **Gate E — Publishing:** owner-authorized YouTube OAuth, private/unlisted test upload, playback/audio check, then routine public auto-publishing when all checks pass.
- **Gate F — Operations:** monitor schedule, errors, quota, corrections and emergency pause.

## Current repository gap

The current project-status record describes browser-local story data, no production database/auth, no connected live feed, no automated fact-checking, no final video rendering and no social publishing connection. Those capabilities must be implemented and verified before automation can run.

## Acceptance criteria before public auto-publishing

- A failed or stale feed cannot be interpreted as “no news” or verified news.
- Every published factual claim has traceable source references and visible attribution.
- Duplicate detection works across devices and concurrent workers.
- Retries are idempotent and cannot upload the same package twice.
- Sensitive/disputed/unsupported stories are held for human review.
- Generated audio is present and intelligible; final MP4 passes technical checks.
- Owner can pause publishing immediately.
- OAuth refresh and upload failures are logged without exposing secrets.
- A dry-run pilot and private/unlisted test upload pass before public automation is enabled.
