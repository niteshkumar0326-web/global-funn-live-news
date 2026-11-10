# Repository Working Rules

## Superpowers development workflow
This repository vendors selected skills from the MIT-licensed [obra/superpowers](https://github.com/obra/superpowers) project under `.agents/skills/`.

Before non-trivial feature work, consult the relevant local skill:
- `using-superpowers`: discover applicable workflows
- `brainstorming`: clarify scope and design before substantial new behavior
- `writing-plans`: produce a concrete implementation plan
- `test-driven-development`: use a red/green/refactor test cycle where practical
- `systematic-debugging`: investigate failures before changing code
- `requesting-code-review` and `receiving-code-review`: review major changes and verify feedback
- `finishing-a-development-branch`: verify before proposing integration

## GLOBAL FUNN editorial safeguards
- Do not invent facts, sources, quotes, eyewitness accounts, images, or URLs.
- Keep evidence links visible; label claims Confirmed, Developing, Disputed, or Not Verified.
- A URL alone never verifies a claim. Require human editorial approval before publication.
- Label AI-generated illustrations; respect privacy, dignity, copyright, and media permissions.
- Never publish publicly or deploy without explicit user approval.

## Engineering safeguards
- Preserve the existing Next.js App Router architecture and existing newsroom modules.
- Prefer small, reversible changes; do not replace the application with the upstream skills repository.
- Do not commit secrets, API keys, personal data, or uploaded media without explicit permission.
- Verify builds/tests and report their actual status; never claim checks passed without evidence.
- Browser-local storage must be described accurately and must not be represented as cloud sync.


## Token-efficient AI coding workflow
- Shared ChatGPT / Claude instructions: `docs/AI_CONTEXT_WORKFLOW.md`.
- If Code Review Graph MCP is connected, call `get_minimal_context_tool` first, then use targeted graph queries with minimal detail; inspect the actual source and tests before changing code.
- For PR reviews, use the graph's risk / impact / test-gap report rather than scanning the full repository.
- If MCP is unavailable, use the GitHub repository integration to read this file and only the relevant source files. Never claim the graph is connected or current without checking.
- Do not load the full project history for routine tasks; consult only the relevant Build entry in `docs/PROJECT_STATUS.md`.
- Graph context is advisory, not proof of correctness. Keep human editorial approval and normal build verification.


## Token-saving integrations
- Start with `docs/AI_CONTEXT_INDEX.md`; open `docs/TOKEN_TOOLKIT_RESEARCH.md` only for tool selection or evaluation.
- On supported local coding-agent shells, RTK rewrites noisy command output; preserve exact error/security lines when reviewing.
- Use Code Review Graph for dependency-aware file selection and Context Saver for compact logs/symbol reads when their MCP servers are available.
- Do not stack additional overlapping compression proxies without a matched-task quality and token comparison.
- The mobile `/ai-context` route creates a manual copy/paste handover. It does not connect to desktop MCP or sync data across devices.
