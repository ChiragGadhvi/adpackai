import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Primary: Vercel Blob (requires BLOB_READ_WRITE_TOKEN env var)
// Fallback: litterbox.catbox.moe (no key needed, 1h TTL)
export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json() as { base64: string; mimeType: string };

    const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const buffer = Buffer.from(base64, "base64");
    const filename = `product-${Date.now()}.${ext}`;

    // Try Vercel Blob first if token is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { url } = await put(filename, buffer, {
        access: "public",
        contentType: mimeType,
      });
      return NextResponse.json({ url });
    }

    // Fallback: litterbox.catbox.moe
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("time", "1h");
    form.append("fileToUpload", blob, filename);

    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`catbox upload failed: ${res.status}`);
    const url = (await res.text()).trim();
    if (!url.startsWith("https://")) throw new Error("Catbox upload failed: " + url);

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[upload-image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
