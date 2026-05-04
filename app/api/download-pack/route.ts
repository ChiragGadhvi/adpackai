import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const { assets } = await req.json() as {
      assets: { url: string; filename: string }[];
    };

    if (!assets?.length) {
      return NextResponse.json({ error: "No assets provided" }, { status: 400 });
    }

    const zip = new JSZip();

    await Promise.all(
      assets.map(async ({ url, filename }) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${filename}: ${res.status}`);
        const buffer = await res.arrayBuffer();
        zip.file(filename, buffer);
      })
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="adpack.zip"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[download-pack]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
