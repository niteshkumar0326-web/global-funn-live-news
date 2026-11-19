import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { ARTICLES } from "@/content/articles";

export const metadata: Metadata = { title: "नितेश कुमार, संपादक | GLOBAL FUNN", alternates: { canonical: "/author/nitesh-kumar" } };

export default function Author() {
  return (
    <StaticPage title="नितेश कुमार">
      <p className="muted">संस्थापक व संपादक, GLOBAL FUNN</p>
      <p>नितेश कुमार झारखंड से GLOBAL FUNN चलाते हैं: हिंदी में टेक लॉन्च, त्योहार और भक्ति से जुड़ी जानकारी। हर लेख वे ख़ुद जाँचते हैं, स्रोत नीचे देते हैं, और जो बात आधिकारिक नहीं है उसे साफ़ लिखते हैं।</p>
      <h2>लेख</h2>
      <ul>
        {ARTICLES.map((a) => (
          <li key={a.slug}><a href={`/khabar/${a.slug}`}>{a.title}</a></li>
        ))}
      </ul>
      <p>YouTube: <a href="https://www.youtube.com/@niteshkumar0326">GLOBAL FUNN</a></p>
    </StaticPage>
  );
}
