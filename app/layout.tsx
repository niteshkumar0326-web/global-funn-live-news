import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "GLOBAL FUNN LIVE NEWS", description: "India • World • Beyond — Khabar Har Pal, Nazar Global." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
