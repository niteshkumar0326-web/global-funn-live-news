# GLOBAL FUNN LIVE NEWS — Broadcast Preflight

Use this checklist before every private test or public live session. A completed checklist is not permission to publish: public streaming still requires an explicit go-live decision by the channel owner.

## 1. Editorial and source readiness

- [ ] Confirm the planned topic, audience, language, and broadcast window.
- [ ] Collect at least two independent, credible sources for consequential breaking claims where practical.
- [ ] Record source URLs, publication/update times, and the exact claim each source supports.
- [ ] Mark developing claims as **UNVERIFIED**; do not turn social posts or a single anonymous claim into confirmed fact.
- [ ] Separate confirmed facts, attributed claims, analysis, and unknowns in the script.
- [ ] Check names, locations, dates, numbers, pronunciation, and corrections.
- [ ] Remove copied broadcast footage, music, images, and third-party clips unless usage rights are documented.
- [ ] Check privacy: no personal phone numbers, addresses, private documents, or identifiable bystanders without a lawful editorial basis.

## 2. Script and narration

- [ ] Script has a clear timestamp and source notes.
- [ ] Read aloud once; remove confusing, repetitive, or unsupported statements.
- [ ] Narration language and voice match the intended audience.
- [ ] Pronunciation of names and places has been checked.
- [ ] No placeholder text, TTS artifacts, or accidental prompt/instruction text remains.

## 3. Rendered media QA

- [ ] Video opens and plays from beginning to end.
- [ ] Audio stream exists exactly once and is AAC stereo, 44.1 kHz.
- [ ] Audio duration aligns with the video/narration.
- [ ] Automated signal check does not report digital silence.
- [ ] Listen to the beginning, middle, end, and any transitions; check intelligibility, sync, distortion, and unexpected gaps.
- [ ] Review captions for spelling, timing, line breaks, and factual consistency.
- [ ] Check aspect ratio, safe margins, thumbnails, and on-screen text.
- [ ] Verify music/SFX levels do not mask narration.

> Automated FFprobe and FFmpeg checks are structural/signal checks only. They do not certify intelligibility, loudness balance, clipping, distortion, factual accuracy, or rights.

## 4. Live encoder and destination

- [ ] Confirm the correct YouTube channel and stream destination.
- [ ] Confirm stream key is stored only in the encoder's secure settings; never paste it into chat, source code, logs, or screenshots.
- [ ] Confirm encoder profile, resolution, frame rate, bitrate, keyframe interval, and audio settings against the current YouTube Live recommendations for the selected resolution.
- [ ] Confirm stable upload bandwidth and wired network where possible.
- [ ] Confirm microphone/input selection, monitoring, and backup audio source.
- [ ] Confirm scene order, overlays, lower thirds, clock/time zone, and emergency slate.
- [ ] Test privately/unlisted first and inspect YouTube Live Control Room health.

## 5. Operational safety

- [ ] Assign a human operator to monitor stream health, chat/moderation, and breaking corrections.
- [ ] Prepare a fallback slate and a way to stop the stream immediately.
- [ ] Do not display desktop notifications, private tabs, credentials, or personal data.
- [ ] Keep a correction log with timestamp and source.
- [ ] If a critical claim is disputed, audio fails, or stream health degrades, pause or switch to the fallback slate.

## 6. Go-live decision

- [ ] All required checks above are complete.
- [ ] Channel owner has reviewed the final output and source notes.
- [ ] Channel owner explicitly approves this specific public broadcast.

**Default state: NOT LIVE.** This checklist never starts OBS, publishes a video, schedules a stream, or exposes a stream key by itself.
