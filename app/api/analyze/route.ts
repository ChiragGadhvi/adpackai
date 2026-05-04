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
    const { image, mimeType } = await req.json() as { image: string; mimeType: string };
    if (!image || !mimeType) {
      return NextResponse.json({ error: "Missing image or mimeType" }, { status: 400 });
    }

    const raw = await callGemini([
      {
        role: "system",
        content: `You are an expert Amazon product listing strategist and AI prompt engineer. Analyze the product image and extract every visual detail: exact product name, colors, materials, ingredients/components, brand style, target audience, key benefits, and where it's used.

Then write 5 AI image generation prompts using the professional templates below. Fill every [BRACKET] with specific details from the actual product — never leave brackets or say "product name", always use the real name and specifics.

Return ONLY raw JSON starting with { and ending with }. No markdown, no code fences.

---

TEMPLATE A — Slide 01 Hero Shot (use for listing1):
"Product photography of [ACTUAL PRODUCT NAME] on a clean [SPECIFIC COMPLEMENTARY COLOR] background. The [bottle/box/pouch/can] is centered and sharp. Scattered around it: [2-3 SPECIFIC REAL INGREDIENTS OR PROPS]. At the top-left, bold serif headline reads '[MAIN BENEFIT CLAIM]'. Bottom strip shows '[SECONDARY CLAIM]'. Soft natural lighting, photorealistic, high resolution, studio quality, ecommerce product photo."

TEMPLATE B — Slide 02 Benefits Infographic (use for listing2):
"Amazon listing infographic for [ACTUAL PRODUCT NAME]. [SPECIFIC COLOR SCHEME matching brand]. Left side: product photo with floating [SPECIFIC BOTANICAL/INGREDIENT ELEMENTS]. Right side: vertical list of 5 benefit rows, each with a small icon and bold text: '[BENEFIT 1]', '[BENEFIT 2]', '[BENEFIT 3]', '[BENEFIT 4]', '[BENEFIT 5]'. Top headline: '[HERO CLAIM]'. Clean modern layout, ecommerce infographic style, high resolution."

TEMPLATE C — Slide 07 Lifestyle (use for listing3):
"Amazon listing lifestyle photo for [ACTUAL PRODUCT NAME]. [SPECIFIC SETTING e.g. bright modern kitchen, sunlit gym, cozy bathroom]. A [SPECIFIC PERSON matching target audience, e.g. 'woman in her 30s doing yoga'] is shown [SPECIFIC ACTIVITY]. The product is visible in the foreground. Headline overlay: '[LIFESTYLE CLAIM]'. Subtext: '[EMOTIONAL HOOK]'. Warm, authentic, professional lifestyle photography, ecommerce listing image, high resolution."

TEMPLATE D — In-Car UGC Photo (use for ugc):
"9:16 vertical portrait. [SPECIFIC PERSON matching target audience, e.g. 'attractive woman in her late 20s'] sitting in driver seat of a modern car. Holding [ACTUAL PRODUCT NAME] up toward camera with both hands. Genuine wide-eyed surprised and delighted expression. Product label clearly facing camera. Warm golden sunlight streaming through windshield, soft bokeh of car interior in background. Authentic iPhone front-camera UGC selfie style. ISO 800 film grain. Photorealistic. No text overlays."

TEMPLATE E — In-Car UGC Video (use for video):
"9:16 vertical UGC video. [SPECIFIC PERSON matching target audience] sitting in parked car, [ACTUAL PRODUCT NAME] resting on passenger seat. Person reaches over, picks it up, holds it toward camera with a genuine surprised reaction. Warm sunlight through car windows, authentic handheld shaky iPhone camera feel. Close-up on product label mid-shot. TikTok viral UGC style. Photorealistic."

---

JSON format:
{
  "analysis": {
    "productName": "exact product name from image",
    "productCategory": "category",
    "keyBenefits": ["specific benefit 1", "specific benefit 2", "specific benefit 3"],
    "brandStyle": "e.g. bold vibrant / minimalist clean / natural wellness",
    "targetAudience": "specific person description",
    "primaryColor": "#hexcode",
    "usageEnvironment": "specific place"
  },
  "prompts": {
    "listing1": "[filled Template A — no brackets remaining]",
    "listing2": "[filled Template B — no brackets remaining]",
    "listing3": "[filled Template C — no brackets remaining]",
    "ugc": "[filled Template D — no brackets remaining]",
    "video": "[filled Template E — no brackets remaining]"
  },
  "adScript": "ONE sentence only. Max 10 words. Genuine surprised reaction to the product. Casual spoken English. No exclamations chained together. No rap. Example: 'Wait, this actually smells incredible.'"
}`,
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
            text: "Analyze this product image carefully. Fill every bracket in the templates with real, specific details from this product. Return the complete JSON.",
          },
        ],
      },
    ]);

    const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
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
