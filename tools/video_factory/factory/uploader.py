"""Bulk YouTube uploader (free: YouTube Data API v3, no paid service).

* One OAuth token per channel (secrets/<channel>.token.json) - never committed.
* A ledger (ledger.json) makes uploads idempotent (same file is never uploaded twice) and counts
  quota. Default API quota is 10,000 units/day per Google Cloud project; videos.insert costs ~1,600,
  so ~6 uploads/day/project. Quota resets at midnight Pacific time. The uploader stops by itself at
  the daily budget instead of failing halfway.
* Privacy comes from the editorial gate in upload.json: "private" unless a human approved the spec.
  scheduled = private + publishAt (YouTube flips it public at that time).
* containsSyntheticMedia is always true (AI voice / visuals disclosure).
"""
from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from . import config

UPLOAD_COST = 1600
THUMB_COST = 50
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
IST = ZoneInfo("Asia/Kolkata")
PT = ZoneInfo("America/Los_Angeles")


class QuotaExceeded(RuntimeError):
    pass


# ---------------------------------------------------------------- ledger
class Ledger:
    def __init__(self, path: Path | None = None):
        self.path = Path(path or config.ROOT / "ledger.json")
        self.data = {"uploads": {}, "quota": {}}
        if self.path.exists():
            self.data = json.loads(self.path.read_text(encoding="utf-8"))

    def save(self) -> None:
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    @staticmethod
    def file_key(path: Path) -> str:
        h = hashlib.sha1()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        return h.hexdigest()

    @staticmethod
    def quota_day(now: datetime | None = None) -> str:
        return (now or datetime.now(timezone.utc)).astimezone(PT).strftime("%Y-%m-%d")

    def used(self, now: datetime | None = None) -> int:
        return int(self.data["quota"].get(self.quota_day(now), 0))

    def add_quota(self, units: int, now: datetime | None = None) -> None:
        d = self.quota_day(now)
        self.data["quota"][d] = int(self.data["quota"].get(d, 0)) + units

    def get(self, key: str) -> dict | None:
        return self.data["uploads"].get(key)

    def record(self, key: str, info: dict) -> None:
        self.data["uploads"][key] = info


# ---------------------------------------------------------------- scheduling
def next_slots(now: datetime, slots_ist: list[str], n: int, taken: set[str] | None = None) -> list[datetime]:
    """Next n future publish times (UTC) at the given IST clock slots, skipping already used ones."""
    taken = taken or set()
    out: list[datetime] = []
    day = now.astimezone(IST).date()
    while len(out) < n:
        for s in sorted(slots_ist):
            hh, mm = map(int, s.split(":"))
            dt = datetime(day.year, day.month, day.day, hh, mm, tzinfo=IST).astimezone(timezone.utc)
            iso = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            if dt > now + timedelta(minutes=20) and iso not in taken:
                out.append(dt)
                if len(out) == n:
                    break
        day += timedelta(days=1)
    return out


def iso_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------- auth / service
def token_path(channel: str) -> Path:
    return config.SECRETS / f"{channel}.token.json"


def authorize(channel: str, client_secret: Path | None = None) -> Path:
    """Run ONCE on your own PC (opens a browser). Pick the right YouTube channel in the Google screen."""
    from google_auth_oauthlib.flow import InstalledAppFlow

    cs = client_secret or config.SECRETS / "client_secret.json"
    flow = InstalledAppFlow.from_client_secrets_file(str(cs), SCOPES)
    creds = flow.run_local_server(port=0)
    tp = token_path(channel)
    tp.parent.mkdir(parents=True, exist_ok=True)
    tp.write_text(creds.to_json(), encoding="utf-8")
    return tp


