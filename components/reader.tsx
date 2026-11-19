import type { Block } from "@/content/articles";
import { ProductLink } from "@/components/monetization";

export function ReaderShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="reader" lang="hi">
      <header className="reader-top">
        <a href="/khabar" className="reader-brand">GLOBAL FUNN <span className="gold">ख़बरें व गाइड</span></a>
        <nav className="reader-nav">
          <a href="/live">▶ लाइव / वीडियो</a>
          <a href="/about">हमारे बारे में</a>
        </nav>
      </header>
      {children}
      <footer className="reader-foot">
        <span>© {new Date().getFullYear()} GLOBAL FUNN</span>
        <nav>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/affiliate-disclosure">Affiliate disclosure</a>
          <a href="/archive">Corrections</a>
        </nav>
      </footer>
    </main>
  );
}

export function Body({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "list":
            return <ul key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>;
          case "note":
            return <p key={i} className="reader-note">{b.text}</p>;
          case "product":
            return <ProductLink key={i} name={b.name} query={b.query} note={b.note} />;
          case "table":
            return (
              <div key={i} className="reader-table">
                <table>
                  <thead><tr>{b.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00+05:30").toLocaleDateString("hi-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" });
}
