"""Deterministic, long-only paper-trading simulator. No broker or network access."""
from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from decimal import Decimal, ROUND_FLOOR
from pathlib import Path
from typing import Iterable

D = Decimal


@dataclass(frozen=True)
class TradePlan:
    capital: Decimal
    entry: Decimal
    stop: Decimal
    target: Decimal
    risk_fraction: Decimal = D("0.01")
    fee_per_order: Decimal = D("0")
    slippage_bps: Decimal = D("0")


@dataclass(frozen=True)
class Candle:
    timestamp: str
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal


def size_position(plan: TradePlan) -> dict:
    """Size by the smaller of risk budget and cash affordability; long-only."""
    if min(plan.capital, plan.entry, plan.stop, plan.target) <= 0:
        raise ValueError("Capital, entry, stop and target must be positive.")
    if not (D("0") < plan.stop < plan.entry < plan.target):
        raise ValueError("Require stop < entry < target for a long-only plan.")
    if not (D("0") < plan.risk_fraction <= D("1")):
        raise ValueError("risk_fraction must be in (0, 1].")
    if plan.fee_per_order < 0 or plan.slippage_bps < 0:
        raise ValueError("Fees and slippage cannot be negative.")
    risk_budget = plan.capital * plan.risk_fraction
    risk_per_share = plan.entry - plan.stop
    qty_by_risk = int((risk_budget / risk_per_share).to_integral_value(rounding=ROUND_FLOOR))
    qty_by_cash = int((plan.capital / plan.entry).to_integral_value(rounding=ROUND_FLOOR))
    qty = max(0, min(qty_by_risk, qty_by_cash))
    return {
        "quantity": qty,
        "risk_budget": str(risk_budget),
        "planned_price_risk": str(risk_per_share * qty),
        "cash_used_before_costs": str(plan.entry * qty),
        "risk_limited_quantity": qty_by_risk,
        "cash_limited_quantity": qty_by_cash,
    }


def simulate(plan: TradePlan, candles: Iterable[Candle]) -> dict:
    sizing = size_position(plan)
    qty = sizing["quantity"]
    if qty == 0:
        return {"status": "REJECTED", "reason": "Capital cannot fund one share within the configured risk budget.", "sizing": sizing}
    candles = list(candles)
    if not candles:
        raise ValueError("At least one OHLC candle is required.")

    slip = plan.slippage_bps / D("10000")
    entry_fill = plan.entry * (D("1") + slip)
    if entry_fill * qty + plan.fee_per_order > plan.capital:
        return {"status": "REJECTED", "reason": "Entry cost including fee exceeds capital.", "sizing": sizing}

    exit_fill = candles[-1].close * (D("1") - slip)
    exit_reason = "END_OF_DATA"
    exit_time = candles[-1].timestamp
    for candle in candles:
        if candle.low > candle.high or candle.low > min(candle.open, candle.close) or candle.high < max(candle.open, candle.close):
            raise ValueError(f"Invalid OHLC candle: {candle.timestamp}")
        # Conservative ordering: if both stop and target touch in one candle, assume stop first.
        if candle.open <= plan.stop or candle.low <= plan.stop:
            exit_fill = (candle.open if candle.open < plan.stop else plan.stop) * (D("1") - slip)
            exit_reason, exit_time = "STOP", candle.timestamp
            break
        if candle.open >= plan.target or candle.high >= plan.target:
            exit_fill = plan.target * (D("1") - slip)
            exit_reason, exit_time = "TARGET", candle.timestamp
            break

    gross = (exit_fill - entry_fill) * qty
    fees = plan.fee_per_order * 2
    net = gross - fees
    return {
        "status": "SIMULATED",
        "exit_reason": exit_reason,
        "exit_timestamp": exit_time,
        "entry_fill": str(entry_fill),
        "exit_fill": str(exit_fill),
        "quantity": qty,
        "gross_pnl": str(gross),
        "estimated_fees": str(fees),
        "net_pnl": str(net),
        "net_return_on_capital_pct": str((net / plan.capital) * D("100")),
        "sizing": sizing,
        "assumptions": [
            "Long-only; entry assumed at configured entry price.",
            "If stop and target both touch in one candle, stop is assumed first.",
            "Stop gaps fill at candle open; target gaps fill at target, with no price improvement.",
            "Fees are a user-supplied flat estimate per order; taxes, spread, market impact and actual broker charges may be missing.",
            "Slippage is a simple adverse basis-point assumption, not a fill guarantee.",
            "This is a simulation, not investment advice or a broker order."
        ]
    }


def read_candles(path: str) -> list[Candle]:
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        required = {"timestamp", "open", "high", "low", "close"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError("CSV needs timestamp,open,high,low,close columns.")
        return [Candle(row["timestamp"], *(D(row[k]) for k in ("open", "high", "low", "close"))) for row in reader]


def main() -> None:
    parser = argparse.ArgumentParser(description="Offline paper-trading simulator; no live orders.")
    parser.add_argument("--plan", required=True, help="JSON file with capital, entry, stop, target and optional risk_fraction, fee_per_order, slippage_bps.")
    parser.add_argument("--candles", required=True, help="CSV file with timestamp,open,high,low,close.")
    args = parser.parse_args()
    raw = json.loads(Path(args.plan).read_text(encoding="utf-8"))
    plan = TradePlan(**{k: D(str(v)) for k, v in raw.items()})
    print(json.dumps(simulate(plan, read_candles(args.candles)), indent=2))


if __name__ == "__main__":
    main()
