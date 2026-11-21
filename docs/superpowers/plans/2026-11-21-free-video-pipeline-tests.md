# Free Video Renderer CI Tests Implementation Plan

> **For agentic workers:** Use test-driven development. Complete each task in small red/green steps.

**Goal:** Add offline regression tests for renderer helpers and reject invalid FPS values.

**Architecture:** Use Python standard-library `unittest`; test the renderer's deterministic helpers and CLI validation without requiring FFmpeg or media assets. Extend the existing Python CI job.

**Tech Stack:** Python 3.11, unittest, GitHub Actions.

**Spec:** `docs/superpowers/specs/free-video-pipeline-tests.md`

## Global Constraints
- No new Python dependencies.
- Tests must not require FFmpeg, audio/image assets, network access, OAuth, or YouTube credentials.
- Do not modify TTS, uploader, newsroom, or Next.js code.
- Do not publish, schedule, or livestream media.

## Review Focus
- Paths containing Windows separators and apostrophes remain correctly escaped.
- FFprobe command failures are surfaced rather than treated as valid durations.
- FPS values less than one are rejected before external tools are invoked.
- Missing audio/image inputs and missing FFmpeg tools return clear validation errors.

---

### Task 1: Add renderer regression tests

**Files:**
- Create: `tools/free_video_pipeline/test_render.py`

- [ ] Test `escape_concat` with a path containing an apostrophe and Windows separators.
- [ ] Test `duration_of` with a valid FFprobe duration and a failing subprocess.
- [ ] Test `run` propagates stderr when the subprocess exits non-zero.
- [ ] Add a CLI test proving `--fps 0` returns validation code 2 before any file or FFmpeg access.
- [ ] Run the focused test module and confirm the FPS test fails for the expected reason.

### Task 2: Implement FPS validation

**Files:**
- Modify: `tools/free_video_pipeline/render.py`

- [ ] Reject `args.fps < 1` with a clear stderr message and return code 2.
- [ ] Run the focused test module and verify all tests pass.

### Task 3: Add CI coverage

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] Compile `tools/free_video_pipeline`.
- [ ] Run `python -m unittest discover -s tools/free_video_pipeline -p 'test_*.py' -v`.
- [ ] Verify the full workflow, including newsroom tests and Next.js production build.

### Task 4: Review and handoff

- [ ] Inspect the diff for unrelated changes and credential/media leakage.
- [ ] Confirm CI results are green.
- [ ] Keep changes in a separate pull request; do not merge automatically.
