"""Kanha-style pre-trade risk gate; offline calculations only, never places orders."""
from __future__ import annotations
from decimal import Decimal, ROUND_FLOOR

D=Decimal
ALLOWED_MODES={"DELIVERY","INTRADAY"}

def _positive(value, name):
    result=D(str(value))
    if result<=0: raise ValueError(f"{name} must be positive")
    return result

def evaluate_candidate(candidate:dict)->dict:
    """Return a transparent, capital- and cost-aware sizing check."""
    mode=str(candidate.get("mode","")).upper()
    if mode not in ALLOWED_MODES: raise ValueError("mode must be DELIVERY or INTRADAY")
    capital=_positive(candidate.get("capital"),"capital")
    entry=_positive(candidate.get("entry"),"entry")
    stop=_positive(candidate.get("stop"),"stop")
    target=_positive(candidate.get("target"),"target")
    fee=D(str(candidate.get("fee_per_order",0)))
    risk_fraction=D(str(candidate.get("risk_fraction","0.01")))
    if not D("0")<stop<entry<target: raise ValueError("Require stop < entry < target")
    if fee<0: raise ValueError("fee_per_order cannot be negative")
    if not D("0")<risk_fraction<=D("1"): raise ValueError("risk_fraction must be in (0, 1]")
    risk_budget=capital*risk_fraction
    risk_qty=int((risk_budget/(entry-stop)).to_integral_value(rounding=ROUND_FLOOR))
    cash_qty=int(((capital-fee)/entry).to_integral_value(rounding=ROUND_FLOOR)) if capital>fee else 0
    qty=max(0,min(risk_qty,cash_qty))
    estimated_round_trip_cost=fee*2
    planned_risk=(entry-stop)*qty
    gross_target_profit=(target-entry)*qty
    net_target_profit=gross_target_profit-estimated_round_trip_cost
    net_stop_loss=planned_risk+estimated_round_trip_cost
    affordable=qty>0
    return {
      "mode":mode,"quantity":qty,"capital":str(capital),
      "cash_required_including_entry_fee":str(entry*qty+fee),
      "risk_budget":str(risk_budget),"planned_price_risk":str(planned_risk),
      "estimated_round_trip_fees":str(estimated_round_trip_cost),
      "estimated_net_profit_at_target":str(net_target_profit),
      "estimated_net_loss_at_stop":str(net_stop_loss),
      "reward_to_risk_after_estimated_fees":str((net_target_profit/net_stop_loss).quantize(D("0.01"))) if net_stop_loss>0 else None,
      "status":"PASS_FOR_REVIEW" if affordable and net_target_profit>0 else "REJECT",
      "limitations":["Flat fee estimate only; taxes, brokerage slabs, exchange charges, GST, STT, stamp duty, spread and slippage may be missing.",
                     "Sizing calculation only; no market data validation, order placement or profit guarantee."]
    }

def validate_daily_plan(candidates:list[dict],max_trades:int=2)->dict:
    """Enforce one delivery plus one intraday slot, with no duplicate mode."""
    if max_trades<1: raise ValueError("max_trades must be at least 1")
    modes=[str(c.get("mode","")).upper() for c in candidates]
    errors=[]
    if len(candidates)>max_trades: errors.append(f"Trade count {len(candidates)} exceeds limit {max_trades}")
    if len(modes)!=len(set(modes)): errors.append("Only one candidate per mode is allowed")
    if any(m not in ALLOWED_MODES for m in modes): errors.append("Every candidate must be DELIVERY or INTRADAY")
    return {"status":"PASS" if not errors else "REJECT","trade_count":len(candidates),
            "modes":modes,"errors":errors,
            "rule":"Maximum two candidates: at most one DELIVERY and one INTRADAY."}
