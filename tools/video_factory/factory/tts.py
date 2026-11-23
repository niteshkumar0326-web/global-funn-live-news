"""Free Hindi text-to-speech with Kokoro (Apache-2.0, runs on CPU).

synth_segment("narration text", voice) -> Segment(samples, sr, sentences=[(text, t0, t1)])
Results are cached on disk by hash so re-rendering a bulletin in another format costs nothing.
Set GF_TTS=tone to use a silent-tone stand-in (used by the tests / CI, no model needed).
"""
from __future__ import annotations

import hashlib
import os
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from . import config
from .hindi import speakable, split_sentences

SR = 24000
GAP_SENTENCE = 0.22  # seconds of air after each sentence
GAP_END = 0.30
_kokoro = None


@dataclass
class Segment:
    samples: np.ndarray
    sr: int
    sentences: list[tuple[str, float, float]] = field(default_factory=list)  # text, start, end

    @property
    def duration(self) -> float:
        return len(self.samples) / self.sr


def fetch_models(dest: Path | None = None) -> Path:
    """Download the Kokoro model files (~100 MB) from the official GitHub release."""
    dest = dest or Path.home() / ".cache" / "globalfunn" / "kokoro"
    dest.mkdir(parents=True, exist_ok=True)
    for f in config.KOKORO_FILES:
        target = dest / f
        if not target.exists():
            print(f"downloading {f} ...")
            urllib.request.urlretrieve(config.KOKORO_BASE_URL + f, target)
    return dest


def _engine():
    global _kokoro
    if _kokoro is None:
        paths = config.kokoro_paths()
        if not paths:
            raise RuntimeError(
                "Kokoro model files not found. Run:  python -m factory fetch-models  "
                "(or set GF_KOKORO_DIR)."
            )
        from kokoro_onnx import Kokoro  # imported lazily: heavy

        _kokoro = Kokoro(str(paths[0]), str(paths[1]))
    return _kokoro


def _trim_silence(x: np.ndarray, thr: float = 0.004, keep: int = int(0.05 * SR)) -> np.ndarray:
    idx = np.flatnonzero(np.abs(x) > thr)
    if idx.size == 0:
        return x[:1]
    return x[max(0, idx[0] - keep) : idx[-1] + keep]


def _rms_normalise(x: np.ndarray, target_db: float = -20.0) -> np.ndarray:
    rms = float(np.sqrt(np.mean(np.square(x)) + 1e-12))
    gain = 10 ** (target_db / 20) / rms
    return np.clip(x * min(gain, 8.0), -0.97, 0.97)


def _synth_sentence(text: str, voice: str, speed: float) -> np.ndarray:
    spoken = speakable(text)
    if os.environ.get("GF_TTS") == "tone":
        dur = max(0.8, 0.075 * len(spoken.split()) + 0.4)
        t = np.arange(int(dur * SR)) / SR
        return (0.2 * np.sin(2 * np.pi * (180 + 40 * (sum(map(ord, voice)) % 5)) * t)).astype(np.float32)
    samples, sr = _engine().create(spoken, voice=voice, speed=speed, lang="hi")
    assert sr == SR, sr
    return _rms_normalise(_trim_silence(np.asarray(samples, dtype=np.float32)))


def synth_segment(text: str, voice: str, speed: float = 1.12, cache: bool = True) -> Segment:
    key = hashlib.sha1(f"{os.environ.get('GF_TTS','kokoro')}|{voice}|{speed}|{text}".encode()).hexdigest()
    cdir = config.WORK / "tts_cache"
    cfile = cdir / f"{key}.npz"
    if cache and cfile.exists():
        d = np.load(cfile, allow_pickle=True)
        return Segment(d["samples"], SR, [tuple(s) for s in d["sentences"].tolist()])
    chunks, sentences, t = [], [], 0.0
    for s in split_sentences(text):
        x = _synth_sentence(s, voice, speed)
        gap = np.zeros(int(GAP_SENTENCE * SR), dtype=np.float32)
        chunks += [x, gap]
        sentences.append((s, t, t + len(x) / SR))
        t += (len(x) + len(gap)) / SR
    chunks.append(np.zeros(int(GAP_END * SR), dtype=np.float32))
    seg = Segment(np.concatenate(chunks), SR, sentences)
    if cache:
        cdir.mkdir(parents=True, exist_ok=True)
        np.savez(cfile, samples=seg.samples, sentences=np.array(sentences, dtype=object))
    return seg


def write_wav(path: Path, samples: np.ndarray, sr: int = SR) -> None:
    import soundfile as sf

    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), samples, sr)
