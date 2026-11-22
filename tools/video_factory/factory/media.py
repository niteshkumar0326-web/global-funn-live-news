"""ffmpeg helpers. All encodes use identical parameters so clips can be concatenated or streamed with -c copy."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

NICE = os.environ.get("GF_NICE", "19")  # keep the trading-bot VPS responsive
THREADS = os.environ.get("GF_THREADS", "2")

# Same parameters everywhere => segment files can be joined with the concat demuxer (-c copy).
VIDEO_ARGS = ["-c:v", "libx264", "-preset", os.environ.get("GF_PRESET", "veryfast"), "-crf", "21",
              "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
              "-keyint_min", "60", "-sc_threshold", "0", "-threads", THREADS]
AUDIO_ARGS = ["-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2"]
AUDIO_FILTER = "aresample=44100,pan=stereo|c0=c0|c1=c0,alimiter=limit=0.89"


def need_tool(name: str) -> str:
    p = shutil.which(name)
    if not p:
        raise RuntimeError(f"{name} not found on PATH (install ffmpeg)")
    return p


def run(cmd: list[str], nice: bool = True) -> None:
    need_tool("ffmpeg")
    full = (["nice", "-n", NICE] if nice and shutil.which("nice") else []) + [str(c) for c in cmd]
    r = subprocess.run(full, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"command failed ({r.returncode}): {' '.join(full)[:400]}\n{r.stderr[-1500:]}")


def ffmpeg(*args: str) -> None:
    run(["ffmpeg", "-y", "-loglevel", "error", *args])


def probe(path: str | Path) -> dict:
    need_tool("ffprobe")
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        capture_output=True, text=True, check=True,
    )
    return json.loads(r.stdout)


def duration(path: str | Path) -> float:
    return float(probe(path)["format"]["duration"])


def stream_signature(path: str | Path) -> tuple:
    """Parameters that must match for -c copy concatenation."""
    v = next(s for s in probe(path)["streams"] if s["codec_type"] == "video")
    a = next((s for s in probe(path)["streams"] if s["codec_type"] == "audio"), {})
    return (v.get("codec_name"), v.get("width"), v.get("height"), v.get("pix_fmt"), v.get("r_frame_rate"),
            a.get("codec_name"), a.get("sample_rate"), a.get("channels"))
