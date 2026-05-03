import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callGemini(messages: { role: string; content: unknown }[]) {
  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://adpackai.com",
      "X-Title": "AdPack AI",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json() as {
      image: string;
      mimeType: string;
    };

    if (!image || !mimeType) {
      return NextResponse.json({ error: "Missing image or mimeType" }, { status: 400 });
    }

    const raw = await callGemini([
      {
        role: "system",
        content: `You are a product analyst and creative director. Study the product photo and return a JSON object.

You will write five SHORT text prompts (under 350 characters each). These prompts are input strings for an AI image generator called Nano Banana 2. Write them as vivid visual scene descriptions — specific nouns, colors, materials, lighting. No meta-language. No instructions. No "a photo of". Just describe the scene.

EXAMPLE of a great prompt:
"Gleaming stainless steel insulated water bottle, pure white seamless background, soft box key light upper-left, specular highlights on brushed metal surface, crisp rim light, Amazon hero product shot, 8K, photorealistic"

EXAMPLE of a bad prompt (do not write like this):
"A professional product photograph showing the bottle on a white background with good lighting"

Return ONLY raw JSON starting with { and ending with }. No markdown, no code fences, no explanation.

{
  "analysis": {
    "productName": "exact product name from label or description",
    "productCategory": "category",
    "keyBenefits": ["short benefit 1", "short benefit 2", "short benefit 3"],
    "brandStyle": "one phrase e.g. bold retro / minimalist clean / natural organic",
    "targetAudience": "specific demographic",
    "primaryColor": "#hexcode",
    "accentColor": "#hexcode",
    "usageEnvironment": "specific place e.g. gym locker room / kitchen countertop / office desk"
  },
  "prompts": {
    "listing1": "[Product name and exact color/material], pure white seamless background, three-point studio lighting, key light upper-left 45 degrees, soft fill light, rim light, product centered, razor-sharp focus, specular highlights on [specific material finish], no people, no props, bold text overlay bottom third reading '[top benefit]', Amazon hero listing image, 8K, photorealistic",
    "listing2": "[Product name], white background, 3/4 close-up angle, [specific material and texture detail visible], three clean annotation arrows pointing to [feature 1], [feature 2], [feature 3] with label text, [primary color] accent, e-commerce infographic style, high contrast, 8K photorealistic",
    "listing3": "[Product name] on [specific surface] in [usage environment], [complementary props matching the vibe], warm golden-hour window light, shallow depth of field, [primary color] color grade, premium [brand style] lifestyle shot, no text, no people, 8K photorealistic",
    "ugc": "9:16 vertical portrait photo, [specific person matching target audience] casually holding [product name] in [usage environment], natural diffused window light, candid slight camera tilt, authentic moment, product clearly visible, background softly blurred showing [environment], ISO 800 film grain, iPhone camera look, not staged, not an ad",
    "video": "9:16 vertical close-up of [product name] being used in [usage environment], natural handheld camera movement, soft ambient light, [specific product action e.g. being opened / poured / applied], authentic UGC social media style, photorealistic"
  },
  "adScript": "Hook line (surprised tone, 1 sentence). Product action proof (1-2 sentences, specific). Punchline reaction (1 sentence). Total under 45 words. Casual speech, no hashtags."
}

Replace every placeholder with exact details from the image. Be hyper-specific: name the color, the material, the exact environment, the exact action. Vague prompts produce bad images.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${image}` },
          },
          {
            type: "text",
            text: "Analyze this product. Return the JSON with specific, vivid prompts. Replace every placeholder with real details from this image.",
          },
        ],
      },
    ]);

    // Strip markdown fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      analysis: parsed.analysis,
      listingPrompts: [
        parsed.prompts.listing1,
        parsed.prompts.listing2,
        parsed.prompts.listing3,
      ] as [string, string, string],
      ugcPrompt: parsed.prompts.ugc,
      videoPrompt: parsed.prompts.video,
      adScript: parsed.adScript,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
