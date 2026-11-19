# GLOBAL FUNN Agent Activation Quickstart (Windows)

## What this setup does
The Markdown files in `.claude/agents/` define project-scoped Claude Code subagents. They become available when Claude Code opens this repository as its project. They do not install a separate autonomous service and do not sign in to Canva, YouTube, Metricool, payment providers or other accounts.

## 1. Get the review branch
Open PowerShell on the Windows computer where Git and Claude Code are installed.

If the repository is already on the computer:
```powershell
cd "C:\path\to\global-funn-live-news"
git fetch origin
git checkout digital-business-expansion-v1
git pull origin digital-business-expansion-v1
```

If it is not cloned yet:
```powershell
git clone https://github.com/niteshkumar0326-web/global-funn-live-news.git
cd global-funn-live-news
git fetch origin
git checkout digital-business-expansion-v1
```

Replace the example local path with the actual folder location. Do not paste access tokens into commands or repository files.

## 2. Open the project
Launch Claude Code from the repository root:
```powershell
claude
```
If the `claude` command is not recognised, open the Claude Code application/terminal integration using its official installation instructions. Do not download unofficial installers.

## 3. Check agent discovery
Ask Claude Code:
```text
List the project agents available under .claude/agents. For each, report its name and one-sentence responsibility. Do not modify files.
```
Expected roster includes the research, writing, production, visual, growth, orchestration, trend, SEO, analytics, fact-check, repurposing, publishing, SaaS and commerce roles.

## 4. Run a safe first test
Use a non-publishing task:
```text
Use global-funn-studio-orchestrator to create a one-video task plan for GLOBAL FUNN. Delegate topic discovery to global-funn-trend-researcher, evidence checking to global-funn-news-researcher, script drafting to global-funn-hindi-scriptwriter, packaging to global-funn-youtube-seo-strategist, and final audit to global-funn-factcheck-compliance. Return the handoff ledger and draft assets only. Do not upload, publish, send messages, spend money or change account settings.
```

## 5. Production handoff
For each proposed video, keep these states distinct:
- Research queued / in progress / evidence ready
- Script draft / editorial review / approved
- Video edit plan / export ready / final QA
- Metadata ready / owner approved
- Published only after a human performs the upload and a live URL is verified

## 6. Human release checklist
- Verify material facts against cited sources.
- Confirm footage, images, music, fonts and voice assets have usage rights.
- Check title, thumbnail and description match the actual video.
- Review synthetic-media disclosure where viewers could mistake generated visuals for real footage.
- Approve audience visibility, schedule and monetisation settings yourself.
- After upload, record the actual YouTube URL and publication status.

## Troubleshooting
- If no agents appear, confirm Claude Code was launched from the repository root and that `.claude/agents/` exists in the checked-out branch.
- If Git reports a branch or merge conflict, stop and inspect status before overwriting local work.
- Keep API keys and passwords in an approved secret manager or local environment configuration, never in Git.
- Do not run scripts from third-party repositories without reviewing their contents first.

## Related guide
See [Agent Operating System](AGENT_OPERATING_SYSTEM.md) for the complete roster, workflow and acceptance gates.
