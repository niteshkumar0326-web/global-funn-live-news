# GLOBAL FUNN — Live News Channel Deployment Plan

Last updated: 2026-11-21
Channel: GLOBAL FUNN (@niteshkumar0326)
Timezone: Asia/Kolkata

## 1. Deployment decision

Launch a scheduled, human-reviewed live news bulletin first. Do not start with an unattended 24/7 loop. A credible live news service needs current verified reporting, licensed visuals/audio, active moderation, and a person who can stop or correct a stream. A looping slideshow labelled LIVE is not an acceptable substitute.

Phase 1: one 30-minute Hindi live bulletin on Wednesday at 16:00 IST as the first pilot slot, with an optional second 10–15 minute breaking-news update only when a story is verified. Metricool's connected YouTube audience-time report for 2026-11-23 to 2026-11-29 showed Wednesday 16:00 as the strongest hour (score 12033), with Thursday 16:00 close (11979). Treat this as a test slot and reassess after four pilots.
Phase 2: extend to 45–60 minutes and add a weekend review after four successful pilots.
Phase 3: consider longer/continuous programming only after reliable editorial staffing, rights-cleared feeds, and hosting costs are approved.

## 2. Free-first stack

| Job | Primary | Fallback |
|---|---|---|
| Research and source checking | Official releases, regulator/company statements, reputable newsrooms | Cross-check with a second independent source |
| Script and rundown | Local project templates + editorial review | Manual rundown in Markdown |
| Hindi narration | Microsoft Edge TTS hi-IN-MadhurNeural | hi-IN-SwaraNeural |
| Video/graphics | FFmpeg + original graphics | OBS scene text/images |
| Live encoder | OBS Studio (free/open source) on Windows | YouTube Studio webcam/encoder option |
| Live destination | YouTube Live on GLOBAL FUNN | Recorded upload if live is unavailable |
| Post scheduling/analytics | Existing Metricool connection | YouTube Studio scheduler |
| Keyword/SEO research | vidIQ Free allowance | YouTube Studio Analytics + manual search |
| Source asset storage | Local assets/live/ and output/live/ folders | GitHub docs only; never commit media credentials |

OBS is free and has no watermark. Metricool is for planning/publishing supported social posts and analytics; it is not the live encoder. Use OBS + YouTube Live for the actual stream.

## 3. Live bulletin format (30 minutes)

1. 00:00–01:00 — Opening, date/time, editorial disclaimer
2. 01:00–08:00 — Top 3 verified headlines (what happened / why it matters)
3. 08:00–15:00 — India business, markets and economy
4. 15:00–21:00 — World news and technology
5. 21:00–26:00 — Explainer / context / fact-check
6. 26:00–29:00 — What to watch next; clearly label forecasts/opinions
7. 29:00–30:00 — Corrections/contact and sign-off

Each story card must include: headline, event time (IST), source name, source link, confirmation status, one-sentence context, and any uncertainty. Keep an editorial source log for every claim.

## 4. Editorial and rights safeguards

- Do not copy another broadcaster's live feed, clips, graphics, music, or scripts without permission/licence.
- Prefer original narration, self-made charts, public-domain or properly licensed visuals, official data, and short factual quotations where legally permitted.
- Attribute sources on screen and in the description; retain source URLs and access dates in the rundown.
- Verify consequential breaking claims with two independent credible sources, or label them explicitly as unconfirmed and do not present them as fact.
- Separate fact, analysis, opinion, and prediction. Correct material errors on-air and in the description.
- Do not use synthetic presenter likeness/voice to impersonate a real journalist or public figure.
- Do not run an unattended auto-generated breaking-news stream. Require a human editor to approve the rundown and monitor the stream.

## 5. OBS scene plan

Create these scenes in OBS:
- 00_STARTING: GLOBAL FUNN title, bulletin start time, no copyrighted music.
- 01_ANCHOR: presenter/webcam or original voiceover + branded lower third.
- 02_HEADLINE: headline text, source label, timestamp.
- 03_DATA: original chart/table with source footnote.
- 04_MAP: original map/locator with source note.
- 05_BREAKING: red BREAKING label only after editor verification; include update time.
- 06_CORRECTION: correction text and affected story.
- 07_ENDING: next bulletin time and channel handle.

