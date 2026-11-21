import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/content/articles";
import { Body, ReaderShell, formatDate } from "@/components/reader";
import { AdSlot, AffiliateDisclosure } from "@/components/monetization";

const SITE = "https://news.globalfunn.in";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return {
    title: `${a.title} | GLOBAL FUNN`,
    description: a.description,
    alternates: { canonical: `/khabar/${a.slug}` },
    openGraph: { title: a.title, description: a.description, type: "article", locale: "hi_IN",
      publishedTime: a.published, modifiedTime: a.updated ?? a.published, url: `${SITE}/khabar/${a.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const hasProducts = a.body.some((b) => b.type === "product");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": a.category === "टेक" ? "NewsArticle" : "Article",
    headline: a.title,
    description: a.description,
    inLanguage: "hi-IN",
    datePublished: a.published,
    dateModified: a.updated ?? a.published,
    mainEntityOfPage: `${SITE}/khabar/${a.slug}`,
    author: { "@type": "Person", name: "नितेश कुमार", alternateName: "Nitesh Kumar", url: `${SITE}/author/nitesh-kumar` },
    publisher: { "@type": "Organization", name: "GLOBAL FUNN" },
    citation: a.sources.map((s) => s.url),
  };
  return (
    <ReaderShell>
      <article>
        <span className="tag">{a.category}</span>
        <h1>{a.title}</h1>
        <p className="muted">
          लेखक: <a href="/author/nitesh-kumar">नितेश कुमार</a> • प्रकाशित: {formatDate(a.published)}
          {a.updated && a.updated !== a.published ? ` • अपडेट: ${formatDate(a.updated)}` : ""}
        </p>
        {hasProducts ? <AffiliateDisclosure /> : null}
        <Body blocks={a.body} />
        {a.youtube ? (
          <p className="reader-note">
            वीडियो देखें: <a href={a.youtube} target="_blank" rel="noopener">YouTube पर ↗</a>
          </p>
        ) : null}
        <AdSlot />
        <section className="reader-sources">
          <h2>स्रोत</h2>
          <ul>
            {a.sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener nofollow">{s.name}</a></li>
            ))}
          </ul>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </ReaderShell>
  );
}
