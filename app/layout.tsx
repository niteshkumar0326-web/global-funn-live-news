import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ADSENSE_CLIENT } from "@/components/monetization";

export const metadata: Metadata = {
  metadataBase: new URL("https://news.globalfunn.in"),
  title: "GLOBAL FUNN LIVE NEWS",
  description: "India • World • Beyond — Khabar Har Pal, Nazar Global.",
};

const adsenseOn = /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {adsenseOn ? (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        ) : null}
      </body>
    </html>
  );
}