Recommended initial output: 1280x720, 30 fps, H.264, AAC. Test bitrate and dropped frames against the actual upload speed; do not assume a fixed bitrate will work on every connection. Record locally while streaming if disk space allows.

## 6. YouTube Live activation checklist

- Confirm channel phone/identity verification and that live streaming is enabled.
- YouTube may require up to 24 hours after first enabling live streaming.
- Confirm there are no live-streaming restrictions in the previous 90 days.
- Create a private/unlisted rehearsal first; test audio, captions, scene transitions, internet stability, and moderator access.
- Schedule the public live event in YouTube Studio only after rehearsal passes.
- Keep stream key private. Never put it in GitHub, chat, source code, or screenshots.
- Use a moderator and enable slow mode/blocked terms as appropriate.

## 7. Weekly publishing system

Target from the channel plan: 3 long videos + 6 Shorts each week. Add the live bulletin as a separate show, but repurpose only genuinely useful clips from the live show; do not duplicate near-identical videos just to inflate volume.

Suggested rhythm (IST):
- Mon/Wed/Fri: one researched long video.
- Tue/Thu/Sat: two Shorts each day, sourced from the week's long/live content.
- Wednesday 16:00 IST: 30-minute live bulletin pilot (best available Metricool YouTube audience-time slot); reassess after four shows.
- Sunday: analytics review, corrections, and next-week rundown.

Metricool Free currently supports one brand and up to 20 published posts per calendar month. The 9-video weekly target is about 36 posts/month before counting live announcements or cross-posting, so use Metricool Free selectively (priority posts) or upgrade only if its paid publishing capacity is needed. Check the connected account's live limits before purchase.

## 8. vidIQ credit policy

Connected account balance checked 2026-11-21:
- Total remaining: 4 credits
- Renewable remaining: 4 of 150
- Add-on remaining: 0
- Next renewable reset: 2026-12-09 13:01 UTC (18:31 IST)

Do not spend the remaining credits on narration or routine scripts. Free plan provides 150 credits per monthly cycle. Current official US list pricing shows Boost at $19/month or $199/year (one-channel price; local checkout may vary), with 2,000 credits/month; Max at $49/month or $468/year, with 6,000 credits/month. The pricing page also displays annual-equivalent rates, so verify the final India checkout total and billing period before buying. Recommendation: remain Free for now; revisit Boost only if keyword/competitor research demonstrably improves performance. Do not buy Max for video rendering or uploading—it is not a production/rendering platform.

## 9. Metricool plan decision

The connected Metricool brand is confirmed for GLOBAL FUNN. A scheduled-post check for 2026-11-21 through 2026-11-28 returned no scheduled posts.

Official pricing currently lists:
- Free: $0; 1 brand; up to 20 posts/month; 30 days of analytics.
- Starter: from $20/month (US display; regional checkout may vary); up to 5 brands at the entry tier and unlimited publishing subject to fair use.
- Advanced: from $53/month; adds team approvals, roles, reporting and API access.

Recommendation: stay on Free during the pilot. The current 9 posts/week plan exceeds the Free 20-published-post monthly cap. If publishing volume is consistently above 20/month, compare the India checkout price for Starter against Publer and native YouTube scheduling. Advanced is not justified for one channel unless team approvals/API/reporting become necessary. Metricool does not replace OBS for live streaming.

## 10. Deployment gates

Gate A — Local setup: install OBS from obsproject.com; install FFmpeg; run the existing tools/free_video_pipeline/setup.ps1; keep OAuth and stream keys local.
Gate B — Pre-recorded pilot: create Hindi narration, render the 16:9 video and vertical Shorts, review factual accuracy and subtitles.
Gate C — Live rehearsal: 10-minute private/unlisted OBS stream; verify audio, network, scenes, stream key and moderation. YouTube Live is already enabled on the channel per user confirmation.
Gate D — Public pilot: editor-approved rundown, source log, thumbnail/title/description, scheduled event and moderator.
Gate E — Scale: only after 4 successful live pilots with no major factual/rights incidents; assess whether to add cloud encoding or more frequent shows.

## 11. What is not yet deployed

This document is the deployment blueprint, not proof of a running stream. No OBS scene collection, MP4, live event, or public broadcast has been created by this commit. Local Windows installation and YouTube Live activation must be completed and tested before the first public stream. Never report a live stream as active until YouTube Studio confirms it.
