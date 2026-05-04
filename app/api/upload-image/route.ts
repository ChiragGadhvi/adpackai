import { NextRequest, NextResponse } from "next/server";

// Uploads a base64 image to tmpfiles.org and returns a public HTTPS URL.
// The URL is valid for 60 min — long enough for KIEAI task creation.
export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json() as { base64: string; mimeType: string };

    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const form = new FormData();
    form.append("file", blob, "product.jpg");

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error(`tmpfiles upload failed: ${res.status}`);
    const data = await res.json() as { status: string; data: { url: string } };
    if (data.status !== "success") throw new Error("Upload failed");

    // tmpfiles returns https://tmpfiles.org/XXXXX/file
    // Direct-download URL is https://tmpfiles.org/dl/XXXXX/file
    const url = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[upload-image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
