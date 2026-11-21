from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def run(command: list[str]) -> str:
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "Command failed")
    return result.stdout.strip()


def duration_of(audio: Path) -> float:
    value = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(audio)
    ])
    return float(value)



def verify_output_audio(output: Path, expected_duration: float) -> None:
    """Fail closed unless the rendered MP4 contains one valid audio stream."""
    raw = run([
        "ffprobe", "-v", "error", "-show_streams", "-show_format",
        "-of", "json", str(output),
    ])
    try:
        metadata = json.loads(raw)
        audio_streams = [
            stream for stream in metadata.get("streams", [])
            if stream.get("codec_type") == "audio"
        ]
        actual_duration = float(metadata["format"]["duration"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise RuntimeError("FFprobe returned invalid output audio metadata.") from exc

    if len(audio_streams) != 1:
        raise RuntimeError(
            f"Rendered video must contain exactly one audio stream; found {len(audio_streams)}."
        )
    if not math.isfinite(actual_duration) or abs(actual_duration - expected_duration) > 1.0:
        raise RuntimeError(
            f"Rendered audio/video duration mismatch: expected about {expected_duration:.1f}s, "
            f"found {actual_duration:.1f}s."
        )

def escape_concat(path: Path) -> str:
    return str(path.resolve()).replace("\\", "/").replace("'", "'\\''")


def main() -> int:
    parser = argparse.ArgumentParser(description="Render an image-led GLOBAL FUNN video.")
    parser.add_argument("--audio", required=True)
    parser.add_argument("--images", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--format", choices=["landscape", "vertical", "square"], default="landscape")
    parser.add_argument("--srt", default=None)
    parser.add_argument("--fps", type=int, default=30)
    args = parser.parse_args()

    if args.fps < 1:
        print("FPS must be at least 1.", file=sys.stderr)
        return 2

    audio = Path(args.audio)
    image_dir = Path(args.images)
    output = Path(args.output)
    srt = Path(args.srt) if args.srt else None

    if not audio.is_file():
        print(f"Audio not found: {audio}", file=sys.stderr)
        return 2
    if not image_dir.is_dir():
        print(f"Image folder not found: {image_dir}", file=sys.stderr)
        return 2
    images = sorted(p for p in image_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS)
    if not images:
        print(f"No JPG/PNG/WebP images found in {image_dir}", file=sys.stderr)
        return 2
    if srt and not srt.is_file():
        print(f"Subtitle file not found: {srt}", file=sys.stderr)
        return 2
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("FFmpeg and FFprobe must both be installed and available in PATH.", file=sys.stderr)
        return 2

    width, height = {
        "landscape": (1920, 1080),
        "vertical": (1080, 1920),
        "square": (1080, 1080),
    }[args.format]

    try:
        total = duration_of(audio)
        if total <= 0:
            raise ValueError("Audio duration is zero.")
        per_image = total / len(images)
        output.parent.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory(prefix="global-funn-") as temp:
            concat_file = Path(temp) / "images.txt"
            lines = []
            for image in images:
                lines.append(f"file '{escape_concat(image)}'")
                lines.append(f"duration {per_image:.6f}")
            # Repeat last frame so concat demuxer honors the final duration.
            lines.append(f"file '{escape_concat(images[-1])}'")
            concat_file.write_text("\n".join(lines) + "\n", encoding="utf-8")

            vf = (
                f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
                f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,"
                "format=yuv420p"
            )
            if srt:
                # FFmpeg filter paths need escaped drive-colons and backslashes on Windows.
                subtitle_path = str(srt.resolve()).replace("\\", "/").replace(":", "\\:")
                vf += f",subtitles='{subtitle_path}'"

            command = [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-f", "concat", "-safe", "0", "-i", str(concat_file),
                "-i", str(audio),
                "-vf", vf,
                "-r", str(args.fps),
                "-t", f"{total:.3f}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "21",
                "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart",
                str(output)
            ]
            run(command)

        if not output.is_file() or output.stat().st_size < 10000:
            raise RuntimeError("Output MP4 is missing or unexpectedly small.")
        verify_output_audio(output, expected_duration=total)
        print("Audio QA: PASS (exactly one audio stream; duration within 1.0s).")
        print(f"Created: {output.resolve()}")
        print(f"Duration: {total:.1f}s | Images: {len(images)} | Format: {args.format}")
        print("Review the full video, audio sync, captions, factual accuracy and rights before upload.")
        return 0
    except Exception as exc:
        print(f"Render failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
