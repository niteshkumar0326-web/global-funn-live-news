import { ReaderShell } from "@/components/reader";

export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ReaderShell>
      <article>
        <h1>{title}</h1>
        {children}
      </article>
    </ReaderShell>
  );
}
