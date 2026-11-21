# Project Progress Checkpoint — 2026-11-19

## Repository and review
- Repository: niteshkumar0326-web/global-funn-live-news
- Working branch: digital-business-expansion-v1
- Pull request #16 remains open and unmerged; owner approval is required before merge.
- Latest known commit before this checkpoint update: 3d1f05542a1c9cf415640e608f8cae4a466795dd.
- PR is mergeable according to GitHub at the prior check.

## Latest CI verification before Kanha dashboard addition
On commit ab15a228beac1ac53039410aec27396a2a4095bf:
- Kanha Python tests — success (run 44486116888)
- Trading paper engine tests — success (run 44486116968)
- Build check — success (run 44486117059; job completed successfully)
- Code Review Graph — success (run 44486117161)
- Agent validation — success (run 44486117134)
The new dashboard commit 3d1f05542a1c9cf415640e608f8cae4a466795dd must receive its own fresh build verification; do not assume previous CI applies to it.

## Kanha work completed
- Offline India market scanner and deterministic OHLC paper engine are in trading_lab/.
- Risk gate enforces long-only candidate structure and one delivery + one intraday candidate, maximum two.
- Added direct SMA/RSI, invalid/duplicate OHLC, CLI, risk validation, TradePlan and CSV reader tests.
- Added .github/workflows/kanha-python-tests.yml.
- Added app/kanha/page.tsx: a responsive Kanha v3.2 paper-trading dashboard with illustrative capital/quantity/risk/fee calculations, pipeline status and broker connectivity placeholders.
- Dashboard clearly states that market data is not connected and does not collect broker tokens or place live orders.
- The dashboard is a front-end paper calculator, not a live scanner, broker integration, or execution bot.

## GLOBAL FUNN / digital business
PR #16 contains project agent prompts and operating documentation for research, Hindi scripts, production, YouTube SEO, analytics, fact-checking, repurposing, publishing approval, SaaS and digital commerce.
These are project playbooks, not proof of autonomous agents running, channels launched, or revenue earned. Public publishing, spending and customer outreach require owner approval.

## Deployment and SaaS
- Vercel has repeatedly reported the free daily deployment limit (>100 deployments, api-deployments-free-per-day); avoid retrying deploys until the limit resets.
- A previous GLOBAL FUNN preview deployment was marked Ready. New dashboard changes need a fresh deployment to become visible publicly.
- RetailPulse deployment was also rate-limited. Do not delete or replace any existing project to free capacity without explicit approval.

## Next actions
1. Verify CI for commit 3d1f05542a1c9cf415640e608f8cae4a466795dd.
2. Add a visible link from the GLOBAL FUNN home dashboard to /kanha after reviewing the main page.
3. Extend Kanha with offline sector/regime inputs and CSV import, then audit the paper pipeline.
4. Add international markets as research-only agents/modules.
5. Resume RetailPulse when deployment capacity returns or an approved alternate host is selected.
6. Keep PR #16 open pending owner approval.

## Safety and truthfulness
- No live broker execution, token collection, or live order placement.
- No unverified claims of active data feeds, deployments, channel publishing, agent autonomy or revenue.
- No public publishing, paid purchases, customer outreach, project deletion or PR merge without explicit approval.
