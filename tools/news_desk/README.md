# GLOBAL FUNN — Free Newsroom RSS Collector

A zero-AI-credit, zero-API-key utility that gathers headline leads from configurable RSS/Atom feeds and creates a Markdown editor brief plus JSON archive.

## Requirements

- Python 3.10 or newer
- Internet access
- No third-party Python packages
- No vidIQ credits, paid AI API, or scheduler required

## Run on Windows

From the repository root in PowerShell:

```powershell
py -3 tools/news_desk/rss_brief.py
```

Optional custom output directory:

```powershell
py -3 tools/news_desk/rss_brief.py --out output/news-desk
```

The tool creates:

- `output/news-desk/news_brief.md` — editor-friendly lead sheet
- `output/news-desk/news_brief.json` — structured lead archive

Edit `feeds.json` to add, remove, or replace RSS/Atom feeds. Keep the source name, URL and category together. A failed feed is reported without stopping the other feeds.

## Editorial gate — mandatory

This collector is a research assistant, not an autonomous publisher.

1. Treat every result as **UNVERIFIED LEAD**.
2. Open the linked original article or primary source; do not rely on an aggregator headline alone.
3. For consequential, disputed, political, financial, health or safety claims, seek an independent credible confirmation and/or the relevant primary document.
4. Separate confirmed facts from allegations, official claims, opinion and analysis.
5. Check publication time, location, context, figures and whether the story has been updated.
6. Record the editor's decision and source links in the rundown.
7. Human editor approval is required before narration, scheduling or going live.

Do not scrape paywalled material, copy full articles, or reuse third-party video/photos without rights. Attribute sources. AI-generated visuals must be labelled **AI ILLUSTRATION** and must never be presented as documentary evidence.

## Limitations

- RSS coverage is incomplete and can be delayed or unavailable.
- Feed summaries may be truncated or altered by publishers/aggregators.
- The tool does not fact-check, rank truth, generate scripts, download media, or publish videos.
- It does not run continuously; run it when preparing an edition.
- Network or feed errors are shown in the output. A zero-result run is not proof that no news exists.
