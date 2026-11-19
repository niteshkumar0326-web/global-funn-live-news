import type { Metadata } from "next";
import { ARTICLES } from "@/content/articles";
import { ReaderShell, formatDate } from "@/components/reader";
import { AdSlot } from "@/components/monetization";

export const metadata: Metadata = {
  title: "ख़बरें व गाइड | GLOBAL FUNN",
  description: "टेक लॉन्च, त्योहार, भक्ति और ज़रूरी जानकारी: स्रोतों के साथ, सरल हिंदी में।",
  alternates: { canonical: "/khabar" },
};

export default function KhabarIndex() {
  const list = [...ARTICLES].sort((a, b) => (a.published < b.published ? 1 : -1));
  return (
    <ReaderShell>
      <h1>ख़बरें व गाइड</h1>
      <p className="muted">हर लेख के नीचे उसके स्रोत दिए हैं। ग़लती दिखे तो हमें बताएँ: सुधार सार्वजनिक रूप से दर्ज होते हैं।</p>
      <div className="reader-list">
        {list.map((a) => (
          <a key={a.slug} href={`/khabar/${a.slug}`} className="reader-card">
            <span className="tag">{a.category}</span>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <span className="muted">{formatDate(a.updated ?? a.published)}</span>
          </a>
        ))}
      </div>
      <AdSlot />
    </ReaderShell>
  );
}
