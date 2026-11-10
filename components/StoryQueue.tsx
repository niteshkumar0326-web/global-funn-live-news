"use client";

import { useEffect, useState } from "react";

type Correction = {
  id: string;
  previousHeadline: string;
  correctedHeadline: string;
  reason: string;
  editor: string;
  sourceUrl: string;
  correctedAt: string;
};
type Story = {
  id:string; headline:string; desk:string; location:string; summary:string;
  source1:string; source2:string; status:string; editor:string; createdAt:string;
  corrections?:Correction[];
};
const KEY="global-funn-newsroom-drafts-v1";

export default function StoryQueue(){
 const [items,setItems]=useState<Story[]>([]);
 const [ready,setReady]=useState(false);
 const [editingId,setEditingId]=useState<string|null>(null);
 const [correctedHeadline,setCorrectedHeadline]=useState("");
 const [reason,setReason]=useState("");
 const [editor,setEditor]=useState("");
 const [sourceUrl,setSourceUrl]=useState("");
 const [message,setMessage]=useState("");

 useEffect(()=>{
  try{
   const raw=localStorage.getItem(KEY);
   if(raw){const data=JSON.parse(raw);if(Array.isArray(data))setItems(data)}
  }catch{setMessage("Saved browser data could not be read.")}
  setReady(true);
 },[]);

 function persist(next:Story[]){
  setItems(next);
  try{localStorage.setItem(KEY,JSON.stringify(next));setMessage("Saved in this browser only. Export a backup regularly.")}
  catch{setMessage("Browser storage is unavailable or full. Your change may not persist; export a backup if possible.")}
 }
 function remove(id:string){
  if(!window.confirm("Delete this local draft and its correction history? Export a backup first if you need to keep it."))return;
  persist(items.filter(x=>x.id!==id));
 }
 function startCorrection(story:Story){
  setEditingId(story.id);setCorrectedHeadline(story.headline);setReason("");setEditor("");setSourceUrl("");setMessage("");
 }
 function saveCorrection(story:Story){
  if(correctedHeadline.trim().length<6||reason.trim().length<10||!editor.trim())return;
  if(sourceUrl.trim()&&!/^https?:\/\//i.test(sourceUrl.trim())){setMessage("Evidence reference must begin with http:// or https://.");return}
  const correction:Correction={
   id:crypto.randomUUID(),
   previousHeadline:story.headline,
   correctedHeadline:correctedHeadline.trim(),
   reason:reason.trim(),
   editor:editor.trim(),
   sourceUrl:sourceUrl.trim(),
   correctedAt:new Date().toISOString()
  };
  const next=items.map(item=>item.id===story.id?{
   ...item,
   headline:correctedHeadline.trim(),
   corrections:[...(Array.isArray(item.corrections)?item.corrections:[]),correction]
  }:item);
  persist(next);setEditingId(null);setCorrectedHeadline("");setReason("");setEditor("");setSourceUrl("");
 }
 function exportData(){
  const blob=new Blob([JSON.stringify({project:"GLOBAL FUNN LIVE NEWS",exportedAt:new Date().toISOString(),stories:items},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-story-queue-backup.json";a.click();URL.revokeObjectURL(url);
 }
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const label:React.CSSProperties={display:"block",fontSize:12,color:"#c5d3e5",marginBottom:6,fontWeight:700};
 return <section className="panel">
  <div className="rowline"><h2>Editorial story queue</h2><button type="button" onClick={exportData} disabled={!items.length} style={{border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"transparent",color:"#f5d98c",fontWeight:800}}>Export backup</button></div>
  <p className="muted" style={{fontSize:12,lineHeight:1.7}}>Browser-local records only. This queue is not shared with other users or devices. Every item remains Not Verified until an editor checks its evidence.</p>
  {!ready?<p className="muted">Loading local records…</p>:items.length===0?<div className="proof">No saved drafts found in this browser. <a href="/story-intake" style={{color:"#d4af37"}}>Add a story →</a></div>:items.map(s=><article className="story" key={s.id}>
   <div className="rowline"><span className="tag">{s.desk} • {s.location||"LOCATION NOT SET"}</span><span className="status warn">NOT VERIFIED</span></div>
   <h3>{s.headline}</h3><p className="muted" style={{fontSize:12,lineHeight:1.7}}>{s.summary}</p>
   <div className="proof"><strong>References</strong><p><a href={s.source1} target="_blank" rel="noreferrer" style={{color:"#d4af37"}}>Primary source</a>{s.source2&&<> • <a href={s.source2} target="_blank" rel="noreferrer" style={{color:"#d4af37"}}>Second source</a></>}</p><small>Submitted: {new Date(s.createdAt).toLocaleString()} • Editor: {s.editor||"Unassigned"}</small></div>
   <div className="rowline" style={{marginTop:12}}>
    <span className="muted" style={{fontSize:12}}>{s.corrections?.length||0} correction record(s)</span>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
     <button type="button" onClick={()=>startCorrection(s)} style={{border:"1px solid #d4af37",borderRadius:8,padding:"7px 10px",background:"transparent",color:"#f5d98c"}}>Record correction</button>
     <button type="button" onClick={()=>remove(s.id)} style={{border:"1px solid #8b4248",borderRadius:8,padding:"7px 10px",background:"transparent",color:"#fecaca"}}>Delete local draft</button>
    </div>
   </div>
   {editingId===s.id&&<div className="proof" style={{marginTop:12,display:"grid",gap:12}}>
    <strong>Record a visible correction</strong>
    <div><label style={label}>Corrected headline *</label><input style={field} value={correctedHeadline} onChange={e=>setCorrectedHeadline(e.target.value)} /></div>
    <div><label style={label}>What changed and why? *</label><textarea style={{...field,minHeight:90}} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain the error or new verified information (minimum 10 characters)." /></div>
    <div><label style={label}>Editor recording correction *</label><input style={field} value={editor} onChange={e=>setEditor(e.target.value)} placeholder="Editor name" /></div>
    <div><label style={label}>Evidence URL (recommended)</label><input style={field} type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..." /></div>
    <div className="rowline">
     <button type="button" disabled={correctedHeadline.trim().length<6||reason.trim().length<10||!editor.trim()} onClick={()=>saveCorrection(s)} style={{border:0,borderRadius:8,padding:"9px 12px",background:"#d4af37",color:"#071426",fontWeight:800}}>Save correction record</button>
     <button type="button" onClick={()=>setEditingId(null)} style={{border:"1px solid #52647a",borderRadius:8,padding:"9px 12px",background:"transparent",color:"#dce7f5"}}>Cancel</button>
    </div>
   </div>}
   {s.corrections?.length? <div className="proof" style={{marginTop:12}}><strong>Correction history</strong>{s.corrections.map(c=><div key={c.id} style={{borderTop:"1px solid #355071",marginTop:10,paddingTop:10}}><small>{new Date(c.correctedAt).toLocaleString()} • {c.editor}</small><p style={{margin:"5px 0"}}><strong>Before:</strong> {c.previousHeadline}</p><p style={{margin:"5px 0"}}><strong>After:</strong> {c.correctedHeadline}</p><p style={{margin:"5px 0"}}>{c.reason}</p>{c.sourceUrl&&<a href={c.sourceUrl} target="_blank" rel="noreferrer" style={{color:"#d4af37"}}>Evidence reference</a>}</div>)}</div>:null}
  </article>)}
  {message&&<p className="muted" role="status" style={{fontSize:12}}>{message}</p>}
 </section>;
}
