# Shared AI context and token-efficient coding workflow

This project integrates **code-review-graph** (MIT-licensed upstream project: https://github.com/tirth8205/code-review-graph) as a local structural index and pull-request review assistant.

## What it does
- Parses source structure (functions, classes, imports, calls and tests) into a local SQLite graph.
- Uses incremental updates and targeted MCP queries to reduce repeated whole-repository reads.
- Provides change-impact analysis and a sticky risk-scored review comment on GitHub pull requests.
- Keeps the local graph database on the developer's machine; it is not committed or uploaded by the local MCP server.

The upstream project's benchmarks are workload-dependent. Its published ~63x median compares graph retrieval with a whole-corpus baseline; against a more realistic grep-and-read baseline it reports a smaller ~6.65x median. Small one-file changes may not save tokens. These are upstream benchmark results, not a measured saving for GLOBAL FUNN.

## Claude Code on Windows
From the repository root, open PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-code-review-graph.ps1
```

The setup script installs `uv` for the current Python user, installs the Claude Code MCP configuration and update hooks using the upstream installer, builds the local graph and prints its status. Restart Claude Code and run `/mcp`; the server should list `code-review-graph`.

Useful commands:

```powershell
uvx code-review-graph status
uvx code-review-graph update
uvx code-review-graph detect-changes --brief
uvx code-review-graph visualize
```

The generated graph database is local and ignored by Git. Do not commit `.code-review-graph/`.

## ChatGPT workflow
ChatGPT's custom MCP connection support is plan/workspace-dependent, and ChatGPT cannot connect directly to a developer machine's local stdio MCP server. A remote MCP endpoint or supported Secure MCP Tunnel is needed for direct MCP access; availability depends on the ChatGPT plan and workspace permissions.

For this repository's current ChatGPT workflow:
1. Use the connected GitHub repository integration to read `docs/AI_CONTEXT_INDEX.md` first, then `AGENTS.md` and this short guide only if needed.
2. Start from the requested feature or changed file; do not ask ChatGPT to ingest the entire repository.
3. For pull-request reviews, read the Code Review Graph sticky comment on the PR. It contains structural risk, impact and test-gap findings that ChatGPT can interpret without a full source dump.
4. Ask ChatGPT to fetch only the files named by the review, then verify the implementation and tests.

This gives ChatGPT and Claude Code a shared repository policy and a shared GitHub review artifact, without pretending that the local MCP server is directly connected to ChatGPT.

## Pull-request review
`.github/workflows/code-review-graph.yml` runs the upstream Code Review Graph GitHub Action on non-draft pull requests. It posts or updates a sticky PR comment with risk, impact and test-gap sections. It uses the repository's `GITHUB_TOKEN`, requests only `contents: read` and `pull-requests: write`, and does not fail a PR based on risk by default.

## Token-saving habits
- Ask one bounded task at a time.
- Use the graph's minimal context before opening source files.
- Prefer a small patch and targeted tests over re-reading the entire app.
- Keep `AGENTS.md` and `CLAUDE.md` short; put long reference material in docs and open it only when needed.
- Avoid pasting full logs: share the failing job, exact error and relevant lines.
- A graph reduces context retrieval, not the model's underlying token limit or subscription usage. It cannot guarantee zero token use or eliminate rate limits.

## Security and limitations
- The local graph is structural metadata; it does not prove code is safe or correct.
- The GitHub Action analyzes PR diffs on GitHub-hosted runners and posts a review comment. It is separate from the local MCP database.
- Review comments are advisory. A human must verify findings and test changes.
- No API key, Anthropic key, OpenAI key or other model credential is needed for the default graph build and PR review.
