# GLOBAL FUNN — Editorial review workflow

## 1. Collect leads

From the repository root:

```powershell
py -3 tools/news_desk/rss_brief.py
```

## 2. Prepare the editor queue

```powershell
py -3 tools/news_desk/prepare_review_queue.py
```

Open `output/news-desk/review_queue.json` in a text editor. For each lead, complete the review fields:

- `primary_source_urls`: direct official document, dataset, court filing, company release, interview or first-hand reporting where relevant.
- `independent_source_urls`: independent credible reporting or corroboration; do not list a second URL from the same publisher as independent confirmation.
- `verified_facts`: only facts checked against the cited sources.
- `claims_or_allegations`: attribute allegations and official claims; use an empty array if none.
- `uncertainties_and_context`: explain what remains unknown or write `None identified`.
- `editorial_notes`: context, fairness, privacy, defamation, safety and copyright checks.
- `editor_name` and `approval_timestamp_utc`: accountable human reviewer and approval time.
- Set `workflow_status` to `approved` and `approved_for_script` to `true` only after the editor has actually completed the review.

Never invent source URLs, facts, approvals or timestamps. If a story cannot be adequately checked, leave it on hold.

## 3. Run the documentation gate

```powershell
py -3 tools/news_desk/editorial_gate.py
```

The report is written to `output/news-desk/editorial_gate_report.json`. A lead marked `READY_FOR_SCRIPT_DRAFT` has only passed a required-fields checklist. It is not automatically true, fair, legally safe, copyright-cleared or approved for publication. The editor must make that final decision.

## 4. Script and publish

Only after the editor's substantive review should the story move to script drafting. Keep citations and attribution in the script, distinguish fact from analysis, and label illustrative AI visuals. A separate final pre-publication approval is required for every upload and live bulletin.

## Important limitations

- This is a local file workflow; it is not yet connected to the dashboard, YouTube, Metricool or a live broadcast.
- It does not automatically discover primary sources or assess source independence.
- It does not provide legal review, fact-checking, or copyright clearance.
- No script, upload, schedule or broadcast is triggered by this tool.
