"use client";
import { useEffect, useState } from "react";
type Draft = { id:string; headline:string; desk:string; location:string; summary:string; source1:string; source2:string; status:string; editor:string; createdAt:string };
const KEY="global-funn-newsroom-drafts-v1";
type DraftInput={headline:string;desk:string;location:string;summary:string;source1:string;source2:string;status:string;editor:string};
const empty:DraftInput={headline:"",desk:"India",location:"",summary:"",source1:"",source2:"",status:"Not Verified",editor:""};
export default function StoryIntakeForm(){
 const [draft,setDraft]=useState<DraftInput>(empty); const [items,setItems]=useState<Draft[]>([]); const [message,setMessage]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))setItems(parsed)}}catch{setMessage("Saved browser data could not be read.")}},[]);
 const validHttpUrl=(value:string)=>{try{const url=new URL(value.trim());return url.protocol==="https:"||url.protocol==="http:"}catch{return false}};
 const primaryValid=validHttpUrl(draft.source1);
 const secondaryValid=!draft.source2.trim()||validHttpUrl(draft.source2);
 const duplicate=items.some(item=>item.headline.trim().toLocaleLowerCase()===draft.headline.trim().toLocaleLowerCase()||(item.source1&&draft.source1.trim()&&item.source1.trim().toLocaleLowerCase()===draft.source1.trim().toLocaleLowerCase()));
 const valid=draft.headline.trim().length>5&&draft.summary.trim().length>20&&primaryValid&&secondaryValid&&!duplicate;
 function change<K extends keyof typeof empty>(key:K,value:(typeof empty)[K]){setDraft(p=>({...p,[key]:value}));setMessage("")}
 function persist(next:Draft[]){setItems(next);try{localStorage.setItem(KEY,JSON.stringify(next));setMessage("Saved in this browser on this device. Not uploaded to a server.")}catch{setMessage("Browser storage is unavailable or full. Export your records as a backup.")}}
 function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!valid)return;const record:Draft={...draft,id:crypto.randomUUID(),createdAt:new Date().toISOString()};persist([record,...items]);setDraft(empty)}
 function exportData(){const blob=new Blob([JSON.stringify({project:"GLOBAL FUNN LIVE NEWS",exportedAt:new Date().toISOString(),drafts:items},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-newsroom-backup.json";a.click();URL.revokeObjectURL(url)}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:10,padding:"12px 13px",color:"#f8fafc",fontSize:14,outline:"none"};
 const label:React.CSSProperties={display:"block",fontSize:12,color:"#c5d3e5",marginBottom:7,fontWeight:700};
 return <div className="grid"><form className="wide panel" onSubmit={submit} style={{display:"grid",gap:16}}>
 <div className="rowline"><h2 style={{margin:0}}>New story submission</h2><span className="status warn">STARTS NOT VERIFIED</span></div>
 <div><label style={label}>Story headline *</label><input required minLength={6} style={field} value={draft.headline} onChange={e=>change("headline",e.target.value)} placeholder="Write a clear, factual headline"/></div>
 <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}><div><label style={label}>Editorial desk</label><select style={field} value={draft.desk} onChange={e=>change("desk",e.target.value)}><option>India</option><option>World</option><option>Regional</option><option>Business</option><option>Technology</option><option>Science</option><option>Sports</option></select></div><div><label style={label}>Location</label><input style={field} value={draft.location} onChange={e=>change("location",e.target.value)} placeholder="City / State / Country"/></div></div>
 <div><label style={label}>What is being reported? *</label><textarea required minLength={21} rows={5} style={{...field,resize:"vertical"}} value={draft.summary} onChange={e=>change("summary",e.target.value)} placeholder="Summarise only what the available evidence supports. Separate facts from claims."/></div>
 <div><label style={label}>Primary source URL *</label><input required type="url" style={field} value={draft.source1} onChange={e=>change("source1",e.target.value)} placeholder="https://..."/></div>
 <div><label style={label}>Independent corroborating source URL</label><input type="url" style={field} value={draft.source2} onChange={e=>change("source2",e.target.value)} placeholder="https://..."/></div>
 <div><label style={label}>Assigned editor</label><input style={field} value={draft.editor} onChange={e=>change("editor",e.target.value)} placeholder="Editor name"/></div>
 {duplicate&&<div className="proof" role="alert">Possible duplicate: a story with this headline or primary source already exists in this browser. Review the queue before submitting.</div>}
 <div className="proof">A source URL is a lead, not proof by itself. The editor must inspect the original material, check dates and context, and record a decision. No story is auto-confirmed or published.</div>
 <button disabled={!valid} type="submit" style={{border:0,borderRadius:10,padding:14,background:valid?"#d4af37":"#43536a",color:valid?"#071426":"#cbd5e1",fontWeight:900,cursor:valid?"pointer":"not-allowed"}}>Save story to this browser</button>
 {message&&<div className="proof" role="status">{message}</div>}
 </form><aside className="side panel"><h2>Saved local drafts ({items.length})</h2><p className="muted" style={{fontSize:12,lineHeight:1.6}}>Stored in this browser only. They are not yet synced between devices or uploaded to Dropbox / OneDrive. A duplicate headline or primary source is blocked to reduce accidental repeat entries.</p><button type="button" onClick={exportData} disabled={!items.length} style={{width:"100%",padding:12,borderRadius:9,border:"1px solid #d4af37",background:"transparent",color:"#f5d98c",fontWeight:800,cursor:items.length?"pointer":"not-allowed"}}>Export backup JSON</button><a href="/stories" style={{display:"block",marginTop:14,color:"#d4af37",fontWeight:800}}>Open story queue →</a><div className="proof"><strong>Backup reminder</strong><p style={{marginBottom:0}}>Export a JSON backup regularly until secure cloud storage is connected.</p></div></aside></div>;
}
