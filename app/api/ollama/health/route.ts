import { NextResponse } from "next/server";
import { checkOllamaHealth } from "@/lib/ai/ollama";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.OLLAMA_ENABLED !== "true") {
    return NextResponse.json({ ok: false, enabled: false, error: "Local AI is disabled." }, { status: 200 });
  }
  const health = await checkOllamaHealth();
  return NextResponse.json({ ...health, enabled: true }, { status: health.ok ? 200 : 503 });
}
