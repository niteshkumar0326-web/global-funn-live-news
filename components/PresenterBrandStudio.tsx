"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  name: string;
  role: string;
  channel: string;
  tagline: string;
  location: string;
  photo: string;
  layout: "lower-third" | "portrait" | "avatar";
};

const KEY = "global-funn-presenter-brand-v1";
const defaults: Profile = {
  name: "Presenter Name",
  role: "News Presenter",
  channel: "GLOBAL FUNN",
  tagline: "Khabar Har Pal, Nazar Global",
  location: "India",
  photo: "",
  layout: "lower-third",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#08182c", border: "1px solid #355071",
  borderRadius: 9, padding: "10px 12px", color: "#f8fafc", fontSize: 13,
};
const labelStyle: React.CSSProperties = { display: "grid", gap: 5, fontSize: 12, color: "#c5d3e5" };
const buttonStyle: React.CSSProperties = {
  border: "1px solid #d4af37", borderRadius: 8, padding: "9px 12px",
  background: "#10233d", color: "#f5d98c", fontSize: 12, fontWeight: 800, cursor: "pointer",
};

function safeText(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char] || char);
}

export default function PresenterBrandStudio() {
  const [profile, setProfile] = useState<Profile>(defaults);
  const [notice, setNotice] = useState("Add your own approved presenter photo to personalise the preview.");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setProfile({ ...defaults, ...JSON.parse(stored) });
    } catch {
      setNotice("Saved profile could not be read. You can create a new one.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const { photo, ...textOnly } = profile;
      localStorage.setItem(KEY, JSON.stringify({ ...textOnly, photo }));
      setNotice("Profile saved in this browser only.");
    } catch {
      setNotice("Browser storage is full. Remove the photo or use a smaller image.");
    }
  }, [profile, ready]);

  const update = <K extends keyof Profile,>(key: K, value: Profile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file (JPG, PNG or WebP).");
      event.target.value = "";
      return;
    }
    if (file.size > 900 * 1024) {
      setNotice("For this browser-local profile, choose an image under 900 KB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((current) => ({ ...current, photo: reader.result as string }));
        setNotice("Your selected photo is now shown in the preview. Check permission before use.");
      }
    };
    reader.onerror = () => setNotice("Could not read this image.");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function exportSvg() {
    const { name, role, channel, tagline, location, photo, layout } = profile;
    const portrait = layout === "portrait";
    const avatar = layout === "avatar";
    const width = avatar ? 1080 : portrait ? 1080 : 1920;
    const height = avatar ? 1080 : portrait ? 1920 : 1080;
    const image = photo
      ? (avatar
        ? `<image href="${photo}" x="340" y="90" width="400" height="400" preserveAspectRatio="xMidYMid slice" clip-path="url(#circle)"/>`
        : portrait
          ? `<image href="${photo}" x="250" y="220" width="580" height="760" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`
          : `<image href="${photo}" x="90" y="190" width="520" height="700" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`)
      : "";
    const titleX = avatar ? 540 : portrait ? 540 : 700;
    const titleY = avatar ? 620 : portrait ? 1120 : 520;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#071426"/><stop offset="1" stop-color="#15375b"/></linearGradient><clipPath id="photoClip"><rect x="${portrait ? 250 : 90}" y="${portrait ? 220 : 190}" width="${portrait ? 580 : 520}" height="${portrait ? 760 : 700}" rx="32"/></clipPath><clipPath id="circle"><circle cx="540" cy="290" r="200"/></clipPath></defs>
<rect width="100%" height="100%" fill="url(#bg)"/><path d="M0 ${height-150} H${width} V${height} H0Z" fill="#07101e"/><rect x="45" y="45" width="${width-90}" height="${height-90}" rx="34" fill="none" stroke="#d4af37" stroke-opacity=".65" stroke-width="4"/>
${image}
<text x="${titleX}" y="${titleY}" text-anchor="${avatar ? "middle" : "start"}" fill="#f7d98a" font-family="Arial,sans-serif" font-size="${avatar ? 46 : 42}" font-weight="700">${safeText(channel.toUpperCase())}</text>
<text x="${titleX}" y="${titleY+82}" text-anchor="${avatar ? "middle" : "start"}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${avatar ? 66 : 68}" font-weight="700">${safeText(name || "Presenter Name")}</text>
<text x="${titleX}" y="${titleY+140}" text-anchor="${avatar ? "middle" : "start"}" fill="#cbd5e1" font-family="Arial,sans-serif" font-size="34">${safeText(role)} • ${safeText(location)}</text>
<text x="${width/2}" y="${height-80}" text-anchor="middle" fill="#f7d98a" font-family="Arial,sans-serif" font-size="28">${safeText(tagline)}</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `global-funn-${layout}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("SVG layout exported. Review text, image rights and visual cropping before broadcast.");
  }

  const layoutName = useMemo(() => ({
    "lower-third": "Landscape broadcast",
    portrait: "Vertical presenter card",
    avatar: "Square channel identity",
  }[profile.layout]), [profile.layout]);

  return <div className="grid">
    <section className="wide panel" style={{ display: "grid", gap: 14 }}>
      <div className="rowline"><h2 style={{ margin: 0 }}>Presenter identity</h2><span className="pill">BUILD 18</span></div>
      <div className="proof">This studio uses only the photo you select. It does not invent, face-swap or automatically identify anyone. Your profile is saved in this browser; no image is uploaded to GitHub or a server.</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={labelStyle}>Presenter display name<input style={inputStyle} value={profile.name} onChange={e => update("name", e.target.value)} maxLength={60}/></label>
        <label style={labelStyle}>On-screen role<input style={inputStyle} value={profile.role} onChange={e => update("role", e.target.value)} maxLength={60}/></label>
        <label style={labelStyle}>Channel name<input style={inputStyle} value={profile.channel} onChange={e => update("channel", e.target.value)} maxLength={50}/></label>
        <label style={labelStyle}>Location / desk<input style={inputStyle} value={profile.location} onChange={e => update("location", e.target.value)} maxLength={50}/></label>
      </div>
      <label style={labelStyle}>Channel tagline<input style={inputStyle} value={profile.tagline} onChange={e => update("tagline", e.target.value)} maxLength={90}/></label>
      <label style={labelStyle}>Your presenter photo<input style={{ ...inputStyle, padding: 8 }} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto}/><span className="muted">JPG, PNG or WebP • maximum 900 KB • use a photo you own or have permission to use.</span></label>
      {profile.photo && <div className="rowline" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}><img src={profile.photo} alt="Selected presenter preview" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 12, border: "1px solid #d4af37" }}/><button type="button" style={buttonStyle} onClick={() => setProfile(current => ({ ...current, photo: "" }))}>Remove photo</button></div>}
      <label style={labelStyle}>Layout<select style={inputStyle} value={profile.layout} onChange={e => update("layout", e.target.value as Profile["layout"])}><option value="lower-third">Landscape broadcast (16:9)</option><option value="portrait">Vertical presenter card (9:16)</option><option value="avatar">Square channel identity (1:1)</option></select></label>
      <div className="rowline" style={{ flexWrap: "wrap" }}><strong>{layoutName}</strong><button type="button" style={buttonStyle} onClick={exportSvg}>Export editable SVG</button></div>
      <div className="proof" role="status">{notice}</div>
    </section>
    <aside className="side panel" style={{ display: "grid", alignContent: "start", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Live brand preview</h2>
      <div style={{ aspectRatio: profile.layout === "portrait" ? "9/16" : "16/9", background: "linear-gradient(135deg,#071426,#15375b)", border: "1px solid #d4af37", borderRadius: 14, padding: 14, display: "flex", flexDirection: profile.layout === "avatar" ? "column" : "row", alignItems: "center", justifyContent: "center", gap: 12, overflow: "hidden", textAlign: profile.layout === "avatar" ? "center" : "left" }}>
        {profile.photo ? <img src={profile.photo} alt="Presenter" style={{ width: profile.layout === "avatar" ? "46%" : profile.layout === "portrait" ? "78%" : "38%", maxHeight: profile.layout === "portrait" ? "55%" : "90%", aspectRatio: "1", objectFit: "cover", borderRadius: profile.layout === "avatar" ? "50%" : 12, border: "2px solid #d4af37" }}/> : <div style={{ width: profile.layout === "avatar" ? "42%" : "32%", aspectRatio: "1", borderRadius: profile.layout === "avatar" ? "50%" : 12, border: "1px dashed #d4af37", display: "grid", placeItems: "center", color: "#f7d98a", fontSize: 11, textAlign: "center", padding: 8 }}>YOUR PHOTO</div>}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#f7d98a", fontSize: 10, fontWeight: 900, letterSpacing: 1.5 }}>{profile.channel || "GLOBAL FUNN"}</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: profile.layout === "avatar" ? 18 : 15, overflowWrap: "anywhere" }}>{profile.name || "Presenter Name"}</div>
          <div style={{ color: "#cbd5e1", fontSize: 10 }}>{profile.role} • {profile.location}</div>
          <div style={{ color: "#f7d98a", fontSize: 9, marginTop: 7 }}>{profile.tagline}</div>
        </div>
      </div>
      <div className="proof"><strong>Before broadcast</strong><ul style={{ paddingLeft: 18, lineHeight: 1.8, marginBottom: 0 }}><li>Confirm presenter identity and consent</li><li>Check photo rights and current appearance</li><li>Review crop, text and spelling</li><li>Use approved brand assets only</li></ul></div>
      <div className="proof">SVG export is a static design file. This module does not create a talking avatar, generate a video, record a presenter or publish to social platforms.</div>
    </aside>
  </div>;
}
