# Offline Paper Trading Lab

A small Python-standard-library prototype for position sizing and deterministic OHLC paper simulation. It has **no broker integration, no network calls and no live-order capability**.

## Run locally (Python 3.10+)

From this directory:

```bash
python -m unittest -v
python paper_engine.py --plan examples/plan.json --candles examples/sample_ohlc.csv
```

## Inputs

- Plan JSON: capital, entry, stop, target; optional risk_fraction (default 1%), fee_per_order (default 0), slippage_bps (default 0).
- Candle CSV: timestamp,open,high,low,close. Use one consistent instrument, interval and currency. Supply candles in chronological order beginning with the candle in which the planned entry is assumed.

## Model limitations

- Long-only; no short selling, leverage, options, partial fills or order-book simulation.
- Entry is assumed at configured entry; this is not a signal generator.
- If stop and target are both touched within one OHLC candle, stop is assumed first.
- Stop gaps fill at open; target gaps fill at target.
- Flat per-order fees and simple adverse slippage are approximations. Add brokerage, exchange fees, taxes, spread, market impact, stamp duty and currency conversion before relying on a result.
- Historical OHLC data must be licensed, correctly adjusted for corporate actions and timestamped. This prototype does not fetch data.
- Backtest output is not evidence of future performance. Run out-of-sample and paper-forward tests before considering any production use.

## Safety

Do not add broker tokens here. Do not connect a live broker to this prototype. A future broker adapter must be a separate module with read-only/paper defaults, reconciliation, idempotency, audit logs, kill switch, broker approval and jurisdiction-specific compliance review.
