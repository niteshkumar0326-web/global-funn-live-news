// Finds what the /live page should play: the Live News channel's active broadcast,
// then its newest upload, then the main GLOBAL FUNN channel as a clearly labelled backup.
export const CHANNEL_ID = "UCmcZKg3Ab7N2yGsshxrqtgQ"; // GLOBAL FUNN Live News
export const CHANNEL_URL = "https://www.youtube.com/@GLOBALFUNNLiveNews";
export const MAIN_CHANNEL_ID = "UCLXPISTr2HJnusqycn4Wyog"; // GLOBAL FUNN main channel
export const MAIN_CHANNEL_URL = "https://www.youtube.com/@niteshkumar0326";
export const FALLBACK_VIDEO_ID = "lWrQ_QqjGlc";

export type ChannelVideo = {
  videoId: string;
  title: string | null;
  published: string | null;
  isLive: boolean;
  source: "live" | "feed" | "main-fallback" | "fallback";
};

const VIDEO_ID = /^[\w-]{11}$/;
const TIMEOUT_MS = 6000;

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "accept-language": "en-US,en;q=0.9", "user-agent": "Mozilla/5.0 (GlobalFunnNews)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 120 },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// A channel's /live URL resolves to the active broadcast while one is on air.
export function parseLivePage(html: string): string | null {
  if (!/"isLiveNow":true/.test(html)) return null;
  const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
  const id = canonical?.[1] ?? html.match(/"videoDetails":\{"videoId":"([\w-]{11})"/)?.[1];
  return id && VIDEO_ID.test(id) ? id : null;
}

export function parseLatestFromFeed(xml: string): Omit<ChannelVideo, "isLive" | "source"> | null {
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) return null;
  const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
  if (!id) return null;
  const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
  return { videoId: id, title: title ? decodeXml(title.trim()) : null, published: published ?? null };
}

export async function getChannelVideo(): Promise<ChannelVideo> {
  const liveHtml = await fetchText("https://www.youtube.com/channel/" + CHANNEL_ID + "/live");
  const liveId = liveHtml ? parseLivePage(liveHtml) : null;
  if (liveId) return { videoId: liveId, title: null, published: null, isLive: true, source: "live" };

  const liveNewsFeed = await fetchText("https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID);
  const liveNewsLatest = liveNewsFeed ? parseLatestFromFeed(liveNewsFeed) : null;
  if (liveNewsLatest) return { ...liveNewsLatest, isLive: false, source: "feed" };

  const mainFeed = await fetchText("https://www.youtube.com/feeds/videos.xml?channel_id=" + MAIN_CHANNEL_ID);
  const mainLatest = mainFeed ? parseLatestFromFeed(mainFeed) : null;
  if (mainLatest) return { ...mainLatest, isLive: false, source: "main-fallback" };

  return { videoId: FALLBACK_VIDEO_ID, title: null, published: null, isLive: false, source: "fallback" };
}
