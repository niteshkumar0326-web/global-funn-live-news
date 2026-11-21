export type Lead = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  source: string;
  published: string;
};
export type FeedFailure = { source: string; error: string };
export function normalizeLead(value: unknown, index: number): Lead | null;
export function parseNewsBrief(value: unknown): {
  items: Lead[];
  feedFailures: FeedFailure[];
  generatedAtUtc: string;
  sourceItemCount: number;
};
