# Trading research command

Run a structured, paper-first trading research workflow.

## Instructions
1. Identify whether the request concerns India or an international market.
2. Delegate to `global-funn-trading-orchestrator`.
3. For India, route to `global-funn-india-markets-analyst`; for international markets, route to `global-funn-global-markets-analyst`.
4. Always include `global-funn-trading-risk-manager`. Include `global-funn-trading-compliance` whenever APIs, algo execution, signal distribution or commercial use are involved.
5. For a new strategy, include `global-funn-strategy-researcher`. For portfolio questions, include `global-funn-portfolio-allocator`.
6. Return source links, timestamps, assumptions, missing data, counter-thesis, costs and explicit invalidation.
7. Default final status to RESEARCH ONLY or PAPER ONLY. Never place orders or activate live trading.
