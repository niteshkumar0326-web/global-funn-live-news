export const dynamic = "force-dynamic";

const checks = [
  { label: "Supabase project URL", ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), key: "NEXT_PUBLIC_SUPABASE_URL" },
  { label: "Supabase publishable key", ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" },
];

export default function CloudReadinessPage() {
  const ready = checks.every((item) => item.ready);
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>CLOUD READINESS</div><div className="muted" style={{fontSize:11}}>SECURE NEWSROOM FOUNDATION</div></div></div>
        <a href="/" className="pill" style={{textDecoration:"none"}}>← Dashboard</a>
      </header>
      <section className="hero">
        <div className="eyebrow">BUILD 05 • CLOUD FOUNDATION</div>
        <h1>One newsroom.<br/><span className="gold">Shared securely.</span></h1>
        <p className="muted" style={{maxWidth:700,lineHeight:1.7}}>This page checks whether the deployment has the public Supabase connection settings. It never displays key values and does not pretend a database is connected until the credentials and database are actually configured.</p>
      </section>
      <section className="panel" style={{maxWidth:850}}>
        <div className="rowline"><h2>Connection checklist</h2><span className={ready ? "status" : "status warn"}>{ready ? "ENVIRONMENT READY FOR TEST" : "SETUP REQUIRED"}</span></div>
        {checks.map((item) => <article className="story" key={item.key}>
          <div className="rowline"><strong>{item.label}</strong><span className={item.ready ? "status" : "status warn"}>{item.ready ? "PRESENT" : "MISSING"}</span></div>
          <p className="muted" style={{fontSize:12,margin:"8px 0 0"}}><code>{item.key}</code></p>
        </article>)}
        <div className="proof" style={{marginTop:16}}>
          <strong>Security rules</strong>
          <ul style={{paddingLeft:18,lineHeight:1.9,marginBottom:0}}>
            <li>Only publishable keys may be used in browser-visible environment variables.</li>
            <li>Never put a Supabase secret or service-role key in NEXT_PUBLIC variables or client code.</li>
            <li>Every exposed newsroom table must have row-level security enabled.</li>
            <li>Reporter and editor permissions must be enforced by database policies, not just hidden buttons.</li>
          </ul>
        </div>
        <p className="muted" style={{fontSize:12,lineHeight:1.7,marginTop:16}}>A green environment check only confirms that two settings exist. It does not verify database connectivity, authentication, table access or row-level security.</p>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:8,padding:"10px 14px",border:"1px solid #29415f",borderRadius:9,color:"#cbd5e1",textDecoration:"none"}}>Open Supabase Dashboard ↗</a>
      </section>
      <footer className="footer"><span>GLOBAL FUNN LIVE NEWS</span><span>Proof first • Human approval before publication</span></footer>
    </main>
  );
}
