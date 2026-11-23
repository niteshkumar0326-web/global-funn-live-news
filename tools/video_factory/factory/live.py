"""24x7 live runner: one never-ending ffmpeg stream to YouTube Live (RTMP), fed from a rolling playlist.

How it works (free, runs on a small VPS):
  * Finished 1920x1080 bulletins/podcasts are dropped into  live/<channel>/inbox/  (by `factory batch`
    or by hand). They are remuxed (or re-encoded once) to identical MPEG-TS parts: no re-encode on air.
  * playlist.txt is an ffconcat list that ends by including itself, so ffmpeg loops forever and re-reads
    the list at the end of every pass. The supervisor rewrites it atomically: NEW items first, then
    items younger than max_age_hours (news goes stale), then evergreen/, then the standby card.
  * If ffmpeg dies or its progress stalls, the supervisor restarts it with back-off. The stream key is
    read from an environment variable and never written to disk or logs.
Honest limits: YouTube may treat endless re-runs of the same AI clips as repetitious content, so the
playlist prefers fresh items and the standby card says so on screen. Feed it new bulletins every hour.
"""
from __future__ import annotations

import json
import os
import random
import re
import shutil
import subprocess
import threading
import time
from dataclasses import dataclass
from pathlib import Path

from . import config, media

TARGET_SIG = ("h264", 1920, 1080, "yuv420p", "30/1", "aac", "44100", 2)
PASS_SECONDS = 8 * 60  # re-read the list at least this often so fresh items air quickly


def safe_name(stem: str) -> str:
    """ffconcat 'safe' mode (used for the nested self-include) only accepts plain file names."""
    return re.sub(r"[^A-Za-z0-9._-]", "_", stem)


def redact(text: str, secret: str | None) -> str:
    return text.replace(secret, "****") if secret else text


class StderrTail:
    """Drain a pipe continuously (so ffmpeg can never block on a full stderr pipe) and keep only the tail."""

    def __init__(self, stream, keep: int = 2000):
        self.keep, self.buf = keep, ""
        self.t = threading.Thread(target=self._pump, args=(stream,), daemon=True)
        self.t.start()

    def _pump(self, stream):
        try:
            for line in stream:
                self.buf = (self.buf + line)[-self.keep:]
        except (ValueError, OSError):
            pass

    def text(self) -> str:
        self.t.join(timeout=2)
        return self.buf


