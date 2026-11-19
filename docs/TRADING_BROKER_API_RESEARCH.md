# Broker API Research Matrix — 19 November 2026

This is an initial technical comparison, not an endorsement. Re-check official documentation, current account eligibility, broker terms, charges and exchange notices before implementation.

| Broker / venue | Verified capability from official docs | Important constraint / implementation note |
|---|---|---|
| DhanHQ (India) | Individual Trading APIs; partner onboarding path; order, positions, funds and market-data APIs | Dhan docs state static-IP whitelisting is mandatory for order APIs; Data APIs have separate pricing/eligibility. Keep individual and partner onboarding distinct. |
| Upstox (India) | REST APIs, market data, portfolio, orders, sandbox and MCP read-only integration | Official docs describe sandbox order testing and static-IP management. Order requests can require registered static IP; algo app/name requirements apply when relevant. |
| International markets | Adapter architecture can support a broker only after account-country eligibility, instrument coverage, official API and data rights are verified | Do not assume a US broker or product is available to an India-resident customer. Verify jurisdiction, FX, tax, custody and market-data licensing individually. |

## Official documentation reviewed
- DhanHQ authentication and eligibility: https://dhanhq.co/docs/v2/authentication/
- DhanHQ API overview: https://dhanhq.co/docs/v2/
- DhanHQ static IP / API reference: https://api.dhan.co/v2/
- Upstox API overview and sandbox: https://upstox.com/developer/api-documentation/
- Upstox static-IP API announcement (10 April 2026): https://upstox.com/developer/api-documentation/announcements/static-ip-apis/
- Upstox algo trading / static IP requirements: https://upstox.com/developer/api-documentation/announcements/algo-trading-circular/
- SEBI retail algo framework: https://www.sebi.gov.in/legal/circulars/sep-2025/extension-of-timeline-for-implementation-of-sebi-circular-dated-february-04-2025-on-safer-participation-of-retail-investors-in-algorithmic-trading-_96979.html

## Recommended implementation order
1. Build broker-neutral interfaces and historical-data ingestion.
2. Add DhanHQ and Upstox read-only account/market-data adapters only after credentials are configured securely by the owner.
3. Build replay/backtest and paper execution with no live-order permission.
4. Test static-IP handling, token expiry, rate limits, duplicate prevention, order state reconciliation and kill switch.
5. Obtain written broker/exchange confirmation for the intended algo and business model.
6. Enable any live capability only after explicit owner approval and a separate compliance/risk sign-off.

## No credential collection in chat
Never paste access tokens, API secrets, passwords, OTPs or client identifiers into repository issues, source files or chat. Use local environment variables or a secret manager and least-privilege permissions.
