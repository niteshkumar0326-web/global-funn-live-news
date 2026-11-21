import { NextRequest, NextResponse } from "next/server";
import { generateWithOllama } from "@/lib/ai/ollama";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (process.env.OLLAMA_ENABLED !== "true") {
    return NextResponse.json({ error: "Local AI is disabled." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const prompt = (body as { prompt?: unknown })?.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 8000) {
    return NextResponse.json({ error: "Provide a prompt between 1 and 8000 characters." }, { status: 400 });
  }

  try {
    const response = await generateWithOllama(prompt.trim());
    return NextResponse.json({ response, provider: "ollama-local", draftOnly: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Local AI request failed.";
    const timeout = message.toLowerCase().includes("timeout");
    return NextResponse.json(
      { error: message, retryable: true },
      { status: timeout ? 504 : 503 },
    );
  }
}
