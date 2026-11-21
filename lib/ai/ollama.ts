const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "llama3.2:1b";
const REQUEST_TIMEOUT_MS = 30_000;

function getBaseUrl(): string {
  const raw = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const url = new URL(raw);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    throw new Error("Ollama must use a local HTTP address (127.0.0.1, localhost or ::1).");
  }
  return url.toString().replace(/\/$/, "");
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;
}

async function ollamaFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getBaseUrl()}${path}`;
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });
}

export async function checkOllamaHealth(): Promise<{ ok: boolean; model: string; error?: string }> {
  const model = getOllamaModel();
  try {
    const response = await ollamaFetch("/api/tags");
    if (!response.ok) return { ok: false, model, error: `Ollama returned HTTP ${response.status}` };
    const data: unknown = await response.json();
    const models = (data as { models?: Array<{ name?: string }> }).models ?? [];
    const installed = models.some((item) => item.name === model || item.name?.startsWith(`${model}:`));
    return installed
      ? { ok: true, model }
      : { ok: false, model, error: `Model ${model} is not installed. Run: ollama pull ${model}` };
  } catch {
    return { ok: false, model, error: "Ollama is unavailable. Start the Ollama app and try again." };
  }
}

export async function generateWithOllama(prompt: string): Promise<string> {
  const response = await ollamaFetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: getOllamaModel(), prompt, stream: false }),
  });
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
  const data: unknown = await response.json();
  const text = (data as { response?: unknown }).response;
  if (typeof text !== "string" || !text.trim()) throw new Error("Ollama returned an empty or invalid response.");
  return text;
}
