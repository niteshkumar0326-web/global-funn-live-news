# GLOBAL FUNN — YouTube Reference Register

Last reviewed: 2026-11-21
Status: initial inventory; not a complete archive of links previously shared in chat.

## Review rules

- Record each exact URL before analysis; never infer a video's contents from its title or thumbnail.
- Prefer the creator's own description, transcript, chapter timestamps, and official documentation.
- Separate directly observed facts, creator opinions, demonstrations, and promotional claims.
- Extract product requirements, workflows, quality controls, and measurable outcomes.
- Do not copy third-party source code, proprietary graphics, logos, music, footage, or scripts. Implement original equivalents.
- For each proposed feature, document user value, implementation area, cost, dependencies, privacy/copyright risk, acceptance test, and review status.
- A link marked inaccessible or transcript unavailable is not considered deeply reviewed.

## Recovered references

| ID | URL | Type | Review status | Notes |
|---|---|---|---|---|
| YT-001 | https://www.youtube.com/@niteshkumar0326/live | Channel/live page | Not reviewed | User's GLOBAL FUNN channel; page is not a substitute for a specific reference video. |
| YT-002 | https://youtu.be/WAm76JssKyo?si=KTeTiIPW1MtBhnvu | Video | Pending transcript/playback | Previously associated with reported audio problems. The video content has not been reliably retrieved; do not infer details. |

## Related project reference (not a YouTube link)

- https://global-funn-live-news-fhi43sxyl-all-9e21.vercel.app/ — existing project deployment; audit separately from video references.

## Feature extraction template

For every reviewed source, create a record with:

1. Source ID, exact URL, title, channel/creator, publication date, access date.
2. Transcript/description/chapter availability and exact timestamps reviewed.
3. Short factual summary of the demonstrated workflow.
4. Candidate feature(s) for GLOBAL FUNN, with expected user outcome.
5. Evidence quality: demonstrated / described / opinion / promotional / unverified.
6. Implementation location, dependencies, free-tier limits, operating cost, and fallback.
7. Copyright, licensing, privacy, platform-policy, and misinformation risks.
8. Priority, acceptance tests, owner/status, and decision rationale.

## Current implementation candidates from official platform documentation

| Candidate | App area | Acceptance evidence | Status |
|---|---|---|---|
| Rendered audio stream validation | Video pipeline | FFprobe confirms exactly one AAC audio stream, stereo, 44.1 kHz, and duration within tolerance. | In draft PR #27; CI pending. |
| Live encoder preflight | Live newsroom | Operator checklist verifies video codec, CBR, keyframe interval, audio codec/sample rate/bitrate, and test playback before broadcast. | Planned; no live stream started. |
| Editorial originality and verification gate | News desk | Each story records source links, fact-check status, original reporting/context, and rights review before publication. | Planned. |

## Official references used for requirements (not user-supplied videos)

- YouTube live encoder settings: https://support.google.com/youtube/answer/2853702
- YouTube live stream error messages: https://support.google.com/youtube/answer/3006768
- YouTube spam/deceptive practices policy: https://support.google.com/youtube/answer/2801973
- Antigravity Remote Agents: https://antigravity.google/docs/remote-agents/

## Missing inputs

The recovered conversation context contains YT-001 and YT-002 above, but may not contain every YouTube URL previously supplied by the user. Add any additional links verbatim before treating the inventory as complete.