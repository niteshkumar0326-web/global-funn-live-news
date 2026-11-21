# GLOBAL FUNN Trading Intelligence Division

## Status
This is a proposed and version-controlled agent division on the `digital-business-expansion-v1` branch. Agent Markdown files are role prompts; they are not autonomous processes, broker connections or deployed trading bots. Runtime installation, data subscriptions, account linking and local machine setup require separate verified steps.

## Specialist roster

| Agent | Responsibility |
|---|---|
| India Markets Analyst | NSE/BSE, equities, ETFs, indices and derivatives research |
| Global Markets Analyst | International markets, macro, FX and jurisdiction-aware analysis |
| Trading Risk Manager | Position sizing, loss limits, exposure and kill switch |
| Strategy Researcher | Hypotheses, backtests, robustness and paper-test design |
| Compliance Analyst | SEBI, exchange, broker and cross-border release gates |
| Broker Integration Engineer | Secure read-only/paper-first adapters and reconciliation |
| Portfolio Allocator | Diversification, currency exposure and stress tests |
| Trading SaaS Builder | Product validation, pricing and recurring revenue opportunities |

## Recommended system topology

```text
Market data / news / broker read-only feeds
                  |
          Normalisation layer
                  |
       India desk / Global desk
                  |
       Strategy research engine
                  |
       Independent risk veto
                  |
     Paper execution + reconciliation
                  |
       Human review / audit trail
                  |
       Live execution (disabled by default)
                  |
      Journal, analytics and review
```

## Operating policy
- Start with read-only market data and historical research.
- Never use scraped, delayed or unlicensed data as if it were live or licensed.
- Keep India and international instruments, currencies, sessions, holidays and regulatory rules distinct.
- Separate signal generation from order execution.
- Require an independent risk pass, explicit human approval and broker/exchange permission before any live execution.
- Never store API secrets in GitHub. Use a secrets manager and least-privilege credentials.
- Every signal and order proposal must carry a timestamp, data source, strategy version and audit identifier.
- Provide a kill switch and reconciliation check. If account state or feed freshness is uncertain, stop.

## India-specific regulatory checkpoint
SEBI's retail algorithmic trading framework and exchange implementation standards govern broker/API-based retail algo workflows. The framework's milestones and effective dates have changed; check the latest SEBI, NSE/BSE/other relevant exchange and broker notices at implementation time. The 2025 extension stated that the framework would apply to all brokers from 1 April 2026. Broker APIs may require static-IP mapping and exchange-approved/registered strategy pathways depending on the setup. Do not infer eligibility from having an API key alone.

Primary references:
- SEBI circular: https://www.sebi.gov.in/legal/circulars/sep-2025/extension-of-timeline-for-implementation-of-sebi-circular-dated-february-04-2025-on-safer-participation-of-retail-investors-in-algorithmic-trading-_96979.html
- SEBI circular PDF: https://www.sebi.gov.in/sebi_data/attachdocs/sep-2025/1759232056254.pdf
- NSE implementation standards: https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf
- NSE decision-support / algo process (updated 27 May 2026): https://betanseapi.nseindia.com/static/trade/platform-services-non-neat-decision-support-tools-algorithm-trading

## Global market checklist
For each target country and broker, verify the regulator, product eligibility for the account holder, official API documentation, market-data licence, trading hours, settlement, FX conversion, tax treatment, short-sale/derivatives permissions and marketing rules. Do not assume one international broker supports all countries or products.

## Research-to-paper-to-live gates
1. **Research:** source-backed thesis and explicit falsification conditions.
2. **Backtest:** point-in-time data, realistic costs, out-of-sample and walk-forward checks.
3. **Paper:** broker sandbox or simulated orders; test partial fills, disconnects, duplicates and reconciliation.
4. **Compliance:** broker and exchange confirmation, account eligibility and legal review where relevant.
5. **Live:** disabled until explicit owner approval; strict size limits, kill switch and monitoring.
6. **Review:** compare simulated/live fills with model assumptions; suspend on unexplained drift.

## Revenue map
Prioritise products that solve measurable trader workflow problems:
- Free lead magnet: risk calculator, charges estimator, trade journal template.
- Subscription SaaS: journal analytics, watchlists, alerts, portfolio dashboard and backtest workspace.
- Paid digital products: beginner course, strategy research workbook, spreadsheet templates and Python learning kits.
- B2B: white-label dashboards, data integration and workflow automation where licensing permits.
- Services: setup, training and analytics implementation; avoid crossing into regulated advice without the required permissions.

## Release checklist
- [ ] Target user and problem validated.
- [ ] Data rights and source freshness documented.
- [ ] Broker API and account permissions verified.
- [ ] SEBI/exchange/local regulator review completed as applicable.
- [ ] Backtest assumptions and out-of-sample results disclosed.
- [ ] Paper trading and failure-mode tests passed.
- [ ] Secrets and personal data protected.
- [ ] Risk limits, kill switch and audit trail tested.
- [ ] Human approval recorded for any live mode.
- [ ] Product marketing contains no guaranteed-return claims.
