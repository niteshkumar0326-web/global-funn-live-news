# India Market Scanner — Offline CSV Edition

## Purpose
Rank NSE/BSE watchlist symbols using historical OHLCV candles supplied by the operator. It does not connect to an exchange, broker or live market feed and does not generate executable orders.

## Input format
CSV columns: `symbol,timestamp,open,high,low,close,volume`. Timestamp must be ISO-8601 (include exchange timezone offset where known). Use one candle interval consistently per file and sort is not required; the scanner sorts by timestamp. Duplicate symbol/timestamp rows and invalid OHLC relationships are rejected.

## Indicators
- SMA 20 and SMA 50
- RSI 14 (simple average gain/loss approximation)
- 20-bar average volume and 1.5x volume surge
- Close above prior 20-bar high (excluding current bar)
- Transparent heuristic score out of 9

The score is a research sorting heuristic, not a statistically calibrated probability or a trade recommendation. Missing history produces null indicators, not invented values.

## Run
```bash
cd trading_lab
python -m unittest -v
python india_market_scanner.py --csv examples/india_watchlist_sample.csv --out scan.json
```

## Data-source and India-market caveats
Use data obtained lawfully from an exchange, licensed vendor or broker account. Record source, retrieval timestamp, instrument identifier, interval, timezone, corporate-action adjustment and whether data is delayed. Do not treat a free webpage download as permission for commercial redistribution. NSE/BSE symbols and instrument masters change; use current official instrument masters rather than hard-coded symbol assumptions.

## Next integration gate
Before any live feed adapter: select broker/vendor, verify API access and market-data rights, implement rate limits and stale-feed checks, normalise exchange timestamps and corporate actions, then paper-forward test. Live orders remain outside this scanner.
