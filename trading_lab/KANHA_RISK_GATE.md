# Kanha Risk Gate (offline)

This module turns a candidate plan into a capital-aware sizing estimate and validates the daily candidate limit. Defaults are a 1% price-risk budget and a maximum of two daily candidates: at most one delivery and one intraday. Values are configurable at call time.

Run from this directory:

```bash
python -m unittest -v
python -c "from kanha_risk_gate import evaluate_candidate; print(evaluate_candidate({'mode':'INTRADAY','capital':1200,'entry':100,'stop':98,'target':105,'fee_per_order':5}))"
```

The fee is a flat per-order estimate. Actual Indian equity charges vary by broker, product, turnover and statutory levies. Before using the result, calculate all applicable brokerage, STT, exchange transaction charges, GST, SEBI charges, stamp duty, spread and slippage. A PASS_FOR_REVIEW is only a sizing check, not a buy signal or trade authorisation. The module does not fetch prices, validate liquidity, access a broker or place orders.
