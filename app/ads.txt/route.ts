// Serves /ads.txt for Google AdSense once NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-...) is set in Vercel.
export const dynamic = "force-static";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const m = /^ca-(pub-\d{10,20})$/.exec(client);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${m[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
