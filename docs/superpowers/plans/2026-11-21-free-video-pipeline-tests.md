# Free Video Pipeline CI Tests Implementation Plan

> **For agentic workers:** Use the repository's test-driven development workflow. Complete each test task in small red/green steps.

**Goal:** Add offline unit tests and CI coverage for the existing Python video pipeline.

**Architecture:** Use Python standard-library `unittest` and isolate tests around validation and deterministic helpers. Extend the existing GitHub Actions Python job without changing production behavior unless a failing test proves a defect.

**Tech Stack:** Python 3.11, unittest, GitHub Actions.

**Spec:** `docs/superpowers/specs/free-video-pipeline-tests.md`

## Global Constraints
- Tests must not require FFmpeg, Edge TTS network access, YouTube OAuth, API credentials, or media assets.
- Keep YouTube uploads private by default.
- Do not publish, schedule, or livestream media.
- Do not change unrelated newsroom or Next.js code.

## Review Focus
- Windows-style paths containing drive-colons and apostrophes remain correctly escaped for FFmpeg concat input.
- FFprobe returning malformed duration or a non-zero exit is surfaced as an error.
- Missing script/audio/image inputs fail before external services are invoked.
- A scheduled public YouTube upload is rejected before OAuth/API access.
- Tests remain deterministic on Linux CI and Windows local Python.

---

### Task 1: Test deterministic render helpers

**Files:**
- Create: `tools/free_video_pipeline/test_render.py`
- Test: `escape_concat`, `duration_of`, and `run`

- [ ] Write tests for apostrophe/backslash path escaping, valid duration parsing, and subprocess failure propagation.
- [ ] Run the test module and confirm expected failures only where behavior is absent or differs.
- [ ] Keep production code unchanged if current behavior satisfies the tests.
- [ ] Run the complete Python test suite.

### Task 2: Test CLI validation without external services

**Files:**
- Create: `tools/free_video_pipeline/test_cli_validation.py`
- Test: `render.main`, `tts.main`, and `youtube_upload.main`

- [ ] Test missing audio/image directory and unavailable FFmpeg/FFprobe using temporary directories and patched PATH lookup.
- [ ] Test missing and empty TTS script without calling Edge TTS.
- [ ] Test missing video and scheduled-public combination before OAuth/API initialization.
- [ ] Run the module and confirm all validation tests pass without network or credentials.

### Task 3: Add CI coverage

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] Add Python compilation for `tools/free_video_pipeline`.
- [ ] Add `python -m unittest discover -s tools/free_video_pipeline -p 'test_*.py' -v`.
- [ ] Run the full workflow and verify newsroom tests, pipeline tests, and Next.js build.

### Task 4: Review and handoff

- [ ] Inspect the final diff for secret/media leakage and unintended production changes.
- [ ] Confirm CI results are green.
- [ ] Keep this work in its own pull request; do not merge automatically.
