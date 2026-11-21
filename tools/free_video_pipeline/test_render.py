from __future__ import annotations

import contextlib
import io
import json
import subprocess
import sys
import unittest
from pathlib import Path
from unittest import mock

import render


class RenderHelperTests(unittest.TestCase):
    def test_escape_concat_quotes_apostrophes_and_normalizes_separators(self):
        result = render.escape_concat(Path("folder/O'Brien.png"))
        self.assertIn("O'\\''Brien.png", result)
        self.assertNotIn("folder\\\\", result)

    def test_duration_of_parses_ffprobe_output(self):
        with mock.patch.object(render, "run", return_value="12.75") as run:
            self.assertEqual(render.duration_of(Path("voice.mp3")), 12.75)
        self.assertEqual(run.call_count, 1)
        self.assertIn("ffprobe", run.call_args.args[0])

    def test_duration_of_rejects_invalid_ffprobe_output(self):
        with mock.patch.object(render, "run", return_value="not-a-duration"):
            with self.assertRaises(ValueError):
                render.duration_of(Path("voice.mp3"))

    def test_verify_output_audio_accepts_one_audio_stream_with_matching_duration(self):
        probe = {"streams": [{"codec_type": "video"}, {"codec_type": "audio"}], "format": {"duration": "12.7"}}
        with mock.patch.object(render, "run", return_value=json.dumps(probe)) as run:
            render.verify_output_audio(Path("render.mp4"), expected_duration=12.75)
        self.assertIn("ffprobe", run.call_args.args[0])

    def test_verify_output_audio_rejects_missing_audio_stream(self):
        probe = {"streams": [{"codec_type": "video"}], "format": {"duration": "12.7"}}
        with mock.patch.object(render, "run", return_value=json.dumps(probe)):
            with self.assertRaisesRegex(RuntimeError, "exactly one audio stream"):
                render.verify_output_audio(Path("render.mp4"), expected_duration=12.75)

    def test_verify_output_audio_rejects_multiple_audio_streams(self):
        probe = {"streams": [{"codec_type": "audio"}, {"codec_type": "audio"}], "format": {"duration": "12.7"}}
        with mock.patch.object(render, "run", return_value=json.dumps(probe)):
            with self.assertRaisesRegex(RuntimeError, "exactly one audio stream"):
                render.verify_output_audio(Path("render.mp4"), expected_duration=12.75)

    def test_verify_output_audio_rejects_duration_mismatch(self):
        probe = {"streams": [{"codec_type": "audio"}], "format": {"duration": "8.0"}}
        with mock.patch.object(render, "run", return_value=json.dumps(probe)):
            with self.assertRaisesRegex(RuntimeError, "duration mismatch"):
                render.verify_output_audio(Path("render.mp4"), expected_duration=12.75)
    def test_run_raises_subprocess_stderr_on_failure(self):
        failed = subprocess.CompletedProcess(["ffmpeg"], 1, stdout="", stderr="codec unavailable")
        with mock.patch.object(render.subprocess, "run", return_value=failed):
            with self.assertRaisesRegex(RuntimeError, "codec unavailable"):
                render.run(["ffmpeg", "-version"])


class RenderCliValidationTests(unittest.TestCase):
    def run_main(self, *args: str) -> tuple[int, str]:
        output = io.StringIO()
        with mock.patch.object(sys, "argv", ["render.py", *args]):
            with contextlib.redirect_stderr(output):
                result = render.main()
        return result, output.getvalue()

    def test_rejects_zero_fps_before_checking_input_files(self):
        result, error = self.run_main(
            "--audio", "missing.mp3",
            "--images", "missing-images",
            "--output", "out.mp4",
            "--fps", "0",
        )
        self.assertEqual(result, 2)
        self.assertIn("FPS must be at least 1", error)


if __name__ == "__main__":
    unittest.main()
