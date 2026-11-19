import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "Privacy policy | GLOBAL FUNN", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <StaticPage title="Privacy policy / गोपनीयता नीति">
      <p className="muted">Last updated: 19 November 2026</p>
      <p>news.globalfunn.in does not ask you to create an account and does not collect your name, phone number or email unless you contact us yourself.</p>
      <h2>Advertising and cookies</h2>
      <p>This site may show ads from Google AdSense. Google and its partners use cookies to serve ads based on your previous visits to this and other websites. You can opt out of personalised advertising at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>, and learn how Google uses data at <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">policies.google.com/technologies/partner-sites</a>.</p>
      <h2>Affiliate links</h2>
      <p>Some pages contain affiliate links (for example Amazon.in). If you click one, the shop may set its own cookies to credit the referral. See our <a href="/affiliate-disclosure">affiliate disclosure</a>.</p>
      <h2>Embedded videos</h2>
      <p>Videos are embedded with YouTube's privacy-enhanced mode (youtube-nocookie.com). YouTube's own privacy policy applies when you play them.</p>
      <h2>Hosting logs</h2>
      <p>Our host (Vercel) keeps standard server logs, such as IP address and pages requested, for security and reliability.</p>
      <h2>Contact</h2>
      <p>Questions about this policy: see the <a href="/contact">contact page</a>.</p>
      <h2>हिंदी सारांश</h2>
      <p>यह साइट आपसे खाता नहीं बनवाती और आपकी निजी जानकारी नहीं माँगती। विज्ञापन (Google AdSense) और affiliate लिंक cookies का इस्तेमाल कर सकते हैं; आप Google Ads Settings में व्यक्तिगत विज्ञापन बंद कर सकते हैं।</p>
    </StaticPage>
  );
}