def health(status_file: Path, max_age: float = 120.0, now: float | None = None) -> tuple[bool, str]:
    """Used by the watchdog timer: is the live supervisor alive and on air?"""
    try:
        st = json.loads(Path(status_file).read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        return False, "no status file: supervisor never started"
    age = (now or time.time()) - float(st.get("updated", 0))
    if age > max_age:
        return False, f"status is {int(age)}s old: supervisor stuck or dead"
    if st.get("state") != "on-air":
        return False, f"state={st.get('state')} restarts={st.get('restarts')} err={st.get('last_error', '')[-200:]}"
    return True, f"on-air restarts={st.get('restarts')} playlist={len(st.get('playlist', []))} parts"


@dataclass
class LivePaths:
    root: Path

    @property
    def inbox(self): return self.root / "inbox"
    @property
    def library(self): return self.root / "library"
    @property
    def evergreen(self): return self.root / "evergreen"
    @property
    def ts(self): return self.root / "ts"
    @property
    def playlist(self): return self.root / "playlist.txt"
    @property
    def state(self): return self.root / "state.json"
    @property
    def status(self): return self.root / "status.json"
    @property
    def progress(self): return self.root / "progress.txt"
    @property
    def standby(self): return self.ts / "standby.ts"

    def make(self):
        for d in (self.inbox, self.library, self.evergreen, self.ts):
            d.mkdir(parents=True, exist_ok=True)


def to_ts(src: Path, dst: Path) -> Path:
    """Make a transport-stream part with the stream parameters every part must share."""
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return dst
    tmp = dst.with_suffix(".part.ts")
    if media.stream_signature(src) == TARGET_SIG:
        media.ffmpeg("-i", str(src), "-c", "copy", "-bsf:v", "h264_mp4toannexb", "-f", "mpegts", str(tmp))
    else:
        vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1"
        media.ffmpeg("-i", str(src), "-vf", vf, *media.VIDEO_ARGS, "-maxrate", "4500k", "-bufsize", "9000k",
                     *media.AUDIO_ARGS, "-bsf:v", "h264_mp4toannexb", "-f", "mpegts", str(tmp))
    tmp.replace(dst)
    return dst


class LiveRunner:
    def __init__(self, channel_key: str, root: Path | None = None, max_age_hours: float = 12.0,
                 channels_path: str | None = None):
        self.ch = config.channel(channel_key, channels_path)
        self.p = LivePaths(root or config.ROOT / "live" / channel_key)
        self.p.make()
        self.max_age = max_age_hours * 3600
        self.state = json.loads(self.p.state.read_text()) if self.p.state.exists() else {"last_included": {}}

    # ---- content selection ------------------------------------------------
    def _save_state(self):
        self.p.state.write_text(json.dumps(self.state, indent=2))

    def ensure_standby(self) -> Path:
        if self.p.standby.exists():
            return self.p.standby
        from .cards import Cards

        cards = Cards(self.ch, "wide")
        img = cards.title_card(self.ch["name"], self.ch.get("sub_name", ""), "अगला बुलेटिन थोड़ी देर में",
                               "आप देख रहे हैं " + self.ch.get("tagline", ""), self.ch.get("ai_label", ""),
                               tag="LIVE")
        png = self.p.ts / "standby.png"
        img.save(png)
        mp4 = self.p.ts / "standby.mp4"
        media.ffmpeg("-loop", "1", "-framerate", "30", "-t", "30", "-i", str(png),
                     "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "30", *media.VIDEO_ARGS,
                     *media.AUDIO_ARGS, "-shortest", str(mp4))
        return to_ts(mp4, self.p.standby)

    def collect(self, now: float | None = None) -> list[Path]:
        """Ordered list of ts parts for the next pass."""
        now = now or time.time()
        fresh = []
        for f in sorted(self.p.inbox.glob("*.mp4"), key=lambda x: x.stat().st_mtime):
            try:
                fresh.append((f, to_ts(f, self.p.ts / (safe_name(f.stem) + ".ts"))))
            except Exception as e:  # a broken file must never take the channel off air
                bad = f.with_name(f.name + ".bad")
                f.rename(bad)
                bad.with_name(bad.name + ".txt").write_text(str(e)[-1500:])
        for f, _ in fresh:  # after first inclusion they move to the library
            shutil.move(str(f), self.p.library / f.name)
            self.state["last_included"][f.name] = now
        recent = []
        for f in self.p.library.glob("*.mp4"):
            if now - f.stat().st_mtime <= self.max_age:
                recent.append(f)
        recent.sort(key=lambda f: self.state["last_included"].get(f.name, 0))  # least recently aired first
        parts = [ts for _, ts in fresh]
        for f in recent:
            if f.name in {x.name for x, _ in fresh}:
                continue
            parts.append(to_ts(f, self.p.ts / (safe_name(f.stem) + ".ts")))
            self.state["last_included"][f.name] = now
        ever = sorted(self.p.evergreen.glob("*.mp4"))
        random.shuffle(ever)
        for f in ever[:3]:
            parts.append(to_ts(f, self.p.ts / ("ever_" + safe_name(f.stem) + ".ts")))
        if not parts:
            parts = [self.ensure_standby()]
        # keep one pass short so new items are picked up quickly
        out, total = [], 0.0
        for ts in parts:
            d = media.duration(ts)
            if out and total + d > PASS_SECONDS:
                break
            out.append(ts)
            total += d
        self._save_state()
        return out

    def safe_collect(self) -> list[Path]:
        """collect() must never take the channel off air: on any error fall back to the standby card."""
        try:
            return self.collect()
        except Exception as e:  # noqa: BLE001
            self._status("degraded", self.state.get("restarts", 0), [], f"collect failed: {str(e)[-300:]}")
            return [self.ensure_standby()]

    def write_playlist(self, parts: list[Path]) -> None:
        # Relative paths on purpose: the nested self-include is parsed in ffconcat "safe" mode,
        # which rejects absolute paths.
        base = self.p.playlist.parent.resolve()
        body = "ffconcat version 1.0\n" + "".join(
            f"file '{os.path.relpath(p.resolve(), base)}'\n" for p in parts)
        body += f"file '{self.p.playlist.name}'\n"  # include self => loop + re-read every pass
        tmp = self.p.playlist.with_suffix(".tmp")
        tmp.write_text(body)
        tmp.replace(self.p.playlist)

    # ---- ffmpeg -------------------------------------------------------------
    def command(self, target: str, realtime: bool = True, seconds: float | None = None) -> list[str]:
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-progress", str(self.p.progress), "-nostats"]
        if realtime:
            cmd.append("-re")
        cmd += ["-f", "concat", "-safe", "0", "-i", str(self.p.playlist), "-c", "copy"]
        if seconds:
            cmd += ["-t", str(seconds)]
        if target.startswith("rtmp"):
            cmd += ["-flvflags", "no_duration_filesize", "-f", "flv", target]
        else:
            cmd += ["-f", "mpegts", target]
        return cmd

    def rtmp_target(self) -> str:
        live = self.ch.get("live", {})
        key = os.environ.get(live.get("stream_key_env", ""), "")
        if not key:
            raise RuntimeError(f"set env {live.get('stream_key_env')} to the YouTube stream key")
        return f"{live.get('rtmp', 'rtmp://a.rtmp.youtube.com/live2')}/{key}"

    def _stalled(self, since: float, limit: float = 45.0) -> bool:
        try:
            return time.time() - self.p.progress.stat().st_mtime > limit and time.time() - since > limit
        except FileNotFoundError:
            return time.time() - since > limit

    def run_forever(self, target: str | None = None, poll: float = 10.0, sleep=time.sleep) -> None:
        target = target or self.rtmp_target()
        secret = target.rsplit("/", 1)[-1]
        backoff, restarts = 2.0, 0
        while True:
            parts = self.safe_collect()
            self.write_playlist(parts)
            started = time.time()
            proc = subprocess.Popen(["nice", "-n", media.NICE] + self.command(target),
                                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
            tail = StderrTail(proc.stderr) if proc.stderr else None
            last_list = started
            while proc.poll() is None:
                sleep(poll)
                if time.time() - last_list >= PASS_SECONDS / 2:  # refresh list so fresh items air soon
                    parts = self.safe_collect()
                    self.write_playlist(parts)
                    last_list = time.time()
                if self._stalled(started):
                    proc.kill()
                self._status("on-air", restarts, parts)
            err = redact(tail.text()[-600:] if tail else "", secret)
            restarts += 1
            self._status("restarting", restarts, parts, err)
            backoff = 2.0 if time.time() - started > 120 else min(backoff * 2, 60.0)
            sleep(backoff)

    def _status(self, state: str, restarts: int, parts: list[Path], err: str = "") -> None:
        self.p.status.write_text(json.dumps({
            "channel": self.ch["key"], "state": state, "restarts": restarts, "updated": time.time(),
            "playlist": [p.name for p in parts], "last_error": err}, ensure_ascii=False, indent=2))
