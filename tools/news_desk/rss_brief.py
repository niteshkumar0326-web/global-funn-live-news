#!/usr/bin/env python3
"""Collect RSS/Atom headlines into a source-linked newsroom brief.

This tool does not write or verify news. Every item is an unverified lead until
an editor opens the original source, checks the facts, and records a decision.
Uses only Python's standard library; no API key or AI credits required.
"""
from __future__ import annotations

import argparse
import email.utils
import html
import json
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit
from typing import Any


def clean(value: str | None) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, names: set[str]) -> str:
    for child in list(node):
        if local_name(child.tag) in names:
            if local_name(child.tag) == "link":
                href = child.attrib.get("href")
                if href:
                    return href.strip()
            return clean("".join(child.itertext()))
    return ""


def parse_date(raw: str) -> str:
    if not raw:
        return ""
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
    except (TypeError, ValueError, OverflowError):
        try:
            # Atom feeds commonly use ISO 8601 timestamps rather than RFC 822 dates.
            parsed = datetime.fromisoformat(raw.strip().replace("Z", "+00:00"))
        except (TypeError, ValueError, OverflowError):
            return raw.strip()
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).isoformat()


def is_http_url(value: str) -> bool:
    """Accept only absolute HTTP(S) story links; feed IDs are not automatically URLs."""
    try:
        parsed = urlsplit(value.strip())
        return parsed.scheme.lower() in {"http", "https"} and bool(parsed.hostname)
    except ValueError:
        return False


def parse_feed(xml_bytes: bytes, source: dict[str, str]) -> list[dict[str, str]]:
    root = ET.fromstring(xml_bytes)
    entries = [node for node in root.iter() if local_name(node.tag) in {"item", "entry"}]
    results: list[dict[str, str]] = []
    for entry in entries:
        title = child_text(entry, {"title"})
        link = child_text(entry, {"link"})
        if not link:
            link = child_text(entry, {"guid", "id"})
        description = child_text(entry, {"description", "summary", "content", "encoded"})
        published = child_text(entry, {"pubdate", "published", "updated", "date"})
        if not title or not link or not is_http_url(link):
            continue
        results.append({
            "source": source.get("name", "Unknown source"),
            "category": source.get("category", "Uncategorised"),
            "title": title,
            "url": link,
            "published": parse_date(published),
            "description": description[:600],
            "verification_status": "UNVERIFIED LEAD",
        })
    return results


def fetch(url: str, timeout: int) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "GLOBAL-FUNN-Newsroom-RSS/1.0 (+editorial research)"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read(4_000_000)


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a source-linked RSS news brief.")
    parser.add_argument("--config", default="tools/news_desk/feeds.json")
    parser.add_argument("--out", default="output/news-desk")
    parser.add_argument("--timeout", type=int, default=15)
    args = parser.parse_args()

    config_path = Path(args.config)
    config = json.loads(config_path.read_text(encoding="utf-8"))
    feeds = config.get("feeds", [])
    output_dir = Path(args.out)
    output_dir.mkdir(parents=True, exist_ok=True)

    items: list[dict[str, str]] = []
    failures: list[dict[str, str]] = []
    for source in feeds:
        name = source.get("name", source.get("url", "Unnamed feed"))
        try:
            items.extend(parse_feed(fetch(source["url"], args.timeout), source))
            print(f"OK   {name}", file=sys.stderr)
        except (KeyError, OSError, urllib.error.URLError, ET.ParseError, RuntimeError, ValueError) as exc:
            failures.append({"source": name, "error": str(exc)})
            print(f"FAIL {name}: {exc}", file=sys.stderr)

    # Stable deduplication by URL, preserving the first configured source.
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for item in items:
        key = item["url"].strip()
        if key and key not in seen:
            seen.add(key)
            unique.append(item)

    unique.sort(key=lambda item: item.get("published", ""), reverse=True)
    generated = datetime.now(timezone.utc).isoformat()
    payload: dict[str, Any] = {
        "brand": "GLOBAL FUNN",
        "generated_at_utc": generated,
        "notice": "UNVERIFIED LEADS ONLY. Open original sources and independently verify before publication.",
        "items": unique,
        "feed_failures": failures,
    }
    json_path = output_dir / "news_brief.json"
    md_path = output_dir / "news_brief.md"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# GLOBAL FUNN — Newsroom lead brief",
        "",
        f"Generated (UTC): {generated}",
        "",
        "> **EDITORIAL HOLD:** These are unverified leads, not publish-ready news. Open each source, verify the original reporting, cross-check consequential claims, and obtain editor approval.",
        "",
    ]
    if not unique:
        lines += ["No feed items were retrieved. Check network access and feed URLs.", ""]
    for index, item in enumerate(unique, 1):
        lines += [
            f"## {index}. {item['title']}",
            f"- Category: {item['category']}",
            f"- Feed/source label: {item['source']}",
            f"- Published: {item['published'] or 'Not supplied by feed'}",
            f"- Original link: {item['url']}",
            f"- Status: **{item['verification_status']}**",
            f"- Editor notes: [Add primary source, independent cross-check, confirmed facts, disputed claims, and decision]",
        ]
        if item["description"]:
            lines.append(f"- Feed summary (not independently verified): {item['description']}")
        lines.append("")
    if failures:
        lines += ["## Feed errors", ""]
        for failure in failures:
            lines.append(f"- {failure['source']}: {failure['error']}")
        lines.append("")
    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Collected {len(unique)} unique leads; {len(failures)} feed failures.")
    print(f"Created: {json_path} and {md_path}")
    return 0 if unique else 2


if __name__ == "__main__":
    raise SystemExit(main())
