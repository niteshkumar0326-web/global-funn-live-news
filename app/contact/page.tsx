import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "संपर्क | GLOBAL FUNN", alternates: { canonical: "/contact" } };

// Set NEXT_PUBLIC_CONTACT_EMAIL in Vercel to show a contact email on this page.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export default function Contact() {
  return (
    <StaticPage title="संपर्क करें">
      <p>सुधार, सुझाव, विज्ञापन या साझेदारी के लिए हमसे संपर्क करें।</p>
      {EMAIL ? (
        <p>ईमेल: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      ) : (
        <p>YouTube पर संदेश भेजें: <a href="https://www.youtube.com/@niteshkumar0326">GLOBAL FUNN</a></p>
      )}
      <p className="reader-note">ग़लती की रिपोर्ट में लेख का लिंक और सही जानकारी का स्रोत ज़रूर दें।</p>
    </StaticPage>
  );
}
