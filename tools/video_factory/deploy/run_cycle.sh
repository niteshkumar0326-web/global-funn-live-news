#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${GF_PY:-python3}"
# Skip heavy rendering while the Indian market is open (shared VPS with the trading bot).
if [ "${GF_ALLOW_MARKET_HOURS:-0}" != "1" ]; then
  DOW=$(TZ=Asia/Kolkata date +%u); HM=$(TZ=Asia/Kolkata date +%H%M)
  if [ "$DOW" -le 5 ] && [ "$HM" -ge 0915 ] && [ "$HM" -le 1530 ]; then
    echo "market hours: skipping render cycle"; exit 0
  fi
fi
mkdir -p queue
"$PY" -m factory batch queue --feed-live || true      # failed specs are parked in queue/failed
"$PY" -m factory upload --schedule || true            # stops by itself at the daily quota
"$PY" -m factory ledger
