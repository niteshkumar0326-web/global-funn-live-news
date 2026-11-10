"use client";
import { useEffect, useMemo, useState } from "react";

type Story = { id:string; headline:string; desk?:string; location?:string; summary?:string; status?:string };
type Segment = { id:string; title:string; desk:string; duration:number; presenterScript:string; sourceNotes:string };
const STORY_KEY="global-funn-newsroom-drafts-v1";
const RUNDOWN_KEY="global-funn-broadcast-rundown-v1";\nconst PRESENTER_KEY="global-funn-presenter-brand-v1";\ntype PresenterProfile={name?:string;role?:string;channel?:string;tagline?:string;photo?:string};

export default function BroadcastRundown(){
  const [stories,setStories]=useState<Story[]>([]);
  const [segments,setSegments]=useState<Segment[]>([]);
  const [title,setTitle]=useState("GLOBAL FUNN — Daily News Bulletin");
  const [anchor,setAnchor]=useState("GLOBAL FUNN presenter");
  const [message,setMessage]=useState("");
  const [teleprompterId,setTeleprompterId]=useState<string|null>(null);
  const [fontScale,setFontScale]=useState(1);\n  const [presenterProfile,setPresenterProfile]=useState<PresenterProfile>({});
  useEffect(()=>{
    try{
      const savedStories=localStorage.getItem(STORY_KEY);
      if(savedStories){const parsed=JSON.parse(savedStories);if(Array.isArray(parsed))setStories(parsed);}
      const savedRun=localStorage.getItem(RUNDOWN_KEY);
      if(savedRun){const parsed=JSON.parse(savedRun);if(parsed&&Array.isArray(parsed.segments)){setSegments(parsed.segments);setTitle(parsed.title||"GLOBAL FUNN — Daily News Bulletin");setAnchor(parsed.anchor||"GLOBAL FUNN presenter");}}
    }catch{setMessage("Saved browser data could not be read.");}
  },[]);
  const total=useMemo(()=>segments.reduce((sum,s)=>sum+(Number(s.duration)||0),0),[segments]);
  const activeSegment=segments.find(s=>s.id===teleprompterId)||null;
  function persist(next:Segment[],nextTitle=title,nextAnchor=anchor){
    setSegments(next);
    try{localStorage.setItem(RUNDOWN_KEY,JSON.stringify({title:nextTitle,anchor:nextAnchor,segments:next,updatedAt:new Date().toISOString()}));setMessage("Rundown saved in this browser. Not synced to cloud.");}
    catch{setMessage("Browser storage unavailable or full. Export the rundown as a backup.");}
  }
  function addStory(story:Story){
    if(segments.some(s=>s.id===story.id))return;
    persist([...segments,{id:story.id,title:story.headline,desk:story.desk||"News",duration:60,presenterScript:story.summary||"",sourceNotes:"Editorial status: "+(story.status||"Not Verified")+". Check original source and editor approval before broadcast."}]);
  }
  function addManual(){
    persist([...segments,{id:crypto.randomUUID(),title:"New bulletin segment",desk:"News",duration:45,presenterScript:"Write a concise, factual presenter introduction. Attribute claims and avoid unsupported statements.",sourceNotes:"Add source links and editor sign-off before broadcast."}]);
  }
  function edit<K extends keyof Segment>(id:string,key:K,value:Segment[K]){persist(segments.map(s=>s.id===id?{...s,[key]:value}:s));}
  function move(index:number,delta:number){const next=[...segments];const target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];persist(next);}
  function remove(id:string){persist(segments.filter(s=>s.id!==id));}
  function saveSettings(){persist(segments,title,anchor);}
  function exportRun(){
    const textOut=[title,anchor,"Estimated duration: "+Math.floor(total/60)+"m "+(total%60)+"s","",...segments.flatMap((s,i)=>[(i+1)+". "+s.title+" ["+s.desk+" • "+s.duration+" sec]","PRESENTER: "+s.presenterScript,"EDITORIAL / SOURCE NOTES: "+s.sourceNotes,""])].join("\n");
    const blob=new Blob([textOut],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-broadcast-rundown.txt";a.click();URL.revokeObjectURL(url);
  }
  const input:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
  const button:React.CSSProperties={border:"1px solid #355071",borderRadius:8,padding:"8px 11px",background:"#10233d",color:"#dce8f8",fontSize:12,fontWeight:700,cursor:"pointer"};
  return <div className="grid">
    <section className="wide panel" style={{display:"grid",gap:14}}>
      <div className="rowline"><h2 style={{margin:0}}>Broadcast rundown builder</h2><span className="pill">LOCAL WORKSPACE</span></div>
      <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
        <label style={{fontSize:12,color:"#c5d3e5"}}>Programme title<input style={{...input,display:"block",marginTop:6}} value={title} onChange={e=>setTitle(e.target.value)} onBlur={saveSettings}/></label>
        <label style={{fontSize:12,color:"#c5d3e5"}}>Presenter / anchor<input style={{...input,display:"block",marginTop:6}} value={anchor} onChange={e=>setAnchor(e.target.value)} onBlur={saveSettings}/></label>
      </div>
      {presenterProfile.name&&<div className="proof" style={{display:"flex",alignItems:"center",gap:12}}>{presenterProfile.photo&&<img src={presenterProfile.photo} alt="Presenter profile" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"1px solid #d4af37"}}/>}<div><strong>Presenter profile connected: {presenterProfile.name}</strong><div className="muted" style={{fontSize:11}}>{presenterProfile.channel||"GLOBAL FUNN"}{presenterProfile.role?" • "+presenterProfile.role:""} — name prefilled from Presenter Studio; you can change it here.</div></div></div>}\n      <div className="grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
        <div className="proof"><div className="stat">{segments.length}</div><div className="statlabel">Segments</div></div>
        <div className="proof"><div className="stat">{Math.floor(total/60)}:{String(total%60).padStart(2,"0")}</div><div className="statlabel">Estimated duration</div></div>
        <div className="proof"><div className="stat">{stories.length}</div><div className="statlabel">Available story drafts</div></div>
      </div>
      {activeSegment&&<section className="proof" aria-live="polite" style={{padding:20,borderStyle:"solid",borderColor:"#d4af37",display:"grid",gap:14}}>
        <div className="rowline"><div><div className="eyebrow">PRESENTER TELEPROMPTER</div><strong>{activeSegment.title}</strong></div><button type="button" style={button} onClick={()=>setTeleprompterId(null)}>Close reader</button></div>
        <div style={{fontSize:Math.round(25*fontScale),lineHeight:1.7,whiteSpace:"pre-wrap",color:"#fff",fontWeight:600,minHeight:120}}>{activeSegment.presenterScript||"No presenter script entered yet."}</div>
        <div className="rowline"><span className="muted" style={{fontSize:11}}>Read from the verified source; this screen does not validate the script.</span><div style={{display:"flex",gap:6}}><button type="button" style={button} onClick={()=>setFontScale(v=>Math.max(.75,v-.1))}>A−</button><button type="button" style={button} onClick={()=>setFontScale(v=>Math.min(1.6,v+.1))}>A+</button></div></div>
      </section>}
      <div className="rowline"><h3 style={{margin:0}}>Programme order</h3><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" style={button} onClick={addManual}>+ Add segment</button><button type="button" style={button} onClick={exportRun} disabled={!segments.length}>Export presenter rundown</button></div></div>
      {!segments.length&&<div className="proof">No segments yet. Add a saved story or create a manual segment to start the programme.</div>}
      {segments.map((s,i)=><article className="story" key={s.id} style={{display:"grid",gap:10}}>
        <div className="rowline"><strong>{String(i+1).padStart(2,"0")} · {s.title}</strong><div style={{display:"flex",gap:5}}><button style={button} type="button" onClick={()=>setTeleprompterId(s.id)}>Read script</button><button style={button} type="button" onClick={()=>move(i,-1)} disabled={i===0}>↑</button><button style={button} type="button" onClick={()=>move(i,1)} disabled={i===segments.length-1}>↓</button><button style={button} type="button" onClick={()=>remove(s.id)}>Remove</button></div></div>
        <div className="grid" style={{gridTemplateColumns:"2fr 1fr",gap:10}}>
          <input aria-label="Segment headline" style={input} value={s.title} onChange={e=>edit(s.id,"title",e.target.value)}/>
          <div style={{display:"flex",gap:7}}><input aria-label="Desk" style={input} value={s.desk} onChange={e=>edit(s.id,"desk",e.target.value)}/><input aria-label="Duration seconds" type="number" min="5" max="3600" style={{...input,maxWidth:90}} value={s.duration} onChange={e=>edit(s.id,"duration",Math.max(5,Number(e.target.value)||5))}/></div>
        </div>
        <label style={{fontSize:12,color:"#c5d3e5"}}>Presenter script<textarea rows={3} style={{...input,display:"block",marginTop:5,resize:"vertical"}} value={s.presenterScript} onChange={e=>edit(s.id,"presenterScript",e.target.value)}/></label>
        <label style={{fontSize:12,color:"#c5d3e5"}}>Editorial / source notes<textarea rows={2} style={{...input,display:"block",marginTop:5,resize:"vertical"}} value={s.sourceNotes} onChange={e=>edit(s.id,"sourceNotes",e.target.value)}/></label>
      </article>)}
      {message&&<div className="proof" role="status">{message}</div>}
    </section>
    <aside className="side panel">
      <h2>Add from Story Queue</h2>
      <p className="muted" style={{fontSize:12,lineHeight:1.6}}>Saved browser drafts appear here. Adding a story to a rundown does not verify or publish it.</p>
      {!stories.length&&<div className="proof">No local story drafts found. Add a story through Story Intake first.</div>}
      {stories.map(story=><article className="story" key={story.id}><div className="tag">{story.desk||"NEWS"} • {story.status||"NOT VERIFIED"}</div><h3>{story.headline}</h3><button type="button" style={button} onClick={()=>addStory(story)} disabled={segments.some(s=>s.id===story.id)}>Add to rundown</button></article>)}
      <div className="proof"><strong>Broadcast safety gate</strong><p style={{marginBottom:0}}>This tool prepares a rundown only. It does not fact-check, mark stories verified, generate live feeds or publish to social channels. Editor approval and visible source references remain mandatory.</p></div>
    </aside>
  </div>;
}
