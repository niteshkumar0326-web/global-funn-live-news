# Free Video Pipeline Test Coverage — Design

## Goal
Add repeatable automated checks for the existing Python video-production tools so basic regressions are caught in CI without requiring FFmpeg, network access, YouTube credentials, or media assets.

## Current behavior
- `render.py` validates required input paths and FFmpeg/FFprobe availability, probes audio duration, builds an FFmpeg concat input, and renders an MP4.
- `tts.py` validates a UTF-8 script and delegates narration to Edge TTS.
- `youtube_upload.py` validates the video path and scheduling/privacy combination, then uses local OAuth credentials and the YouTube API. Uploads default to private.
- CI currently compiles and tests `tools/news_desk`, but does not compile or test `tools/free_video_pipeline`.

## Proposed design
Use Python's standard-library `unittest` only. Add focused tests for deterministic, offline behavior:
- rendering helper path escaping and audio-duration parsing, including command failure;
- renderer CLI validation for missing inputs and missing media tools without invoking FFmpeg;
- TTS validation for missing and empty scripts without making a network call;
- YouTube upload argument validation for missing files and invalid scheduled-public combinations before OAuth or API access.
Add a CI step that compiles the video pipeline and runs its tests. Do not perform a real render, call Edge TTS, access YouTube, or upload media in CI.

## Safety and scope
- Preserve private-by-default YouTube upload behavior.
- Do not change the renderer, TTS, or uploader production behavior unless a test exposes a concrete defect and that defect is separately justified.
- No credentials, media, API keys, network services, or user data in tests.
- Do not publish, schedule, or livestream anything.
- This work does not resolve the separate Ollama API security issue.
