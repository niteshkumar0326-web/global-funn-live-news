import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/articles";

const SITE = "https://news.globalfunn.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/khabar", "/live", "/about", "/author/nitesh-kumar", "/contact", "/privacy", "/affiliate-disclosure"].map((p) => ({
    url: SITE + p, changeFrequency: "daily" as const, priority: p === "/khabar" ? 1 : 0.5,
  }));
  const articles = ARTICLES.map((a) => ({
    url: `${SITE}/khabar/${a.slug}`, lastModified: a.updated ?? a.published, changeFrequency: "weekly" as const, priority: 0.8,
  }));
  return [...pages, ...articles];
}
