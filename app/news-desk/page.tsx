import NewsLeadImporter from "@/components/NewsLeadImporter";

export const metadata = {
  title: "News Desk | GLOBAL FUNN",
  description: "Free RSS lead collection and human editorial review workflow for GLOBAL FUNN."
};

const steps = [
  { number: "01", title: "Collect headline leads", command: "py -3 tools/news_desk/rss_brief.py", output: "output/news-desk/news_brief.md and news_brief.json", note: "Fetches configured RSS/Atom feeds. Each item remains an unverified lead." },
  { number: "02", title: "Prepare editor review queue", command: "py -3 tools/news_desk/prepare_review_queue.py", output: "output/news-desk/review_queue.json", note: "Creates editable fields for sources, verified facts, allegations, uncertainty and editor approval." },
  { number: "03", title: "Run the documentation gate", command: "py -3 tools/news_desk/editorial_gate.py", output: "output/news-desk/editorial_gate_report.json", note: "Holds incomplete stories. A pass is not a fact-check or permission to publish." }
];

export default function NewsDeskPage() {
  return (
    <main style={{minHeight:"100vh",background:"#07111f",color:"#f8fafc",fontFamily:"Arial,sans-serif",padding:"24px 16px"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:24}}>
          <a href="/" style={{color:"#f5d28a",textDecoration:"none",fontWeight:800}}>← GLOBAL FUNN NEWSROOM</a>
          <span style={{border:"1px solid #31533f",background:"#10271d",color:"#86efac",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800}}>FREE • NO AI CREDITS</span>
        </header>
        <section style={{border:"1px solid #26374e",borderRadius:20,background:"#0d1b2d",padding:"clamp(18px,4vw,32px)"}}>
          <div style={{color:"#d6a84f",fontSize:11,fontWeight:900,letterSpacing:2}}>GLOBAL FUNN • NEWSROOM OPERATIONS</div>
          <h1 style={{fontSize:"clamp(30px,5vw,46px)",lineHeight:1.1,margin:"12px 0"}}>Free News Desk</h1>
          <p style={{color:"#cbd5e1",lineHeight:1.7,maxWidth:720}}>A no-subscription RSS research and editorial review workflow. Collect leads, check evidence, record the editor decision, and only then move a story toward script drafting.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12,marginTop:24}}>
            {steps.map(step=>(
              <article key={step.number} style={{border:"1px solid #29415f",borderRadius:14,padding:16,background:"#0a1727"}}>
                <div style={{color:"#d6a84f",fontSize:12,fontWeight:900}}>STEP {step.number}</div>
                <h2 style={{fontSize:18,margin:"10px 0"}}>{step.title}</h2>
                <p style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6}}>{step.note}</p>
                <pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",background:"#020817",border:"1px solid #26374e",padding:12,borderRadius:9,color:"#f5d28a",fontSize:12}}>{step.command}</pre>
                <div style={{fontSize:11,color:"#94a3b8"}}>Output: {step.output}</div>
              </article>
            ))}
          </div>
          <NewsLeadImporter />
          <section style={{marginTop:22,border:"1px solid #6b4e25",background:"#211b12",borderRadius:14,padding:16}}>
            <h2 style={{margin:"0 0 8px",fontSize:18,color:"#f5d28a"}}>Mandatory editorial hold</h2>
            <ul style={{color:"#e2e8f0",fontSize:13,lineHeight:1.9,paddingLeft:20,margin:0}}>
              <li>Open the original article and primary source; do not rely on an RSS snippet.</li>
              <li>Check consequential claims against independent credible evidence.</li>
              <li>Attribute allegations and official statements; record what remains unknown.</li>
              <li>Check image, video and music rights, privacy and fairness.</li>
              <li>A named human editor must approve the final script and final cut separately.</li>
            </ul>
          </section>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:22}}>
            <a href="https://github.com/niteshkumar0326-web/global-funn-live-news/tree/main/tools/news_desk" target="_blank" rel="noreferrer" style={{background:"#d6a84f",color:"#111827",fontWeight:900,textDecoration:"none",borderRadius:10,padding:"12px 16px"}}>Open free tools on GitHub ↗</a>
            <a href="https://github.com/niteshkumar0326-web/global-funn-live-news/blob/main/tools/news_desk/EDITORIAL_WORKFLOW.md" target="_blank" rel="noreferrer" style={{border:"1px solid #64748b",color:"#f8fafc",textDecoration:"none",borderRadius:10,padding:"12px 16px"}}>Read editorial workflow ↗</a>
            <a href="/broadcast" style={{border:"1px solid #64748b",color:"#f8fafc",textDecoration:"none",borderRadius:10,padding:"12px 16px"}}>Broadcast desk →</a>
          </div>
          <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,marginTop:18}}>Important: this page documents the local Python workflow. It does not run the collector on the website, connect live RSS feeds to the dashboard, publish videos, schedule posts or start a live stream. Run the commands on the Windows PC from the cloned repository folder.</p>
        </section>
      </div>
    </main>
  );
}
