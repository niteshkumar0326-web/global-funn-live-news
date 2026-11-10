# Shared AI context and token-efficient coding workflow

This project uses a small, layered toolkit rather than installing every token-related repository.

## Selected integrations

### Code Review Graph
Upstream: https://github.com/tirth8205/code-review-graph (MIT). Builds a local structural index and supports targeted context, dependency impact and PR review comments. Run `uvx code-review-graph status` and `uvx code-review-graph update` locally.

### Headroom
Upstream: https://github.com/headroomlabs-ai/headroom (Apache-2.0). Added to project `.mcp.json` as an MCP server. It exposes `headroom_compress`, `headroom_retrieve` and `headroom_stats`. For on-demand compression, ask the agent to compress large repetitive logs, JSON or tool outputs, then retrieve the original when necessary.

The Windows setup script installs Headroom with `uv tool install --python 3.13 "headroom-ai[all]"` and runs `headroom doctor`. For automatic supported Claude API traffic compression, start the proxy in one PowerShell window:

```powershell
headroom proxy
```

Then start Claude Code in a second PowerShell window:

```powershell
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:8787"
claude
```

Use `headroom_stats` or `headroom dashboard` to inspect compression. The proxy is optional and only affects clients deliberately routed through it. It does not intercept the ChatGPT mobile app.

## Windows setup

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-code-review-graph.ps1
```

Restart Claude Code, open this repository and run `/mcp`. Confirm both `code-review-graph` and `headroom` appear. If either is missing, report the actual error; do not assume installation succeeded.

## ChatGPT desktop and mobile

ChatGPT's mobile app and website cannot directly access the local stdio MCP server, desktop terminal hooks, private files or local graph database. The project therefore includes the `/ai-context` AI Context Pocket:
- Open the route from the newsroom dashboard (once the Next.js app is deployed to an approved HTTPS host).
- Enter one bounded task and any short handover notes.
- Copy the compact task prompt or download a JSON context pack.
- Paste it into ChatGPT mobile/desktop or Claude.

Optional notes are stored only in that browser/device's localStorage. There is no cloud sync or deployment in this build. Until the app is deployed, use `docs/AI_CONTEXT_INDEX.md` directly from GitHub on mobile and copy its short project context into the chat.

## Why not install every repository?

RTK (https://github.com/rtk-ai/rtk) is a lightweight terminal-output alternative. Context Mode (https://github.com/mksglu/context-mode) is an alternative for MCP output sandboxing and session continuity. Claude Context Saver (https://github.com/dongnh311/claude-context-saver) is not selected because its current released Windows support note says WSL only. Stacking overlapping tools may add startup cost, MCP schemas, latency and context overhead. Evaluate alternatives only with matched-task tests.

## Token and quality measurement

No savings percentage is promised for GLOBAL FUNN until a baseline and after-install sample are measured on the same tasks. Upstream benchmarks differ by workload and baseline; they are not a guarantee of total model-token or subscription-usage reduction.

For 5–10 representative tasks, compare provider-reported input/cache/output tokens, tool-output bytes, files read, build/test outcome and answer quality. Preserve exact compiler errors, security warnings, source evidence and editorial facts. Provider quotas and rate limits cannot be bypassed.

## GitHub PR review

The Code Review Graph Action posts advisory risk, impact and test-gap comments to qualifying pull requests. It does not block a PR by risk by default; a human must verify the findings and run the build.


## Benchmark before claiming savings

Use the dashboard route `/token-benchmark` to enter provider-reported input tokens and tool-output byte counts for the same task before and after compression. Record answer quality for both runs. Export CSV/JSON for analysis. These are manual measurements; the app does not connect to account usage meters. Do not advertise an overall percentage until multiple comparable tasks have been recorded.
