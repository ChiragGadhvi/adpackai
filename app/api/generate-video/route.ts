import { NextRequest, NextResponse } from "next/server";
import { createVideoTask } from "@/lib/kieai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoPrompt, imageUrl } = body as {
      videoPrompt: string;
      imageUrl: string;
    };

    if (!videoPrompt || !imageUrl) {
      return NextResponse.json({ error: "Missing videoPrompt or imageUrl" }, { status: 400 });
    }

    const taskId = await createVideoTask(videoPrompt, imageUrl);
    return NextResponse.json({ taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-video]", message);
    const status = message.includes("402") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
