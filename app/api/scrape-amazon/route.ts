import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
};

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url?.includes("amazon.")) {
    return NextResponse.json({ error: "Not an Amazon URL" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Amazon returned ${res.status} — please upload the product image manually instead` },
        { status: 422 }
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Could not reach Amazon — please upload the product image manually instead" },
      { status: 422 }
    );
  }

  const $ = cheerio.load(html);

  const title =
    $("#productTitle").text().trim() ||
    $("h1").first().text().trim();

  const brand =
    $("#bylineInfo").text()
      .replace("Brand:", "")
      .replace("Visit the", "")
      .replace("Store", "")
      .trim() ||
    $("[data-feature-name='bylineInfo'] a").first().text().trim();

  const bullets = $("#feature-bullets .a-list-item")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 5);

  // Try data-old-hires first (highest quality)
  const imageUrls: string[] = [];
  $("img[data-old-hires]").each((_, el) => {
    const src = $(el).attr("data-old-hires");
    if (src && src.startsWith("https://")) imageUrls.push(src);
  });

  // Fallback: data-a-dynamic-image (JSON map of url → [w, h])
  if (imageUrls.length === 0) {
    $("img[data-a-dynamic-image]").each((_, el) => {
      const raw = $(el).attr("data-a-dynamic-image");
      if (raw) {
        try {
          const map = JSON.parse(raw) as Record<string, unknown>;
          imageUrls.push(...Object.keys(map));
        } catch { /* ignore */ }
      }
    });
  }

  if (!title) {
    return NextResponse.json(
      { error: "Amazon blocked this request — please upload the product image manually instead" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    title,
    brand,
    bullets,
    imageUrls: imageUrls.slice(0, 3),
  });
}
