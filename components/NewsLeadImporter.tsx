"use client";

import { useState } from "react";

const STORAGE_KEY = "global-funn-newsroom-drafts-v1";
type Lead = { lead_id?:string; headline?:string; category?:string; feed_source?:string; feed_published?:string; lead_url?:string; feed_summary_unverified?:string };
type QueueFile = { brand?:string; created_at_utc?:string; items?:Lead[] };

function validHttpUrl(value:string){try{const u=new URL(value);return (u.protocol==="https:"||u.protocol==="http:")&&!!u.hostname;}catch{return false;}}
function safeText(value:unknown,fallback="",limit=2000){return typeof value==="string"?value.trim().slice(0,limit):fallback;}

export default function NewsLeadImporter(){
 const [message,setMessage]=useState("");
 const [preview,setPreview]=useState<Lead[]>([]);
 const [fileName,setFileName]=useState("");
 const [busy,setBusy]=useState(false);
 async function inspect(file?:File){
  setMessage("");setPreview([]);setFileName("");
  if(!file)return;
  if(file.size>5*1024*1024){setMessage("Queue file is larger than 5 MB.");return;}
  try{
   const parsed=JSON.parse(await file.text()) as QueueFile;
   if(parsed?.brand!=="GLOBAL FUNN"||!Array.isArray(parsed.items))throw new Error("Choose the GLOBAL FUNN review_queue.json file.");
   if(parsed.items.length>500)throw new Error("Queue contains more than 500 items. Split it into smaller review batches.");
   const valid=parsed.items.filter((x):x is Lead=>!!x&&typeof x.headline==="string"&&x.headline.trim().length>0&&typeof x.lead_url==="string"&&validHttpUrl(x.lead_url));
   if(!valid.length)throw new Error("No leads with a headline and valid HTTP(S) source link were found.");
   setPreview(valid);setFileName(file.name);setMessage(valid.length+" valid leads found. Review the preview, then import them as unverified drafts.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not read this review queue.");}
 }
 function importLeads(){
  setBusy(true);
  try{
   const currentRaw=localStorage.getItem(STORAGE_KEY);
   const current=currentRaw?JSON.parse(currentRaw):[];
   if(!Array.isArray(current))throw new Error("Existing story queue is not a valid list. Export a backup before changing it.");
   const seen=new Set(current.map((s:any)=>String(s?.source1||"").trim().toLowerCase()).filter(Boolean));
   const now=new Date().toISOString();
   const added:any[]=[];
   for(const x of preview){
    const source=x.lead_url!.trim();
    const dedupeKey=source.toLowerCase();
    if(seen.has(dedupeKey))continue;
    seen.add(dedupeKey);
    added.push({
     id:crypto.randomUUID(),headline:safeText(x.headline,"",300),desk:safeText(x.category,"News",80)||"News",
     location:"",summary:safeText(x.feed_summary_unverified,"",2000),
     source1:source,source2:"",status:"Not Verified",editor:"",createdAt:now,
     workflowState:"Draft",workflowHistory:[],
     rssLead:{source:safeText(x.feed_source,"Unknown feed",160)||"Unknown feed",published:safeText(x.feed_published,"",80),leadId:safeText(x.lead_id,"",80),importedAt:now}
    });
   }
   if(!added.length){setMessage("All selected leads already exist in this browser's local queue (matched by source URL).");return;}
   localStorage.setItem(STORAGE_KEY,JSON.stringify([...added,...current]));
   setMessage(added.length+" unique unverified lead(s) imported into this browser's Story Queue. Open /stories to review. No story was approved or published.");
   setPreview([]);setFileName("");
  }catch(e){setMessage(e instanceof Error?e.message:"Import failed. Existing queue was not intentionally replaced.");}
  finally{setBusy(false);}
 }
 const box:React.CSSProperties={border:"1px solid #29415f",borderRadius:14,padding:16,background:"#0a1727",marginTop:18};
 return <section style={box}>
  <div style={{color:"#d6a84f",fontSize:11,fontWeight:900,letterSpacing:1.5}}>AUTOMATED COLLECTION → HUMAN REVIEW</div>
  <h2 style={{fontSize:21,margin:"8px 0"}}>Import scheduled RSS leads</h2>
  <p style={{fontSize:12,color:"#cbd5e1",lineHeight:1.7}}>Download the <strong>review_queue.json</strong> artifact from the GitHub Actions run, then import it here. Leads are added as Not Verified / Draft and remain local to this browser.</p>
  <input type="file" accept=".json,application/json" onChange={e=>inspect(e.target.files?.[0])} style={{display:"block",maxWidth:"100%",fontSize:12,color:"#e2e8f0",marginTop:12}}/>
  {fileName&&<p style={{fontSize:11,color:"#94a3b8"}}>Selected: {fileName}</p>}
  {preview.length>0&&<div style={{marginTop:14}}>
   <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>Preview — {preview.length} valid lead(s)</div>
   <div style={{display:"grid",gap:8,maxHeight:280,overflowY:"auto"}}>{preview.slice(0,12).map((x,i)=><article key={x.lead_id||x.lead_url||i} style={{border:"1px solid #29415f",borderRadius:9,padding:10}}><div style={{fontSize:12,fontWeight:800}}>{x.headline}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>{x.feed_source||"Feed"} • {x.category||"Uncategorised"} • NOT VERIFIED</div><a href={x.lead_url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#f0c879",overflowWrap:"anywhere"}}>{x.lead_url}</a></article>)}</div>
   {preview.length>12&&<p style={{fontSize:10,color:"#94a3b8"}}>Showing first 12; all {preview.length} valid leads will be imported, with duplicate URLs skipped.</p>}
   <button type="button" disabled={busy} onClick={importLeads} style={{marginTop:12,border:0,borderRadius:9,padding:"10px 14px",background:"#d6a84f",color:"#111827",fontWeight:900,cursor:"pointer"}}>{busy?"Importing…":"Import as unverified drafts"}</button>
  </div>}
  {message&&<p role="status" style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6,marginBottom:0}}>{message}</p>}
  <p style={{fontSize:10,color:"#94a3b8",lineHeight:1.6,marginBottom:0}}>Duplicate source URLs are skipped both against saved stories and within this import. Import does not approve claims, publish stories, or trigger narration, video rendering, upload or livestream.</p>
 </section>;
}
