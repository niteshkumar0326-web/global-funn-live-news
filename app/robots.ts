import type { MetadataRoute } from "next";

// Public reader pages are indexable; the internal newsroom tools are not.
export default function robots(): MetadataRoute.Robots {
  const internal = ["/ai-context", "/assignments", "/backup", "/broadcast", "/cloud", "/graphics", "/international",
    "/media", "/performance", "/presenter", "/presenter-scenes", "/production", "/regional-desks", "/reporter-dsr",
    "/research", "/scripts", "/shift-handover", "/stories", "/story-intake", "/storyboard", "/token-benchmark",
    "/verification", "/video-studio", "/voice-studio"];
  return { rules: [{ userAgent: "*", allow: "/", disallow: internal }], sitemap: "https://news.globalfunn.in/sitemap.xml" };
}
