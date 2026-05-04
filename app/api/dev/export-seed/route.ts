import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// Dev-only: writes localStorage packs to public/showcase-seed.json
// Disabled in production so it cannot be abused
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const packs = await req.json();
    if (!Array.isArray(packs)) {
      return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "public", "showcase-seed.json");
    await writeFile(filePath, JSON.stringify(packs, null, 2), "utf8");

    return NextResponse.json({ ok: true, count: packs.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
