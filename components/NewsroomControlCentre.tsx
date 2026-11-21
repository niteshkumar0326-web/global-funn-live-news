"use client";
import {useCallback,useEffect,useState} from "react";
type Snapshot={stories:number,corrections:number,segments:number,shots:number,productionDone:number,productionTotal:number,mediaAssets:number,loaded:boolean,problem:string};
const KEYS={stories:"global-funn-newsroom-drafts-v1",rundown:"global-funn-broadcast-rundown-v1",storyboard:"global-funn-storyboard-v1",production:"global-funn-video-production-checklist-v1"};
function readArray(value:string|null):any[]{if(!value)return[];try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[]}catch{return[]}}
function readObject(value:string|null):any{if(!value)return{};try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{}}catch{return{}}}
export default function NewsroomControlCentre(){
 const [data,setData]=useState<Snapshot>({stories:0,corrections:0,segments:0,shots:0,productionDone:0,productionTotal:0,mediaAssets:0,loaded:false,problem:""});
 const [refreshed,setRefreshed]=useState("");
 const refresh=useCallback(()=>{
  try{
   const stories=readArray(localStorage.getItem(KEYS.stories));
   const rundown=readObject(localStorage.getItem(KEYS.rundown));
   const storyboard=readObject(localStorage.getItem(KEYS.storyboard));
   const production=readObject(localStorage.getItem(KEYS.production));
   const corrections=stories.reduce((n,s)=>n+(Array.isArray(s?.corrections)?s.corrections.length:0),0);
   const tasks=Array.isArray(production?.tasks)?production.tasks:Array.isArray(production?.checklist)?production.checklist:[];
   const done=tasks.filter((t:any)=>t===true||t?.done===true||t?.completed===true||t?.checked===true).length;
   let total=tasks.length;
   if(!total&&production&&Array.isArray(production?.steps)){total=production.steps.length;}
   setData({stories:stories.length,corrections,segments:Array.isArray(rundown?.segments)?rundown.segments.length:0,shots:Array.isArray(storyboard?.shots)?storyboard.shots.length:0,productionDone:done,productionTotal:total,mediaAssets:0,loaded:true,problem:""});
   setRefreshed(new Date().toLocaleTimeString());
  }catch{setData(v=>({...v,loaded:true,problem:"Some saved browser data could not be read. Open the relevant workspace and export a backup before clearing browser data."}));setRefreshed(new Date().toLocaleTimeString());}
 },[]);
 useEffect(()=>{refresh();const onStorage=()=>refresh();window.addEventListener("storage",onStorage);return()=>window.removeEventListener("storage",onStorage)},[refresh]);
 const metric=(value:number,label:string,href:string)=>({value:data.loaded?String(value).padStart(2,"0"):"…",label,href});
 const metrics=[metric(data.stories,"Local story drafts","/stories"),metric(data.corrections,"Correction records","/archive"),metric(data.segments,"Broadcast segments","/broadcast"),metric(data.shots,"Storyboard shots","/storyboard")];
 const checks=[{name:"Story intake & editorial queue",detail:"Drafts and story status",href:"/stories",count:data.stories+" drafts"},{name:"Evidence & verification",detail:"Review claims and supporting sources",href:"/verification",count:"Manual review"},{name:"Research & scripts",detail:"Evidence notes and presenter copy",href:"/research",count:"Review required"},{name:"Broadcast & storyboard",detail:"Rundown, scenes and shot plan",href:"/storyboard",count:data.segments+" segments • "+data.shots+" shots"},{name:"Media & presenter assets",detail:"Check rights, consent and attribution",href:"/media",count:"Local library"},{name:"Final production hand-off",detail:"Production checklist and editor sign-off",href:"/production",count:data.productionTotal?data.productionDone+"/"+data.productionTotal+" tasks":"Open checklist"}];
 return <section className="panel" style={{marginBottom:16}}>
  <div className="rowline" style={{gap:12,flexWrap:"wrap"}}><div><div className="eyebrow">BUILD 25 • NEWSROOM CONTROL & QUALITY</div><h2 style={{margin:"7px 0 0"}}>Newsroom operations overview</h2></div><div className="rowline"><span className="status warn">BROWSER-LOCAL DATA</span><button type="button" onClick={refresh} style={{border:"1px solid #49617e",background:"#10233d",color:"#dbeafe",padding:"8px 11px",borderRadius:8,cursor:"pointer",fontSize:11}}>↻ Refresh counts</button></div></div>
  <div className="grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginTop:16}}>{metrics.map(m=><a key={m.label} href={m.href} className="proof" style={{margin:0,textDecoration:"none",display:"block"}}><div className="stat">{m.value}</div><div className="statlabel">{m.label}</div><div style={{fontSize:10,color:"#d4af37",marginTop:7}}>Open workspace →</div></a>)}</div>
  <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(240px,1fr)",gap:14,marginTop:18}}>
   <div><div className="rowline"><h2 style={{margin:0}}>Workflow checkpoints</h2><span className="muted" style={{fontSize:10}}>Open each module to review</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:9,marginTop:10}}>{checks.map(c=><a href={c.href} key={c.name} className="proof" style={{margin:0,textDecoration:"none",display:"block"}}><div style={{fontSize:12,fontWeight:800,color:"#e2e8f0"}}>{c.name}</div><div className="muted" style={{fontSize:10,marginTop:5}}>{c.detail}</div><div style={{fontSize:10,color:"#d4af37",marginTop:8}}>{c.count} →</div></a>)}</div></div>
   <aside className="proof" style={{margin:0}}><div className="eyebrow">QUALITY GATE</div><h2 style={{margin:"8px 0"}}>No automatic approval</h2><ul className="muted" style={{fontSize:11,lineHeight:1.8,paddingLeft:18}}><li>Verify claims against primary evidence.</li><li>Check dates, names, locations and attribution.</li><li>Confirm image, footage and music rights.</li><li>Record corrections and editor sign-off.</li><li>Approve final cut before any publication.</li></ul><div className="status warn">PUBLISHING NOT CONNECTED</div></aside>
  </div>
  <div className="rowline" style={{marginTop:12,flexWrap:"wrap"}}><span className="muted" style={{fontSize:10}}>Last refreshed: {refreshed||"Loading…"}</span><span className="muted" style={{fontSize:10}}>Counts are from this browser; IndexedDB media files and other devices are not included.</span></div>
  {data.problem&&<div className="proof" style={{borderColor:"#85434b",color:"#fecaca"}}>{data.problem}</div>}
  <p className="muted" style={{fontSize:10,lineHeight:1.6,marginBottom:0}}>These are workspace activity counts, not live newsroom metrics, verified-story totals, quality scores or publication approvals. Refresh after editing; same-tab modules may not emit browser storage events.</p>
  <div className="nav" style={{marginBottom:0}}><a href="/story-intake">+ New story</a><a href="/stories">Review queue</a><a href="/verification">Verification</a><a href="/archive">Corrections</a><a href="/broadcast">Broadcast Desk</a><a href="/production">Production</a></div>
 </section>
}
