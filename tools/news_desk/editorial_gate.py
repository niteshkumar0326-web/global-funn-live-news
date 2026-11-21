#!/usr/bin/env python3
"""Check editorial documentation before a lead can move to scripting.

This is a completeness gate, not an automated fact-check or legal review.
It never publishes, schedules, or starts a live stream.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


def valid_http_urls(values: object) -> list[str]:
    if not isinstance(values, list):
        return []
    result = []
    for value in values:
        if isinstance(value, str):
            candidate = value.strip()
            parsed = urlparse(candidate)
            if parsed.scheme in {"http", "https"} and parsed.netloc:
                result.append(candidate)
    return list(dict.fromkeys(result))


def has_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_utc_timestamp(value: object) -> bool:
    if not has_text(value):
        return False
    try:
        parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return False
    return parsed.tzinfo is not None and parsed.utcoffset() == timezone.utc.utcoffset(parsed)


def review(item: dict) -> list[str]:
    missing: list[str] = []
    if not has_text(item.get("headline")):
        missing.append("headline")

    primary_urls = valid_http_urls(item.get("primary_source_urls"))
    independent_urls = valid_http_urls(item.get("independent_source_urls"))
    if not primary_urls:
        missing.append("at least one valid primary_source_url")
    if not independent_urls:
        missing.append("at least one valid independent_source_url")
    if primary_urls and independent_urls and not set(independent_urls).difference(primary_urls):
        missing.append("independent_source_url must differ from primary source URLs")

    facts = item.get("verified_facts")
    if not isinstance(facts, list) or not any(isinstance(x, str) and x.strip() for x in facts):
        missing.append("verified_facts")
    if not isinstance(item.get("claims_or_allegations"), list):
        missing.append("claims_or_allegations (use [] when none)")
    if not has_text(item.get("uncertainties_and_context")):
        missing.append("uncertainties_and_context (write 'None identified' if applicable)")
    if not has_text(item.get("editorial_notes")):
        missing.append("editorial_notes")
    if not has_text(item.get("editor_name")):
        missing.append("editor_name")
    if not is_utc_timestamp(item.get("approval_timestamp_utc")):
        missing.append("approval_timestamp_utc must be a valid timezone-aware UTC timestamp")
    if item.get("workflow_status") != "approved":
        missing.append("workflow_status must be 'approved'")
    if item.get("approved_for_script") is not True:
        missing.append("approved_for_script must be true")
    return missing


def main() -> int:
    parser = argparse.ArgumentParser(description="Check whether reviewed leads meet the documentation gate.")
    parser.add_argument("--input", default="output/news-desk/review_queue.json")
    parser.add_argument("--out", default="output/news-desk/editorial_gate_report.json")
    args = parser.parse_args()

    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    results = []
    for item in payload.get("items", []):
        missing = review(item)
        results.append({
            "lead_id": item.get("lead_id", "unknown"),
            "headline": item.get("headline", ""),
            "gate_result": "READY_FOR_SCRIPT_DRAFT" if not missing else "HOLD",
            "missing_requirements": missing,
            "human_editor_still_accountable": True
        })

    report = {
        "brand": "GLOBAL FUNN",
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "notice": "This checks required documentation only. It does not establish truth, accuracy, fairness, legal safety, copyright clearance, or publishability.",
        "ready_for_script_draft": sum(x["gate_result"] == "READY_FOR_SCRIPT_DRAFT" for x in results),
        "held": sum(x["gate_result"] == "HOLD" for x in results),
        "results": results
    }
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Ready for script draft: {report['ready_for_script_draft']}; held: {report['held']}")
    print(f"Report: {output}")
    return 0 if report["held"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
