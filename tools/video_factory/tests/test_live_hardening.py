import io
import json
import sys
import time
import types

from factory import live


def test_health_states(tmp_path):
    f = tmp_path / "status.json"
    ok, msg = live.health(f)
    assert not ok and "never started" in msg
    f.write_text(json.dumps({"state": "on-air", "restarts": 1, "updated": time.time(), "playlist": ["a.ts"]}))
    assert live.health(f)[0]
    f.write_text(json.dumps({"state": "on-air", "restarts": 1, "updated": time.time() - 500, "playlist": []}))
    ok, msg = live.health(f)
    assert not ok and "stuck" in msg
    f.write_text(json.dumps({"state": "restarting", "restarts": 4, "updated": time.time(), "last_error": "boom"}))
    ok, msg = live.health(f)
    assert not ok and "boom" in msg


def test_stderr_tail_drains_a_huge_stream_and_keeps_tail():
    big = io.StringIO("".join(f"warning line {i}\n" for i in range(50000)))
    t = live.StderrTail(big, keep=100)
    out = t.text()
    assert len(out) <= 100 and out.rstrip().endswith("warning line 49999")


def test_redact_hides_stream_key():
    assert live.redact("rtmp://x/live2/SECRET123 failed", "SECRET123") == "rtmp://x/live2/**** failed"
    assert live.redact("nothing", None) == "nothing"


def test_safe_collect_falls_back_to_standby(tmp_path, monkeypatch):
    r = live.LiveRunner("live_news", root=tmp_path / "live")
    sb = r.p.ts / "standby.ts"
    sb.write_bytes(b"x")
    monkeypatch.setattr(r, "collect", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("ffmpeg exploded")))
    assert r.safe_collect() == [sb]
    st = json.loads(r.p.status.read_text())
    assert st["state"] == "degraded" and "ffmpeg exploded" in st["last_error"]


def test_rtmp_target_needs_key_and_never_logs_it(tmp_path, monkeypatch):
    r = live.LiveRunner("live_news", root=tmp_path / "live")
    env = r.ch.get("live", {}).get("stream_key_env", "YT_STREAM_KEY_LIVE_NEWS")
    monkeypatch.delenv(env, raising=False)
    try:
        r.rtmp_target()
        assert False, "must refuse to start without a key"
    except RuntimeError as e:
        assert "stream key" in str(e)
    monkeypatch.setenv(env, "abc123")
    assert r.rtmp_target().endswith("/abc123")


def test_playlist_uses_relative_paths_and_self_include(tmp_path):
    r = live.LiveRunner("live_news", root=tmp_path / "live")
    a = r.p.ts / "a b.ts"
    a.write_bytes(b"x")
    r.write_playlist([a])
    body = r.p.playlist.read_text()
    assert body.startswith("ffconcat version 1.0") and "file 'playlist.txt'" in body and str(tmp_path) not in body


def test_cli_live_health_exit_codes(tmp_path, monkeypatch, capsys):
    from factory import __main__ as cli, config

    monkeypatch.setattr(config, "ROOT", tmp_path)
    assert cli.main(["live-health"]) == 2
    d = tmp_path / "live" / "live_news"
    d.mkdir(parents=True)
    (d / "status.json").write_text(json.dumps({"state": "on-air", "restarts": 0, "updated": time.time(), "playlist": []}))
    assert cli.main(["live-health"]) == 0
