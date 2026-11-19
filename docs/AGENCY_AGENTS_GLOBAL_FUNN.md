# GLOBAL FUNN — Agency Agents integration

## What this adds

This branch adds five project-scoped Claude Code subagents under `.claude/agents/`:

1. `global-funn-news-researcher` — source verification and evidence packs.
2. `global-funn-hindi-scriptwriter` — spoken Hindi news scripts and voice-over drafts.
3. `global-funn-shorts-producer` — 9:16 edit plans, storyboard, subtitles and audio/asset checks.
4. `global-funn-visual-brand-director` — consistent Canva/news graphics and thumbnails.
5. `global-funn-youtube-growth-editor` — accurate YouTube packaging and analytics review.

They are adapted for GLOBAL FUNN rather than bulk-copying unrelated agent profiles. They are prompt/configuration files, not a video renderer, autonomous newsroom, or publishing bot.

## How to use

1. Merge this branch after review and pull the updated GLOBAL FUNN repository onto the computer running Claude Code.
2. Open the repository as the Claude Code project.
3. Ask Claude Code to use the relevant named subagent. Claude Code discovers project-level Markdown agents from `.claude/agents/`; see the [official subagent guide](https://claude.com/resources/articles/subagents-in-claude-code).
4. Keep the human editorial approval step before any public upload.

These files are not installed into ChatGPT itself and do not automatically connect Canva, YouTube, Metricool, a voice service or an editing application. Those tools retain their own sign-in, permissions and export/publishing steps.

## Why only five

GLOBAL FUNN is a small Hindi news and entertainment operation. The selected roles cover the practical production chain: research → script → edit plan/graphics → YouTube packaging. Installing every available role would add noise and does not create additional software capabilities.

## Upstream reference

The workflow was informed by the open-source [Agency Agents](https://github.com/msitarzewski/agency-agents) project (MIT License), especially its Content Creator, Research Synthesist, Short-Video Editing Coach, Visual Storyteller, Brand Guardian and Video Optimization Specialist concepts. The files in this folder are tailored project instructions, not a copy of the entire upstream catalogue.

## Safety and limitations

- Research outputs must include traceable sources and uncertainty labels.
- AI-generated illustrative media must not be passed off as real event footage.
- Never place credentials, API keys, private account data or personal information in agent files.
- Do not run third-party installer scripts without reviewing them. The upstream project itself notes that its shell scripts are executable and should be reviewed.
- Do not auto-publish. A human editor must approve every factual script and final export.
