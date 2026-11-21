# Free Video Pipeline Test Coverage — Design

## Goal
Add deterministic, offline regression tests for the image-led video renderer and reject invalid frame-rate settings before invoking media tools.

## Current behavior
- `render.py` validates input paths and FFmpeg/FFprobe availability, probes audio duration, builds an FFmpeg concat input, and renders an MP4.
- The CLI accepts any integer for `--fps`, including zero and negative values.
- CI currently tests newsroom scripts but does not compile or test the video pipeline.

## Proposed design
Use Python's standard-library `unittest` only; no new dependencies.
- Test deterministic helpers: concat path escaping, audio-duration parsing, and subprocess error propagation.
- Test renderer validation for non-positive FPS and missing inputs/media tools without running FFmpeg.
- Add Python compilation and unittest discovery for the video pipeline to CI.
- Keep tests offline and independent of media assets.

## Safety and scope
- Change only `tools/free_video_pipeline/render.py`, its focused test module, and the CI workflow.
- Do not call Edge TTS, YouTube, OAuth, or external services.
- Preserve private-by-default YouTube upload behavior; uploader and TTS code are out of scope.
- Do not publish, schedule, or livestream anything.
- This work does not resolve the separate Ollama API security issue.
