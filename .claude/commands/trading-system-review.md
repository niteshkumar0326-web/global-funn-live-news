# Trading system review command

Audit the trading research, backtest or broker integration system.

Check:
- Data provenance, timestamps, missingness, corporate actions and licensing.
- Look-ahead, survivorship, selection and overfitting risks.
- Fees, spread, slippage, funding, borrow and currency conversion.
- Out-of-sample and walk-forward robustness.
- Risk limits, correlated exposure, drawdown, kill switch and reconciliation.
- Broker API terms, static IP, authentication/token expiry, rate limits and exchange requirements.
- Secret handling, audit logs, idempotency and human approval.
- Product claims, signal distribution and jurisdiction-specific compliance.

Return PASS / FIX / BLOCK with evidence and prioritised remediation. Never label an untested system production-ready.
