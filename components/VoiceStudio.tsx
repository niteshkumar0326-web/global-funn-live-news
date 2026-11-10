"use client";
import {useEffect,useMemo,useState} from "react";
type Word={id:string;term:string;spoken:string;note:string};
const KEY="global-funn-voice-studio-v1";
const languages=[{label:"English (India)",value:"en-IN"},{label:"Hindi (India)",value:"hi-IN"},{label:"English (US)",value:"en-US"},{label:"English (UK)",value:"en-GB"},{label:"Bengali (India)",value:"bn-IN"},{label:"Tamil (India)",value:"ta-IN"}];
export default function VoiceStudio(){
 const [title,setTitle]=useState("GLOBAL FUNN — News bulletin");
 const [script,setScript]=useState("");
 const [language,setLanguage]=useState("en-IN");
 const [rate,setRate]=useState(1);
 const [pitch,setPitch]=useState(1);
 const [volume,setVolume]=useState(1);
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const [voiceName,setVoiceName]=useState("");
 const [words,setWords]=useState<Word[]>([]);
 const [term,setTerm]=useState("");
 const [spoken,setSpoken]=useState("");
 const [note,setNote]=useState("");
 const [notice,setNotice]=useState("Write or paste an editor-approved script to prepare a voice-over.");
 const [supported,setSupported]=useState(false);
 useEffect(()=>{setSupported(typeof window!=="undefined"&&"speechSynthesis" in window);try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);setTitle(v.title||title);setScript(v.script||"");setLanguage(v.language||"en-IN");setRate(v.rate||1);setPitch(v.pitch||1);setVolume(v.volume??1);setWords(Array.isArray(v.words)?v.words:[]);}}catch{setNotice("Saved voice project could not be loaded.");}},[]);
 useEffect(()=>{if(!supported)return;const load=()=>setVoices(window.speechSynthesis.getVoices());load();window.speechSynthesis.addEventListener("voiceschanged",load);return()=>window.speechSynthesis.removeEventListener("voiceschanged",load);},[supported]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({title,script,language,rate,pitch,volume,words,updatedAt:new Date().toISOString()}));}catch{setNotice("Browser storage is full. Export your script and pronunciation list as backup.");}},[title,script,language,rate,pitch,volume,words]);
 const matching=useMemo(()=>voices.filter(v=>v.lang.toLowerCase().startsWith(language.toLowerCase().split("-")[0])),[voices,language]);
 const processed=useMemo(()=>words.reduce((text,w)=>w.term.trim()?text.replace(new RegExp(w.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),w.spoken):text,script),[script,words]);
 function addWord(){if(!term.trim()||!spoken.trim()){setNotice("Enter both the original term and its pronunciation spelling.");return;}setWords(v=>[...v,{id:crypto.randomUUID(),term:term.trim(),spoken:spoken.trim(),note}]);setTerm("");setSpoken("");setNote("");setNotice("Pronunciation rule added. Check the preview text before speaking.");}
 function speak(){if(!supported||!processed.trim()){setNotice("Speech preview is unavailable or the script is empty.");return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(processed);utterance.lang=language;utterance.rate=rate;utterance.pitch=pitch;utterance.volume=volume;const voice=voices.find(v=>v.name===voiceName)||matching[0];if(voice)utterance.voice=voice;utterance.onstart=()=>setNotice("Browser speech preview is playing. This is not a downloadable voice-over file.");utterance.onend=()=>setNotice("Preview finished. Review pronunciation and script before recording.");utterance.onerror=()=>setNotice("The browser could not play this speech preview.");window.speechSynthesis.speak(utterance);}
 function stop(){if(supported)window.speechSynthesis.cancel();setNotice("Speech preview stopped.");}
 function exportScript(){const content=title+"\nLanguage: "+language+"\n\nVOICE-OVER SCRIPT\n"+processed+"\n\nEDITORIAL NOTE: Confirm names, dates, numbers, pronunciation and source attribution before recording.";const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="global-funn-voiceover-script.txt";a.click();URL.revokeObjectURL(url);}
 function exportWords(){const csv=[["Original term","Pronunciation spelling","Notes"],...words.map(w=>[w.term,w.spoken,w.note])].map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(",")).join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="global-funn-pronunciation-guide.csv";a.click();URL.revokeObjectURL(url);}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const label:React.CSSProperties={display:"grid",gap:5,fontSize:12,color:"#c5d3e5"};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div className="grid">
 <section className="wide panel" style={{display:"grid",gap:13}}>
  <div className="rowline"><h2 style={{margin:0}}>Voice-over script desk</h2><span className="pill">BUILD 22</span></div>
  <label style={label}>Programme / script title<input style={field} value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/></label>
  <label style={label}>Voice-over script<textarea style={{...field,display:"block",lineHeight:1.7}} rows={13} maxLength={20000} value={script} onChange={e=>setScript(e.target.value)} placeholder="Paste your editor-reviewed presenter script here…"/></label>
  <div className="rowline" style={{flexWrap:"wrap"}}><span className="muted">{script.trim()?script.trim().split(/\s+/).length:0} words • approx. {Math.ceil((script.trim()?script.trim().split(/\s+/).length:0)/130)} min at 130 wpm</span><span className="pill">{language}</span></div>
  <div className="rowline" style={{flexWrap:"wrap"}}><button style={btn} type="button" onClick={exportScript}>Export voice script TXT</button><button style={btn} type="button" onClick={speak} disabled={!supported||!script.trim()}>▶ Preview voice</button><button style={btn} type="button" onClick={stop}>■ Stop preview</button></div>
  <div className="proof" role="status">{notice}</div>
  <div className="proof"><strong>Preview text after pronunciation rules</strong><p style={{whiteSpace:"pre-wrap",lineHeight:1.65,marginBottom:0}}>{processed||"Your adjusted script will appear here."}</p></div>
 </section>
 <aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
  <h2 style={{margin:0}}>Voice & pronunciation</h2>
  <label style={label}>Speech language<select style={field} value={language} onChange={e=>{setLanguage(e.target.value);setVoiceName("");}}>{languages.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}</select></label>
  <label style={label}>Available browser voice<select style={field} value={voiceName} onChange={e=>setVoiceName(e.target.value)}><option value="">Default available voice</option>{matching.map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang}){v.default?" • default":""}</option>)}</select></label>
  <div className="proof">Voice choices depend on the browser and device. If a language voice is missing, install/enable a compatible system voice or use a connected voice provider later.</div>
  <label style={label}>Speaking speed: {rate.toFixed(1)}×<input type="range" min=".6" max="1.4" step=".1" value={rate} onChange={e=>setRate(Number(e.target.value))}/></label>
  <label style={label}>Pitch: {pitch.toFixed(1)}<input type="range" min=".7" max="1.3" step=".1" value={pitch} onChange={e=>setPitch(Number(e.target.value))}/></label>
  <label style={label}>Volume: {Math.round(volume*100)}%<input type="range" min="0" max="1" step=".1" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label>
  <div className="divider"/>
  <h3 style={{margin:0}}>Pronunciation dictionary</h3>
  <p className="muted" style={{fontSize:12,lineHeight:1.5}}>Replace names, places and difficult terms in the preview text. Original script remains unchanged.</p>
  <label style={label}>Original word / name<input style={field} value={term} onChange={e=>setTerm(e.target.value)} placeholder="e.g. Dhanbad"/></label>
  <label style={label}>Say it like<input style={field} value={spoken} onChange={e=>setSpoken(e.target.value)} placeholder="e.g. Dhaan-baad"/></label>
  <label style={label}>Pronunciation note<input style={field} value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional editor note"/></label>
  <button type="button" style={btn} onClick={addWord}>Add pronunciation rule</button>
  <div className="rowline"><strong>Dictionary ({words.length})</strong><button type="button" style={btn} onClick={exportWords} disabled={!words.length}>Export CSV</button></div>
  {words.map(w=><article key={w.id} className="story"><div><strong>{w.term}</strong> → {w.spoken}</div>{w.note&&<div className="muted" style={{fontSize:11}}>{w.note}</div>}<button type="button" style={btn} onClick={()=>setWords(v=>v.filter(x=>x.id!==w.id))}>Remove rule</button></article>)}
 </aside>
 <section className="wide panel"><h2>Editorial voice checklist</h2><div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:9}}>{["Names and locations pronounced correctly","Numbers, dates and currency checked","Claims match approved evidence","Quotes and attributions retained","Hindi / English terms reviewed","Presenter and editor sign-off recorded"].map(item=><label key={item} className="proof" style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox"/><span>{item}</span></label>)}</div><p className="muted" style={{fontSize:11}}>Checklist selections are not saved and do not constitute editorial approval.</p></section>
 </div>;
}
