"use client";

import { useEffect, useMemo, useState } from "react";

type Step = { id:string; title:string; detail:string; route:string; required:boolean };
const steps:Step[]=[
{id:"story",title:"Story selected and desk assigned",detail:"Use a story from the newsroom queue; confirm location, date and reporting desk.",route:"/stories",required:true},
{id:"evidence",title:"Evidence reviewed",detail:"Check primary sources, independent confirmation, attribution and unresolved claims.",route:"/research",required:true},
{id:"approval",title:"Editorial review recorded",detail:"A human editor must approve the script and decide what can be stated as fact.",route:"/verification",required:true},
{id:"script",title:"Presenter script prepared",detail:"Prepare English or Hindi copy, pronunciation notes and clear attribution.",route:"/scripts",required:true},
{id:"rundown",title:"Broadcast rundown arranged",detail:"Order segments, assign presenter, check timing and read the script in teleprompter.",route:"/broadcast",required:true},
{id:"identity",title:"Presenter identity checked",detail:"Confirm the selected presenter photo, name, consent and channel branding.",route:"/presenter",required:true},
{id:"graphics",title:"Graphics prepared and checked",detail:"Create matching landscape, square or vertical artwork; verify headline and source label.",route:"/graphics",required:true},
{id:"media",title:"Media rights and assets checked",detail:"Confirm rights, permissions, attribution and usage status for every image, clip and audio file.",route:"/media",required:true},
{id:"final",title:"Final playback and editor sign-off",detail:"Review spelling, captions, audio, visual crop, factual accuracy and corrections before release.",route:"/broadcast",required:true}
];
const KEY="global-funn-video-production-checklist-v1";
export default function VideoProductionWorkspace(){
 const [checked,setChecked]=useState<Record<string,boolean>>({});
 const [title,setTitle]=useState("");
 const [producer,setProducer]=useState("");
 const [notes,setNotes]=useState("");
 const [saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);setChecked(v.checked||{});setTitle(v.title||"");setProducer(v.producer||"");setNotes(v.notes||"");}}catch{setSaved(false);}},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({checked,title,producer,notes,updatedAt:new Date().toISOString()}));setSaved(true);}catch{setSaved(false);}},[checked,title,producer,notes]);
 const done=useMemo(()=>steps.filter(s=>checked[s.id]).length,[checked]);
 const ready=steps.filter(s=>s.required).every(s=>checked[s.id]);
 function exportPlan(){const text=["GLOBAL FUNN — VIDEO PRODUCTION SHEET","Programme: "+title,"Producer: "+producer,"Checklist: "+done+"/"+steps.length,"",...steps.map(s=>(checked[s.id]?"[x] ":"[ ] ")+s.title+" — "+s.detail),"","Production notes:",notes,"","This checklist is an internal planning aid, not proof of factual accuracy or publication approval."].join("\n");const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-production-sheet.txt";a.click();URL.revokeObjectURL(url);}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 return <div className="grid">
 <section className="wide panel" style={{display:"grid",gap:14}}>
  <div className="rowline"><h2 style={{margin:0}}>Production brief</h2><span className="pill">BUILD 20</span></div>
  <label style={{fontSize:12}}>Programme / episode title<input style={field} value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="Enter episode or bulletin title"/></label>
  <label style={{fontSize:12}}>Producer / responsible editor<input style={field} value={producer} onChange={e=>setProducer(e.target.value)} maxLength={80} placeholder="Name of responsible producer"/></label>
  <label style={{fontSize:12}}>Production notes<textarea style={{...field,display:"block"}} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} maxLength={2000} placeholder="Timing, pronunciation, guest, location or accessibility notes"/></label>
  <div className="rowline"><div><strong>Production checklist</strong><div className="muted" style={{fontSize:11}}>{done} of {steps.length} completed</div></div><button type="button" onClick={exportPlan} style={{border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"}}>Export production sheet</button></div>
  <div style={{height:8,background:"#1b2b41",borderRadius:20,overflow:"hidden"}}><div style={{height:"100%",width:(done/steps.length*100)+"%",background:"#d4af37",transition:"width .2s"}}/></div>
  {steps.map((step,i)=><article key={step.id} className="story" style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:12,alignItems:"start"}}>
   <input aria-label={"Mark "+step.title+" complete"} type="checkbox" checked={!!checked[step.id]} onChange={e=>setChecked(v=>({...v,[step.id]:e.target.checked}))} style={{width:18,height:18,marginTop:3,accentColor:"#d4af37"}}/>
   <div><strong>{i+1}. {step.title}</strong><p className="muted" style={{fontSize:12,lineHeight:1.5,margin:"5px 0 0"}}>{step.detail}</p></div>
   <a className="pill" href={step.route}>Open desk →</a>
  </article>)}
  <div className="proof" role="status">{saved?"Checklist saved in this browser.":"Browser storage unavailable — export a copy."}</div>
 </section>
 <aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
  <h2 style={{margin:0}}>Release readiness</h2>
  <div className="stat">{Math.round(done/steps.length*100)}%</div>
  <div className="statlabel">Checklist progress</div>
  {ready?<div className="status">ALL CHECKS MARKED COMPLETE</div>:<div className="status warn">NOT READY — CHECKS REMAINING</div>}
  <div className="proof"><strong>Editorial rule</strong><p style={{fontSize:12,lineHeight:1.6,marginBottom:0}}>Checking every box does not verify a story or grant publication permission. A responsible editor must review the actual evidence and final output.</p></div>
  <div className="proof"><strong>Local storage</strong><p style={{fontSize:12,lineHeight:1.6,marginBottom:0}}>This production sheet is saved only in this browser and device. It is not shared with other newsroom users or synced to cloud storage.</p></div>
 </aside>
 </div>;
}
