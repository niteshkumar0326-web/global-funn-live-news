import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "Affiliate disclosure | GLOBAL FUNN", alternates: { canonical: "/affiliate-disclosure" } };

export default function AffiliateDisclosurePage() {
  return (
    <StaticPage title="Affiliate disclosure">
      <p>GLOBAL FUNN के कुछ लेखों में affiliate लिंक हो सकते हैं। ऐसे लिंक से ख़रीदारी करने पर हमें छोटा कमीशन मिल सकता है; आपकी कीमत नहीं बदलती। affiliate लिंक वाले लेख में यह बात ऊपर लिखी जाती है।</p>
      <p>GLOBAL FUNN is a participant in the Amazon Associates programme (once approved), an affiliate advertising programme designed to provide a means for sites to earn fees by linking to Amazon.in. As an Amazon Associate we earn from qualifying purchases.</p>
      <p>Product information and prices change; check the seller's page before buying. We do not accept payment to change our reviews, and we do not promote investment, trading or other financial products.</p>
    </StaticPage>
  );
}
