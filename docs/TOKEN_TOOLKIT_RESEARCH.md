# Token-reduction repository research — GLOBAL FUNN

Research snapshot: 10 November 2026. This is a curated implementation decision, not an exhaustive guarantee that every public repository was inspected.

## Main bottlenecks and selected stack

| Repository | What it targets | Decision for GLOBAL FUNN |
|---|---|---|
| https://github.com/tirth8205/code-review-graph | Dependency graph, targeted code context, change impact and PR review | Already integrated in Build 31 |
| https://github.com/headroomlabs-ai/headroom | Local compression gateway, MCP tools, retrieval and optional proxy for coding agents | Selected for Build 32; MCP config + Windows setup |
| https://github.com/rtk-ai/rtk | Compresses terminal output before coding agents read it; hooks for Claude Code and other coding agents | Alternative; not stacked with Headroom |
| https://github.com/dongnh311/claude-context-saver | Compresses logs and reads source by symbol through MCP | Not enabled: current README says WSL-only for Windows in released versions |
| https://github.com/mksglu/context-mode | MCP tool-output sandboxing and session continuity / retrieval | Strong alternative; evaluate only if session-history overhead remains high |
| https://github.com/AzozzALFiras/claude-context-optimizer | Smart reads, log compression, cache and checkpoints | Alternative; overlapping with selected Context Saver |
| https://github.com/ojuschugh1/sqz | Rust context compression and deduplication for coding-agent tool output | Alternative; benchmark before adding another output filter |
| https://github.com/Agenta-AI/LLMLingua | Prompt compression research/tooling | Not installed in the interactive app; quality-sensitive and adds runtime/model dependencies |
| https://github.com/Thanatos9404/llmslim | Local-first context planning, compression and memory | Interesting future option; avoid adding another memory layer before measuring need |
| https://github.com/aglio-lab/context-engineering-tools | Directory of context engineering, caching, memory and compression tools | Research index, not a runtime integration |

## Why this stack, not every repository?

Installing several overlapping MCP servers and shell proxies can add startup overhead, tool schemas, latency, compatibility issues and sometimes more context than it saves. The selected stack attacks distinct sources:

1. **Code Review Graph:** which source files matter and what a change affects.
2. **RTK:** noisy shell output such as git status, test/build logs and file listings.
3. **Context Saver:** verbose logs and broad source reads through MCP.
4. **AI Context Pocket:** reusable compact handover for ChatGPT/Claude on mobile or desktop, without requiring a local MCP connection.

RTK, Context Mode and SQZ remain alternatives for an A/B test, not extra layers enabled simultaneously.

## Mobile reality

A phone cannot use a developer PC's local stdio MCP server, local graph database or terminal hook simply because the same repository is on GitHub. AI Context Pocket provides a copy/download handover that can be pasted into ChatGPT mobile or Claude mobile. The app route becomes usable from the phone once the Next.js app is deployed to a user-approved HTTPS host. No deployment or public publishing is performed by this build.

## What savings can be expected?

Upstream repositories publish benchmark figures, but workloads and baselines differ. Examples include RTK's command-output byte reductions and Headroom's tool-output compression claims. These do not translate directly into equal reductions in total model tokens, subscription usage, or GLOBAL FUNN's real sessions. No percentage guarantee is made.

## How to measure safely

For 5–10 representative tasks, record:
- task type and exact starting commit;
- model and agent;
- input tokens, cache-read/cache-write tokens and output tokens when provider UI exposes them;
- tool-output bytes and files read;
- completion quality, missed details and build/test result.

Compare baseline against the selected stack on the same tasks. Do not compress source evidence, exact compiler errors, security warnings, or editorial facts. Keep a tool only if it reduces context without lowering correctness.

## Primary references

- RTK supported agents and Windows hooks: https://github.com/rtk-ai/rtk
- Context Saver MCP setup: https://github.com/dongnh311/claude-context-saver
- Headroom: https://github.com/headroomlabs-ai/headroom
- Context Mode: https://github.com/mksglu/context-mode
- Code Review Graph: https://github.com/tirth8205/code-review-graph
- Context engineering tools directory: https://github.com/aglio-lab/context-engineering-tools
