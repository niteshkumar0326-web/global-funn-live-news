from __future__ import annotations

import argparse
from pathlib import Path
import sys

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
HERE = Path(__file__).resolve().parent


def get_youtube():
    secrets = HERE / "client_secrets.json"
    token = HERE / "token.json"
    if not secrets.is_file():
        raise FileNotFoundError(
            f"Missing {secrets}. Create OAuth Desktop credentials in Google Cloud "
            "and save the downloaded file here as client_secrets.json."
        )

    creds = Credentials.from_authorized_user_file(str(token), SCOPES) if token.exists() else None
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(secrets), SCOPES)
        creds = flow.run_local_server(port=0, prompt="consent")
        token.write_text(creds.to_json(), encoding="utf-8")
    return build("youtube", "v3", credentials=creds)


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload a reviewed video to the authorized YouTube channel.")
    parser.add_argument("--video", required=True, help="MP4 file")
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", default="")
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    parser.add_argument("--publish-at", default=None, help="ISO 8601 UTC time, e.g. 2026-12-01T10:00:00Z; requires private")
    parser.add_argument("--category", default="25", help="YouTube category ID; 25 = News & Politics")
    args = parser.parse_args()

    video = Path(args.video)
    if not video.is_file():
        print(f"Video not found: {video}", file=sys.stderr)
        return 2
    if args.publish_at and args.privacy != "private":
        print("--publish-at requires --privacy private.", file=sys.stderr)
        return 2
    if args.privacy == "public":
        print("PUBLIC UPLOAD REQUESTED. Confirm the title, description, factual accuracy, rights and audience settings before proceeding.")

    snippet = {
        "title": args.title[:100],
        "description": args.description,
        "categoryId": args.category,
        "tags": [tag.strip() for tag in args.tags.split(",") if tag.strip()][:30],
    }
    status = {"privacyStatus": args.privacy}
    if args.publish_at:
        status["publishAt"] = args.publish_at

    try:
        youtube = get_youtube()
        request = youtube.videos().insert(
            part="snippet,status",
            body={"snippet": snippet, "status": status},
            media_body=MediaFileUpload(str(video), chunksize=-1, resumable=True),
        )
        response = None
        while response is None:
            _, response = request.next_chunk()
        print(f"Upload accepted. Video ID: {response.get('id')}")
        print(f"Privacy requested: {args.privacy}")
        if args.publish_at:
            print(f"Scheduled publish time: {args.publish_at}")
        print("Verify processing and visibility in YouTube Studio.")
        return 0
    except Exception as exc:
        print(f"YouTube upload failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
