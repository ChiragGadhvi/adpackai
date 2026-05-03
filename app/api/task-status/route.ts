import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/kieai";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  try {
    const result = await getTaskStatus(taskId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[task-status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
