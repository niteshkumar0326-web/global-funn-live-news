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
- Start with `docs/AI_CONTEXT_INDEX.md`; open `docs/TOKEN_TOOLKIT_RESEARCH.md` only for tool selection or evaluation.
- If Code Review Graph MCP is available, request minimal task context and impact results; verify against source and tests.
- Use Headroom MCP to compress large outputs on demand. Optional proxy mode compresses supported Claude API traffic; see the workflow guide.
- Avoid whole-repository reads and repeated full build-history dumps. Preserve exact compiler errors, security warnings, evidence and editorial facts.
- Do not stack overlapping compression proxies without matched-task quality and token measurements.
- The mobile `/ai-context` route creates a manual copy/paste handover; it does not connect to desktop MCP or sync notes across devices.
