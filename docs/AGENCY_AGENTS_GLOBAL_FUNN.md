# GLOBAL FUNN — Agency Agents integration

## What this adds

This branch adds a coordinated set of project-scoped Claude Code subagents under `.claude/agents/`:

1. `global-funn-news-researcher` — source verification and evidence packs.
2. `global-funn-hindi-scriptwriter` — spoken Hindi news scripts and voice-over drafts.
3. `global-funn-shorts-producer` — 9:16 edit plans, storyboard, subtitles and audio/asset checks.
4. `global-funn-visual-brand-director` — consistent Canva/news graphics and thumbnails.
5. `global-funn-youtube-growth-editor` — accurate YouTube packaging and analytics review.
6. `global-funn-studio-orchestrator` — task routing, agent handoffs and approval gates.
7. `global-funn-trend-researcher` — timely topic discovery and evidence-based scoring.
8. `global-funn-youtube-seo-strategist` — search-intent-led metadata and topic clusters.
9. `global-funn-analytics-insights` — performance diagnosis and controlled experiments.
10. `global-funn-factcheck-compliance` — independent claim, rights and policy review.
11. `global-funn-content-repurposing` — adaptation of approved assets across formats.
12. `global-funn-publishing-editor` — books, ebooks, workbooks and newsletters.
13. `global-funn-saas-product-architect` — customer discovery, MVP scoping and unit economics.
14. `global-funn-digital-commerce-growth` — offers, acquisition and conversion experiments.

They are adapted for GLOBAL FUNN rather than bulk-copying unrelated agent profiles. They are prompt/configuration files, not a video renderer, autonomous newsroom, or publishing bot.

## How to use

1. Merge this branch after review and pull the updated GLOBAL FUNN repository onto the computer running Claude Code.
2. Open the repository as the Claude Code project.
3. Ask Claude Code to use the relevant named subagent. Claude Code discovers project-level Markdown agents from `.claude/agents/`; see the [official subagent guide](https://claude.com/resources/articles/subagents-in-claude-code).
4. Keep the human editorial approval step before any public upload.

These files are not installed into ChatGPT itself and do not automatically connect Canva, YouTube, Metricool, a voice service or an editing application. Those tools retain their own sign-in, permissions and export/publishing steps.

## Operating manual

See [`docs/AGENT_OPERATING_SYSTEM.md`](AGENT_OPERATING_SYSTEM.md) for the roster, handoff sequence, release checklist and evidence rules.

## Why a curated roster

GLOBAL FUNN is starting with three pilot channels and a related digital-product roadmap. The selected roles cover research, production, QA, publishing, product discovery, commerce and measurement. This curated roster avoids bulk-installing unrelated agents.

## Upstream reference

The workflow was informed by the open-source [Agency Agents](https://github.com/msitarzewski/agency-agents) project (MIT License), especially its Content Creator, Research Synthesist, Short-Video Editing Coach, Visual Storyteller, Brand Guardian and Video Optimization Specialist concepts. The files in this folder are tailored project instructions, not a copy of the entire upstream catalogue.

## Safety and limitations

- Research outputs must include traceable sources and uncertainty labels.
- AI-generated illustrative media must not be passed off as real event footage.
- Never place credentials, API keys, private account data or personal information in agent files.
- Do not run third-party installer scripts without reviewing them. The upstream project itself notes that its shell scripts are executable and should be reviewed.
- Do not auto-publish. A human editor must approve every factual script and final export.
