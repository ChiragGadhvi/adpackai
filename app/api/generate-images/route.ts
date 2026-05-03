import { NextRequest, NextResponse } from "next/server";
import { createImageTask } from "@/lib/kieai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingPrompts, ugcPrompt } = body as {
      listingPrompts: [string, string, string];
      ugcPrompt: string;
    };

    if (!listingPrompts || !ugcPrompt) {
      return NextResponse.json({ error: "Missing prompts" }, { status: 400 });
    }

    const [l1, l2, l3, ugc] = await Promise.all([
      createImageTask(listingPrompts[0], "1:1", "2K"),
      createImageTask(listingPrompts[1], "1:1", "2K"),
      createImageTask(listingPrompts[2], "1:1", "2K"),
      createImageTask(ugcPrompt, "1:1", "2K"),
    ]);

    return NextResponse.json({
      taskIds: {
        listing: [l1, l2, l3],
        ugc: ugc,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-images]", message);
    const status = message.includes("402") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
