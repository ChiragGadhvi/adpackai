export type Vibe = "Gym" | "Car" | "Home" | "Luxury";

export interface ProductAnalysis {
  productName: string;
  productCategory: string;
  keyBenefits: string[];
  style: string;
  targetAudience: string;
  primaryColor: string;
}

export interface GeneratedPrompts {
  listingPrompts: [string, string, string];
  ugcPrompt: string;
  videoPrompt: string;
}

export function buildListingPrompt(
  analysis: ProductAnalysis,
  variant: "main" | "features" | "lifestyle"
): string {
  const benefits = analysis.keyBenefits.slice(0, 3).join(", ");

  if (variant === "main") {
    return `Create a high-converting Amazon product listing hero image for a ${analysis.productName}. Pure white background, professional studio lighting with soft shadows, razor-sharp focus on product. Bold modern typography overlay showing the top benefit: "${analysis.keyBenefits[0]}". Premium commercial photography style. Minimal icons. Color accent: ${analysis.primaryColor}. Ultra realistic, 4K quality, no clutter.`;
  }

  if (variant === "features") {
    return `Create an Amazon product feature highlight infographic image for ${analysis.productName}. Clean white background, close-up product shot with 3 callout lines pointing to key features: ${benefits}. Modern sans-serif font labels, thin elegant lines, high contrast. Infographic style but premium. Color palette: white background, ${analysis.primaryColor} accents. Commercial photography quality.`;
  }

  return `Create an Amazon product lifestyle context image for ${analysis.productName}. Clean minimal background suggesting ${analysis.style} environment. Product is the hero, beautifully lit. Subtle lifestyle context props. Target customer: ${analysis.targetAudience}. Premium editorial photography. Soft gradient background, not pure white. 4K commercial quality.`;
}

export function buildUgcPrompt(analysis: ProductAnalysis, vibe: Vibe): string {
  const vibeContexts: Record<Vibe, string> = {
    Gym: "modern gym or fitness studio, gym bag visible, athletic wear, natural gym lighting",
    Car: "inside or next to a premium car, road trip context, golden hour light through windows",
    Home: "cozy modern home interior, natural window light, lifestyle setting",
    Luxury: "upscale environment, marble surfaces or hotel suite, warm ambient lighting",
  };

  return `Generate a realistic Instagram-style UGC lifestyle photo of a person using a ${analysis.productName} in a ${vibeContexts[vibe]} environment. Natural lighting, slightly imperfect handheld framing, candid authentic moment. The ${analysis.productName} is clearly visible being used naturally. Looks exactly like real TikTok/Instagram UGC content, not staged advertising. High realism, cinematic but authentic, slight grain. The person appears genuinely happy and surprised by the product.`;
}

export function buildVideoPrompt(
  analysis: ProductAnalysis,
  vibe: Vibe
): string {
  const vibeContexts: Record<Vibe, string> = {
    Gym: "gym or fitness setting",
    Car: "car or road trip setting",
    Home: "cozy home environment",
    Luxury: "luxury upscale environment",
  };

  return `Handheld smartphone UGC video. Scene: A person using ${analysis.productName} in a ${vibeContexts[vibe]}. Shot sequence: 1) Establishing shot of person in environment 2) Close-up macro of ${analysis.productName} being used 3) Over-the-shoulder perspective showing product in action 4) Person looks at camera with genuine surprised smile and reaction. Natural lighting, slight camera shake, realistic human behavior. Caption text: "${analysis.keyBenefits[0]}". Feels like an authentic TikTok/Instagram ad, not staged.`;
}
