// Affiliate links and ad slots. Both stay switched off until the owner sets the IDs
// in Vercel environment variables, so nothing earns (or breaks) by accident:
//   NEXT_PUBLIC_AMAZON_TAG       Amazon Associates India tracking ID, e.g. globalfunn-21
//   NEXT_PUBLIC_ADSENSE_CLIENT   AdSense publisher ID, e.g. ca-pub-1234567890123456
//   NEXT_PUBLIC_ADSENSE_SLOT     optional display ad slot ID

export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG?.trim() || "";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim() || "";

export function amazonSearchUrl(query: string): string | null {
  if (!/^[a-z0-9-]{3,40}-21$/i.test(AMAZON_TAG)) return null;
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(AMAZON_TAG)}`;
}

export function ProductLink({ name, query, note }: { name: string; query: string; note?: string }) {
  const url = amazonSearchUrl(query);
  if (!url) return null;
  return (
    <p className="reader-product">
      <a href={url} target="_blank" rel="sponsored nofollow noopener">
        {name}: Amazon पर देखें ↗
      </a>
      {note ? <span className="muted"> ({note})</span> : null}
    </p>
  );
}

export function AffiliateDisclosure() {
  if (!amazonSearchUrl("x")) return null;
  return (
    <p className="reader-note">
      इस पेज के कुछ लिंक affiliate लिंक हैं: इनसे ख़रीदारी पर GLOBAL FUNN को छोटा कमीशन मिल सकता है, आपकी कीमत नहीं बदलती।{" "}
      <a href="/affiliate-disclosure">और जानें</a>
    </p>
  );
}

export function AdSlot() {
  if (!/^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT) || !/^\d{6,12}$/.test(ADSENSE_SLOT)) return null;
  return (
    <div className="reader-ad">
      <span className="muted" style={{ fontSize: 12 }}>विज्ञापन</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle=window.adsbygoogle||[]).push({});" }} />
    </div>
  );
}
