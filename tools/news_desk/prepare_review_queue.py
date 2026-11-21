#!/usr/bin/env python3
"""Turn RSS leads into an editable human-review queue. Never publishes content."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare an editorial review queue from an RSS brief.")
    parser.add_argument("--input", default="output/news-desk/news_brief.json")
    parser.add_argument("--out", default="output/news-desk/review_queue.json")
    args = parser.parse_args()

    source = json.loads(Path(args.input).read_text(encoding="utf-8"))
    queue = []
    for item in source.get("items", []):
        queue.append({
            "lead_id": f"lead-{len(queue) + 1:04d}",
            "headline": item.get("title", ""),
            "category": item.get("category", ""),
            "feed_source": item.get("source", ""),
            "feed_published": item.get("published", ""),
            "lead_url": item.get("url", ""),
            "feed_summary_unverified": item.get("description", ""),
            "workflow_status": "needs_review",
            "primary_source_urls": [],
            "independent_source_urls": [],
            "verified_facts": [],
            "claims_or_allegations": [],
            "uncertainties_and_context": "",
            "editorial_notes": "",
            "editor_name": "",
            "approval_timestamp_utc": "",
            "approved_for_script": False
        })

    payload = {
        "brand": "GLOBAL FUNN",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "instruction": "Complete the review fields. The gate checks documentation completeness only; a human editor remains responsible for truth and fairness.",
        "items": queue
    }
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Prepared {len(queue)} leads for editor review: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
