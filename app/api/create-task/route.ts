import { NextRequest, NextResponse } from "next/server";
import { createImageTask, createVideoTask, type ImageModel } from "@/lib/kieai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: "image" | "video";
      prompt: string;
      aspectRatio?: "1:1" | "9:16" | "16:9";
      imageUrl?: string;
      preferModel?: ImageModel;
    };

    let taskId: string;

    if (body.type === "video") {
      if (!body.imageUrl) {
        return NextResponse.json({ error: "imageUrl required for video" }, { status: 400 });
      }
      taskId = await createVideoTask(body.prompt, body.imageUrl);
    } else {
      taskId = await createImageTask(body.prompt, body.aspectRatio ?? "1:1", "2K", body.preferModel);
    }

    return NextResponse.json({ taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-task]", message);
    const status = message.includes("402") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