def build_service(channel: str):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    tp = token_path(channel)
    if not tp.exists():
        raise FileNotFoundError(f"{tp} missing. Run: python -m factory auth --channel {channel}")
    creds = Credentials.from_authorized_user_file(str(tp), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        tp.write_text(creds.to_json(), encoding="utf-8")
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


# ---------------------------------------------------------------- upload
def _body(pkg: dict) -> dict:
    status = {
        "privacyStatus": "private" if pkg["privacy"] in ("private", "scheduled") else pkg["privacy"],
        "selfDeclaredMadeForKids": bool(pkg.get("made_for_kids", False)),
        "containsSyntheticMedia": bool(pkg.get("contains_synthetic_media", True)),
    }
    if pkg.get("publish_at"):
        status["privacyStatus"] = "private"
        status["publishAt"] = pkg["publish_at"]
    return {
        "snippet": {
            "title": pkg["title"],
            "description": pkg["description"],
            "tags": pkg.get("tags", [])[:15],
            "categoryId": pkg.get("category_id", "25"),
            "defaultLanguage": pkg.get("language", "hi"),
            "defaultAudioLanguage": pkg.get("language", "hi"),
        },
        "status": status,
    }


def upload_one(service, pkg: dict, ledger: Ledger, *, dry_run: bool = False, daily_budget: int = 6,
               now: datetime | None = None, sleep=time.sleep) -> dict:
    """Upload a single package. Returns a result dict; raises QuotaExceeded when the budget is used."""
    video = Path(pkg["video"])
    key = Ledger.file_key(video)
    done = ledger.get(key)
    if done:
        return {"status": "skipped", "reason": "already uploaded", "video_id": done.get("video_id")}
    if ledger.used(now) + UPLOAD_COST > daily_budget * UPLOAD_COST:
        raise QuotaExceeded(f"daily budget of {daily_budget} uploads reached ({ledger.used(now)} units used)")
    body = _body(pkg)
    if dry_run:
        return {"status": "dry-run", "title": pkg["title"], "privacy": body["status"], "bytes": video.stat().st_size}

    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    media = MediaFileUpload(str(video), chunksize=8 * 1024 * 1024, resumable=True, mimetype="video/mp4")
    request = service.videos().insert(part="snippet,status", body=body, media_body=media)
    response, retries = None, 0
    while response is None:
        try:
            _, response = request.next_chunk()
        except HttpError as e:
            reason = str(e)
            if e.resp.status == 403 and "quota" in reason.lower():
                ledger.data["quota"][ledger.quota_day(now)] = daily_budget * UPLOAD_COST
                ledger.save()
                raise QuotaExceeded("YouTube says quota exceeded; resume after midnight Pacific") from e
            if e.resp.status in (500, 502, 503, 504) and retries < 8:
                retries += 1
                sleep(min(2 ** retries, 60))
                continue
            raise
    ledger.add_quota(UPLOAD_COST, now)
    video_id = response["id"]
    thumb = pkg.get("thumbnail")
    if thumb and Path(thumb).exists():
        service.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(thumb)).execute()
        ledger.add_quota(THUMB_COST, now)
    ledger.record(key, {"video_id": video_id, "title": pkg["title"], "channel": pkg["channel"],
                        "privacy": body["status"]["privacyStatus"], "publish_at": pkg.get("publish_at"),
                        "uploaded_at": (now or datetime.now(timezone.utc)).isoformat()})
    ledger.save()
    return {"status": "uploaded", "video_id": video_id, "privacy": body["status"]["privacyStatus"]}


def collect_packages(root: Path, channel: str | None = None, fmt: str | None = None) -> list[Path]:
    pk = sorted(root.rglob("*.upload.json"))
    out = []
    for p in pk:
        d = json.loads(p.read_text(encoding="utf-8"))
        if channel and d["channel"] != channel:
            continue
        if fmt and d["format"] != fmt:
            continue
        out.append(p)
    return out


def run_queue(root: Path, *, channel: str | None = None, fmt: str | None = None, schedule: bool = False,
              dry_run: bool = False, service_factory=build_service, ledger: Ledger | None = None,
              now: datetime | None = None, limit: int | None = None) -> list[dict]:
    """Upload every pending package under root. With schedule=True, approved items get publishAt slots."""
    ledger = ledger or Ledger()
    now = now or datetime.now(timezone.utc)
    results, services = [], {}
    taken = {v.get("publish_at") for v in ledger.data["uploads"].values() if v.get("publish_at")}
    for path in collect_packages(root, channel, fmt):
        pkg = json.loads(path.read_text(encoding="utf-8"))
        ch = config.channel(pkg["channel"])
        if schedule and pkg["gate"]["may_publish"] and not pkg.get("publish_at") and ch.get("publish_mode") != "private":
            slot = next_slots(now, ch.get("slots_ist", ["07:30"]), 1, taken)[0]
            pkg["publish_at"] = iso_utc(slot)
            taken.add(pkg["publish_at"])
        elif not pkg["gate"]["may_publish"]:
            pkg["privacy"] = "private"  # hard guarantee: unapproved content never goes public
            pkg["publish_at"] = None
        if limit is not None and sum(r.get("status") == "uploaded" for r in results) >= limit:
            break
        try:
            svc = None if dry_run else services.setdefault(pkg["channel"], service_factory(pkg["channel"]))
            r = upload_one(svc, pkg, ledger, dry_run=dry_run, daily_budget=int(ch.get("daily_upload_budget", 6)), now=now)
        except QuotaExceeded as e:
            results.append({"package": str(path), "status": "quota", "reason": str(e)})
            break
        r["package"] = str(path)
        results.append(r)
        if r["status"] == "uploaded":
            pkg_done = path.with_suffix(".uploaded.json")
            pkg_done.write_text(json.dumps({**pkg, **r}, ensure_ascii=False, indent=2), encoding="utf-8")
    return results
