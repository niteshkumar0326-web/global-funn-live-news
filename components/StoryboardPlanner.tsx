"use client";

import {useEffect,useMemo,useState} from "react";
type Shot={id:string;scene:string;visual:string;source:string;narration:string;screenText:string;duration:number;status:string;notes:string};
const KEY="global-funn-storyboard-v1";
const starter:Shot[]=[
 {id:"shot-1",scene:"Opening presenter",visual:"Presenter medium shot",source:"Presenter Scene Studio",narration:"Welcome to GLOBAL FUNN. Here are today's verified headlines.",screenText:"GLOBAL FUNN • TOP STORIES",duration:12,status:"Planned",notes:"Check presenter photo permission and pronunciation."},
 {id:"shot-2",scene:"Main report",visual:"Relevant location / event footage",source:"Add approved media asset",narration:"Add the editor-approved report narration here.",screenText:"Add verified location and date",duration:25,status:"Needs asset",notes:"Use only licensed or permission-cleared footage."},
 {id:"shot-3",scene:"Evidence context",visual:"Document, chart or source graphic",source:"Research Desk / Graphics Studio",narration:"Explain what the primary source confirms and what remains unknown.",screenText:"SOURCE CONTEXT • VERIFY BEFORE AIR",duration:18,status:"Needs review",notes:"Display source name and date; do not imply unsupported certainty."},
 {id:"shot-4",scene:"Presenter close",visual:"Presenter sign-off",source:"Presenter Scene Studio",narration:"That is the latest update. Stay with GLOBAL FUNN for verified coverage.",screenText:"KHABAR HAR PAL, NAZAR GLOBAL",duration:10,status:"Planned",notes:"Final editor sign-off before release."}
];
const uid=()=>typeof crypto!=="undefined"&&"randomUUID"in crypto?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
function download(name:string,body:string,type:string){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
const csv=(rows:string[][])=>rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
export default function StoryboardPlanner(){
 const [title,setTitle]=useState("GLOBAL FUNN — Daily News Bulletin"),[producer,setProducer]=useState(""),[editor,setEditor]=useState(""),[shots,setShots]=useState<Shot[]>(starter),[notice,setNotice]=useState("Starter storyboard loaded. Edit each shot for your programme."),[script,setScript]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);setTitle(d.title||"GLOBAL FUNN — Daily News Bulletin");setProducer(d.producer||"");setEditor(d.editor||"");setShots(Array.isArray(d.shots)?d.shots:starter);}const s=localStorage.getItem("global-funn-script-studio-v1");if(s){const d=JSON.parse(s);setScript([d.introEn,d.bodyEn,d.outroEn,d.introHi,d.bodyHi,d.outroHi].filter(Boolean).join("\n\n"));}}catch{setNotice("Saved storyboard could not be loaded. Export a backup if you have one.");}},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({title,producer,editor,shots,updatedAt:new Date().toISOString()}));}catch{setNotice("Browser storage is full. Export your storyboard now.");}},[title,producer,editor,shots]);
 const total=useMemo(()=>shots.reduce((n,s)=>n+Math.max(0,Number(s.duration)||0),0),[shots]);
 const ready=shots.filter(s=>s.status==="Ready").length;
 function patch(id:string,p:Partial<Shot>){setShots(v=>v.map(s=>s.id===id?{...s,...p}:s));}
 function add(){const s:Shot={id:uid(),scene:"New scene",visual:"Describe the shot",source:"Add approved source / asset",narration:"Add presenter narration",screenText:"Add on-screen text",duration:10,status:"Planned",notes:"Add rights, attribution and continuity notes."};setShots(v=>[...v,s]);setNotice("New shot added.");}
 function move(i:number,delta:number){const n=i+delta;if(n<0||n>=shots.length)return;const a=[...shots];[a[i],a[n]]=[a[n],a[i]];setShots(a);}
 function exportCsv(){download("global-funn-storyboard.csv",csv([["Order","Scene","Visual / shot","Source / asset","Narration","On-screen text","Duration seconds","Status","Production notes"],...shots.map((s,i)=>[String(i+1),s.scene,s.visual,s.source,s.narration,s.screenText,String(s.duration),s.status,s.notes])]),"text/csv;charset=utf-8");setNotice("Storyboard CSV exported.");}
 function exportBrief(){const body=[title,"Producer: "+(producer||"Not assigned"),"Editor: "+(editor||"Not assigned"),"Estimated duration: "+total+" seconds","",...shots.flatMap((s,i)=>["SHOT "+(i+1)+" — "+s.scene,"Visual: "+s.visual,"Source / asset: "+s.source,"Duration: "+s.duration+" seconds","Narration: "+s.narration,"On-screen: "+s.screenText,"Status: "+s.status,"Notes: "+s.notes,""])].join("\n");download("global-funn-director-brief.txt",body,"text/plain;charset=utf-8");setNotice("Director's brief exported.");}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:8,padding:"9px 10px",color:"#f8fafc",fontSize:12};
 const label:React.CSSProperties={display:"grid",gap:5,fontSize:11,color:"#c5d3e5"};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div style={{display:"grid",gap:16}}>
 <section className="panel" style={{display:"grid",gap:12}}>
  <div className="rowline"><h2 style={{margin:0}}>Programme storyboard</h2><span className="pill">BUILD 24</span></div>
  <p className="muted" style={{fontSize:12,lineHeight:1.6,margin:0}}>Plan the visual sequence before editing. This is a production hand-off tool: it does not render video, fetch footage, validate facts or publish content.</p>
  <div className="grid" style={{gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
   <label style={label}>Programme / episode<input style={field} value={title} onChange={e=>setTitle(e.target.value)} maxLength={120}/></label>
   <label style={label}>Producer<input style={field} value={producer} onChange={e=>setProducer(e.target.value)} maxLength={70}/></label>
   <label style={label}>Editor<input style={field} value={editor} onChange={e=>setEditor(e.target.value)} maxLength={70}/></label>
  </div>
  <div className="grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
   <div className="proof"><strong>{shots.length}</strong><div>Shots / scenes</div></div><div className="proof"><strong>{Math.floor(total/60)}m {total%60}s</strong><div>Estimated runtime</div></div><div className="proof"><strong>{ready}/{shots.length}</strong><div>Marked ready by user</div></div>
  </div>
  <div className="rowline" style={{flexWrap:"wrap"}}><button style={btn} type="button" onClick={add}>+ Add shot</button><button style={btn} type="button" onClick={exportCsv}>Export edit shot list CSV</button><button style={btn} type="button" onClick={exportBrief}>Export director's brief TXT</button><a href="/video-studio" className="pill">Open Video & Audio Studio</a></div>
  <div className="muted" style={{fontSize:11}}>{notice}</div>
 </section>
 {shots.map((s,i)=><section className="panel" key={s.id} style={{display:"grid",gap:11}}>
  <div className="rowline"><div><div className="eyebrow">SHOT {String(i+1).padStart(2,"0")} • {s.duration}s</div><h2 style={{margin:"5px 0 0"}}>{s.scene||"Untitled shot"}</h2></div><div className="rowline" style={{flexWrap:"wrap"}}><button type="button" style={btn} onClick={()=>move(i,-1)} disabled={i===0}>↑</button><button type="button" style={btn} onClick={()=>move(i,1)} disabled={i===shots.length-1}>↓</button><button type="button" style={{...btn,borderColor:"#85434b",color:"#fecaca"}} onClick={()=>setShots(v=>v.filter(x=>x.id!==s.id))}>Remove</button></div></div>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr 130px",gap:10}}>
   <label style={label}>Scene name<input style={field} value={s.scene} onChange={e=>patch(s.id,{scene:e.target.value})}/></label>
   <label style={label}>Visual / camera shot<input style={field} value={s.visual} onChange={e=>patch(s.id,{visual:e.target.value})}/></label>
   <label style={label}>Duration (sec)<input style={field} type="number" min="1" max="3600" value={s.duration} onChange={e=>patch(s.id,{duration:Math.max(1,Math.min(3600,Number(e.target.value)||1))})}/></label>
  </div>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:10}}>
   <label style={label}>Source / media asset<input style={field} value={s.source} onChange={e=>patch(s.id,{source:e.target.value})}/></label>
   <label style={label}>On-screen text / lower third<input style={field} value={s.screenText} onChange={e=>patch(s.id,{screenText:e.target.value})}/></label>
  </div>
  <label style={label}>Presenter narration / voice-over<textarea style={{...field,minHeight:72,resize:"vertical"}} value={s.narration} onChange={e=>patch(s.id,{narration:e.target.value})}/></label>
  <div className="grid" style={{gridTemplateColumns:"180px 1fr",gap:10}}>
   <label style={label}>Production status<select style={field} value={s.status} onChange={e=>patch(s.id,{status:e.target.value})}>{["Planned","Needs asset","Needs review","Ready"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label style={label}>Rights, attribution & continuity notes<input style={field} value={s.notes} onChange={e=>patch(s.id,{notes:e.target.value})}/></label>
  </div>
 </section>)}
 <section className="panel" style={{display:"grid",gap:10}}>
  <div className="rowline"><h2 style={{margin:0}}>Editorial & production hand-off</h2><span className="pill">HUMAN SIGN-OFF</span></div>
  <div className="proof">Before recording or editing, confirm that the story has editor approval, every visual has a lawful usage basis, source attribution is visible where needed, names/dates/locations are checked, and the final export is reviewed. “Ready” is a manual status, not an automated fact or rights check.</div>
  <div className="rowline" style={{flexWrap:"wrap"}}><a href="/scripts" className="pill">Script Studio</a><a href="/research" className="pill">Research Desk</a><a href="/graphics" className="pill">Graphics Studio</a><a href="/presenter-scenes" className="pill">Presenter Scenes</a><a href="/production" className="pill">Production Workspace</a></div>
  {script&&<details className="proof"><summary>Read-only Script Studio hand-off preview</summary><pre style={{whiteSpace:"pre-wrap",fontSize:12,color:"#dbeafe"}}>{script}</pre></details>}
 </section>
 </div>;
}
