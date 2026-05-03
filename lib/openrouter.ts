import type { ProductAnalysis, GeneratedPrompts, Vibe } from "./prompts";
import {
  buildListingPrompt,
  buildUgcPrompt,
  buildVideoPrompt,
} from "./prompts";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-exp:free";

async function callGemini(
  messages: { role: string; content: unknown }[]
): Promise<string> {
  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://adpackai.com",
      "X-Title": "AdPack AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function analyzeProductImage(
  base64Image: string,
  mimeType: string
): Promise<ProductAnalysis> {
  const content = await callGemini([
    {
      role: "system",
      content: `You are a professional Amazon product strategist and copywriter. Analyze the product image and return a JSON object with these exact keys:
- productName: string (descriptive product name)
- productCategory: string (e.g. "fitness equipment", "skincare", "tech accessory")
- keyBenefits: string[] (exactly 3 short benefit phrases, max 6 words each)
- style: string (aesthetic style, e.g. "minimalist", "premium", "sporty")
- targetAudience: string (e.g. "fitness enthusiasts aged 25-35")
- primaryColor: string (dominant brand color as hex or color name)
Return ONLY valid JSON, no markdown.`,
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
        {
          type: "text",
          text: "Analyze this product image and return the JSON analysis.",
        },
      ],
    },
  ]);

  return JSON.parse(content) as ProductAnalysis;
}

export async function generatePrompts(
  analysis: ProductAnalysis,
  vibe: Vibe
): Promise<GeneratedPrompts> {
  return {
    listingPrompts: [
      buildListingPrompt(analysis, "main"),
      buildListingPrompt(analysis, "features"),
      buildListingPrompt(analysis, "lifestyle"),
    ],
    ugcPrompt: buildUgcPrompt(analysis, vibe),
    videoPrompt: buildVideoPrompt(analysis, vibe),
  };
}

export async function generateAdScript(
  analysis: ProductAnalysis,
  vibe: Vibe
): Promise<string> {
  const content = await callGemini([
    {
      role: "system",
      content: `You are a viral UGC ad scriptwriter. Write a short 10-15 second ad script for TikTok/Instagram.
Style: casual, authentic, slightly surprised tone.
Structure: Hook → Proof → Reaction
Example tone: "I didn't expect this to actually work… but watch this."
Return JSON: { "script": "your script here" }
Keep it under 50 words. Natural speech only. No hashtags.`,
    },
    {
      role: "user",
      content: `Write a UGC ad script for: ${analysis.productName}. Key benefit: ${analysis.keyBenefits[0]}. Vibe: ${vibe}.`,
    },
  ]);

  const parsed = JSON.parse(content);
  return parsed.script as string;
}
