"use client";

import { useMemo, useState } from "react";

type Mode = "DELIVERY" | "INTRADAY";

export default function KanhaDashboard() {
  const [mode, setMode] = useState<Mode>("INTRADAY");
  const [capital, setCapital] = useState("1200");
  const [entry, setEntry] = useState("100");
  const [stop, setStop] = useState("98");
  const [target, setTarget] = useState("105");
  const [fee, setFee] = useState("5");

  const result = useMemo(() => {
    const c = Number(capital), e = Number(entry), s = Number(stop), t = Number(target), f = Number(fee);
    if (![c,e,s,t,f].every(Number.isFinite) || c <= 0 || e <= 0 || s <= 0 || t <= 0 || f < 0 || !(s < e && e < t)) return null;
    const riskBudget = c * 0.01;
    const riskQty = Math.floor(riskBudget / (e - s));
    const cashQty = Math.floor(Math.max(0, c - f) / e);
    const quantity = Math.max(0, Math.min(riskQty, cashQty));
    const grossTarget = (t - e) * quantity;
    const roundTripFees = 2 * f;
    return { riskBudget, quantity, grossTarget, roundTripFees, netTarget: grossTarget - roundTripFees, plannedRisk: (e-s)*quantity, cashUsed: e*quantity+f };
  }, [capital,entry,stop,target,fee]);

  const field = "w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400";
  return <main className="min-h-screen bg-[#071426] px-4 py-6 text-slate-100 md:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div><p className="text-xs font-bold tracking-[.25em] text-amber-300">KANHA v3.2</p><h1 className="mt-1 text-3xl font-black">Trading Intelligence Desk</h1><p className="mt-1 text-sm text-slate-400">Research • Risk • Paper Trading • Audit</p></div>
        <a href="/" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-300">← GLOBAL FUNN</a>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-5"><p className="text-xs tracking-widest text-emerald-300">EXECUTION MODE</p><p className="mt-2 text-xl font-bold">PAPER ONLY</p><p className="mt-1 text-sm text-slate-400">No live orders or broker credentials</p></div>
        <div className="rounded-2xl border border-amber-800 bg-amber-950/30 p-5"><p className="text-xs tracking-widest text-amber-300">DAILY TRADE LIMIT</p><p className="mt-2 text-xl font-bold">Maximum 2</p><p className="mt-1 text-sm text-slate-400">One delivery + one intraday candidate</p></div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><p className="text-xs tracking-widest text-slate-400">MARKET DATA</p><p className="mt-2 text-xl font-bold">Not connected</p><p className="mt-1 text-sm text-slate-400">No live prices are displayed or implied</p></div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Capital & risk calculator</h2><p className="mt-1 text-sm text-slate-400">Illustrative paper plan — estimates only</p></div><span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-amber-200">1% risk budget</span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Trade mode<select className={field+" mt-2"} value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value="INTRADAY">Intraday</option><option value="DELIVERY">Delivery</option></select></label>
            <label className="text-sm text-slate-300">Capital (₹)<input className={field+" mt-2"} inputMode="decimal" value={capital} onChange={e=>setCapital(e.target.value)}/></label>
            <label className="text-sm text-slate-300">Entry price (₹)<input className={field+" mt-2"} inputMode="decimal" value={entry} onChange={e=>setEntry(e.target.value)}/></label>
            <label className="text-sm text-slate-300">Stop loss (₹)<input className={field+" mt-2"} inputMode="decimal" value={stop} onChange={e=>setStop(e.target.value)}/></label>
            <label className="text-sm text-slate-300">Target (₹)<input className={field+" mt-2"} inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)}/></label>
            <label className="text-sm text-slate-300">Estimated fee per order (₹)<input className={field+" mt-2"} inputMode="decimal" value={fee} onChange={e=>setFee(e.target.value)}/></label>
          </div>
          {!result ? <p className="mt-4 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">Enter valid positive values. For a long trade, stop must be below entry and target above entry.</p> : <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Suggested quantity" value={String(result.quantity)+" shares"}/>
            <Metric label="1% risk budget" value={"₹"+result.riskBudget.toFixed(2)}/>
            <Metric label="Planned price risk" value={"₹"+result.plannedRisk.toFixed(2)}/>
            <Metric label="Target profit after fees" value={"₹"+result.netTarget.toFixed(2)}/>
            <Metric label="Round-trip fee estimate" value={"₹"+result.roundTripFees.toFixed(2)}/>
            <Metric label="Capital used incl. fee" value={"₹"+result.cashUsed.toFixed(2)}/>
          </div>}
          <p className="mt-4 text-xs leading-6 text-slate-500">Fee input is a simplified flat estimate. Actual brokerage, STT, exchange charges, GST, stamp duty, spread, slippage and taxes can change results. This is not a recommendation or guaranteed outcome.</p>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5"><h2 className="text-lg font-bold">Broker connectivity</h2><div className="mt-4 space-y-3 text-sm"><Status label="Upstox market data" value="Not connected"/><Status label="Groww" value="Not connected"/><Status label="Dhan" value="Not connected"/></div><p className="mt-4 rounded-xl border border-amber-900 bg-amber-950/30 p-3 text-xs leading-5 text-amber-100">Never paste broker access tokens into this dashboard or GitHub. A future integration must use a secure server-side secret store, read-only scopes first, and explicit order confirmation.</p></div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5"><h2 className="text-lg font-bold">Research pipeline</h2><ol className="mt-4 space-y-3 text-sm text-slate-300">{["Market regime & breadth","Sector strength & relative volume","Candidate scan & liquidity checks","Risk gate & charge-aware sizing","Paper execution & daily audit"].map((x,i)=><li key={x} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-xs text-amber-300">{i+1}</span>{x}</li>)}</ol><p className="mt-4 text-xs text-slate-500">Pipeline status: architecture / offline prototype. Live feeds and automated execution are not active.</p></div>
        </aside>
      </section>
      <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">KANHA v3.2 • Educational research and paper-trading workspace • Not investment advice</footer>
    </div>
  </main>;
}

function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-lg font-bold text-amber-200">{value}</p></div>; }
function Status({label,value}:{label:string;value:string}) { return <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3"><span className="text-slate-300">{label}</span><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-amber-200">{value}</span></div>; }
