"""Paths, channel config and format sizes."""
from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT_PATH = Path(os.environ.get("GF_FONT", ROOT / "assets" / "fonts" / "NotoSansDevanagari.ttf"))
FONT_URL = (
    "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/"
    "NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf"
)
WORK = Path(os.environ.get("GF_WORK", ROOT / "work"))
OUT = Path(os.environ.get("GF_OUT", ROOT / "out"))
SECRETS = Path(os.environ.get("GF_SECRETS", ROOT / "secrets"))
KOKORO_DIRS = [
    Path(os.environ["GF_KOKORO_DIR"]) if os.environ.get("GF_KOKORO_DIR") else None,
    Path.home() / ".cache" / "globalfunn" / "kokoro",
    ROOT / "models",
    Path("/tmp/kokoro"),
]
KOKORO_FILES = ("kokoro-v1.0.int8.onnx", "voices-v1.0.bin")
KOKORO_BASE_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"

FORMATS = {"short": (1080, 1920), "wide": (1920, 1080)}
FPS = 30


def load_channels(path: str | os.PathLike | None = None) -> dict:
    p = Path(path) if path else ROOT / "channels.json"
    return json.loads(p.read_text(encoding="utf-8"))


def channel(key: str, path: str | os.PathLike | None = None) -> dict:
    """Return the channel block merged over defaults, with its key stored in 'key'."""
    cfg = load_channels(path)
    if key not in cfg["channels"]:
        raise KeyError(f"unknown channel '{key}'. Known: {', '.join(cfg['channels'])}")
    merged = dict(cfg.get("defaults", {}))
    merged.update(cfg["channels"][key])
    merged["key"] = key
    return merged


def kokoro_paths() -> tuple[Path, Path] | None:
    for d in KOKORO_DIRS:
        if d and all((d / f).exists() for f in KOKORO_FILES):
            return d / KOKORO_FILES[0], d / KOKORO_FILES[1]
    return None
