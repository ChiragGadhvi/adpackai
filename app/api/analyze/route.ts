import { NextRequest, NextResponse } from "next/server";
import { analyzeProductImage, generatePrompts, generateAdScript } from "@/lib/openrouter";
import type { Vibe } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType, vibe } = body as {
      image: string;
      mimeType: string;
      vibe: Vibe;
    };

    if (!image || !mimeType) {
      return NextResponse.json({ error: "Missing image or mimeType" }, { status: 400 });
    }

    const analysis = await analyzeProductImage(image, mimeType);
    const prompts = await generatePrompts(analysis, vibe ?? "Home");
    const adScript = await generateAdScript(analysis, vibe ?? "Home");

    return NextResponse.json({ analysis, ...prompts, adScript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
