"""Offline India-equity OHLCV scanner. CSV input only; no live feed or broker access."""
from __future__ import annotations
import argparse, csv, json
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

REQUIRED={"symbol","timestamp","open","high","low","close","volume"}

@dataclass(frozen=True)
class Bar:
    symbol:str
    timestamp:datetime
    open:float
    high:float
    low:float
    close:float
    volume:float


def load_bars(path:str)->list[Bar]:
    rows=[]
    with open(path,newline="",encoding="utf-8-sig") as f:
        reader=csv.DictReader(f)
        if not REQUIRED.issubset(set(reader.fieldnames or [])):
            raise ValueError("CSV must contain: "+",".join(sorted(REQUIRED)))
        for n,row in enumerate(reader,start=2):
            try:
                symbol=row["symbol"].strip().upper()
                if not symbol: raise ValueError("empty symbol")
                stamp=datetime.fromisoformat(row["timestamp"].strip())
                o,h,l,c,v=(float(row[k]) for k in ("open","high","low","close","volume"))
                if min(o,h,l,c)<=0 or v<0: raise ValueError("prices must be positive and volume non-negative")
                if h<max(o,c,l) or l>min(o,c,h): raise ValueError("invalid OHLC relationship")
                rows.append(Bar(symbol,stamp,o,h,l,c,v))
            except Exception as e:
                raise ValueError(f"Invalid CSV row {n}: {e}") from e
    if not rows: raise ValueError("CSV contains no data rows")
    return rows


def sma(values:list[float],period:int)->float|None:
    return sum(values[-period:])/period if len(values)>=period else None


def rsi14(closes:list[float])->float|None:
    if len(closes)<15: return None
    changes=[closes[i]-closes[i-1] for i in range(len(closes)-14,len(closes))]
    gains=sum(max(x,0) for x in changes)/14
    losses=sum(max(-x,0) for x in changes)/14
    if losses==0: return 100.0 if gains>0 else 50.0
    rs=gains/losses
    return 100-(100/(1+rs))


def analyse_symbol(bars:list[Bar])->dict:
    bars=sorted(bars,key=lambda b:b.timestamp)
    stamps=[b.timestamp for b in bars]
    if len(stamps)!=len(set(stamps)):
        raise ValueError(f"Duplicate timestamps for {bars[0].symbol}")
    closes=[b.close for b in bars]
    volumes=[b.volume for b in bars]
    last=bars[-1]
    s20,s50=sma(closes,20),sma(closes,50)
    avgvol=sma(volumes,20)
    prior_high=max((b.high for b in bars[-21:-1]),default=None) if len(bars)>=21 else None
    rsi=rsi14(closes)
    score=0
    reasons=[]
    if s20 is not None and last.close>s20: score+=2; reasons.append("close_above_SMA20")
    if s50 is not None and s20 is not None and s20>s50: score+=2; reasons.append("SMA20_above_SMA50")
    if avgvol and avgvol>0 and last.volume>=1.5*avgvol: score+=2; reasons.append("volume_surge_1.5x")
    if prior_high is not None and last.close>prior_high: score+=2; reasons.append("close_above_prior_20_bar_high")
    if rsi is not None and 50<=rsi<=70: score+=1; reasons.append("RSI14_momentum_zone")
    if rsi is not None and rsi>75: reasons.append("overbought_warning")
    verdict="WATCH" if score>=4 else "NEUTRAL"
    if "overbought_warning" in reasons and score<6: verdict="WAIT_FOR_CONFIRMATION"
    return {
      "symbol":last.symbol,"as_of":last.timestamp.isoformat(),"close":round(last.close,4),
      "volume":last.volume,"sma20":round(s20,4) if s20 is not None else None,
      "sma50":round(s50,4) if s50 is not None else None,
      "avg_volume20":round(avgvol,2) if avgvol is not None else None,
      "rsi14":round(rsi,2) if rsi is not None else None,
      "score_out_of_9":score,"verdict":verdict,"reasons":reasons,
      "bars_available":len(bars)
    }


def scan(path:str)->dict:
    grouped=defaultdict(list)
    for bar in load_bars(path): grouped[bar.symbol].append(bar)
    results=[analyse_symbol(v) for v in grouped.values()]
    results.sort(key=lambda x:(x["score_out_of_9"],x["symbol"]),reverse=True)
    return {"mode":"OFFLINE_HISTORICAL_CSV","live_data":False,"symbols_scanned":len(results),
            "results":results,"disclaimer":"Research watchlist only, not a buy/sell signal. No orders are placed."}


def main():
    parser=argparse.ArgumentParser(description="Offline India equity OHLCV scanner")
    parser.add_argument("--csv",required=True,help="CSV: symbol,timestamp,open,high,low,close,volume")
    parser.add_argument("--out",help="Optional JSON output path")
    args=parser.parse_args()
    result=scan(args.csv)
    rendered=json.dumps(result,indent=2)
    if args.out: Path(args.out).write_text(rendered+"\n",encoding="utf-8")
    print(rendered)

if __name__=="__main__": main()
