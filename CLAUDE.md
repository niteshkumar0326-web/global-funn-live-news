# GLOBAL FUNN — Claude Code project notes

Read `AGENTS.md` for shared rules. Consult `docs/PROJECT_STATUS.md` only for the relevant build history; avoid loading the full history on routine tasks.

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
