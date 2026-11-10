# GLOBAL FUNN — Claude Code project notes

Start with `docs/AI_CONTEXT_INDEX.md`, then read `AGENTS.md` for shared rules. Consult only the relevant `docs/PROJECT_STATUS.md` entry when build history is needed; never load the full history for routine tasks.

## Token-saving default
Use Code Review Graph MCP first when connected:
1. `get_minimal_context_tool(task="...")`
2. Targeted graph search / impact tools with `detail_level="minimal"`.
3. Read only the affected source and relevant tests; verify graph findings against source.
4. For a review, use `detect_changes_tool` and `get_review_context_tool`.

If the MCP server is not connected, say so and use targeted file reads. Never assume the local graph database exists or is current.

## Commands
- Install dependencies: `npm install`
- Production build: `npm run build`
- Code graph setup (Windows): `powershell -ExecutionPolicy Bypass -File scripts/setup-code-review-graph.ps1`
- Refresh graph: `uvx code-review-graph update`
- Check graph: `uvx code-review-graph status`


## Token-saver tools
- Headroom: use `headroom_compress` for large outputs; for full proxy compression, start `headroom proxy` and launch Claude with `$env:ANTHROPIC_BASE_URL="http://127.0.0.1:8787"; claude`. Use `headroom_stats` to inspect savings.
- MCPs: verify both `code-review-graph` and `headroom` in `/mcp`; if one is missing, report that rather than pretending it is active.
- Start from the task-specific context pack at `/ai-context` when a handover is useful; do not paste the full build history.
- Avoid stacking Headroom / Context Mode / SQZ with the selected stack until an A/B test proves extra value.
