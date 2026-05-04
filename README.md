# AdPack AI

Generate a complete Amazon ad pack from a single product photo — three listing images, an in-car UGC photo, and a viral UGC video — in under five minutes.

![Home](public/home.png)

---

## What it generates

| Asset | Format | Engine |
|---|---|---|
| Listing Image 1 — Hero shot | 1:1 | Nano Banana 2 i2i (KIEAI) |
| Listing Image 2 — Benefits infographic | 1:1 | Nano Banana 2 i2i (KIEAI) |
| Listing Image 3 — Lifestyle context | 1:1 | Nano Banana 2 i2i (KIEAI) |
| UGC Photo — In-car reaction | 9:16 | Nano Banana 2 i2i (KIEAI) |
| UGC Video — In-car with audio | 9:16 | Kling 2.6 (KIEAI) |

All four image tasks fire in parallel (staggered by 3 s each to avoid rate limits). The video starts automatically once the UGC photo completes, using it as the reference frame.

---

## Generate page

![Generate](public/generate.png)

---

## How it works

1. **Upload** a product photo (JPG, PNG, WebP) — or pick one of 5 built-in sample products
2. **Gemini 2.5 Flash** analyzes the image and writes tailored prompts for all five assets plus a short ad script (≤ 10 words)
3. Your product photo is uploaded to **Vercel Blob** (or Litterbox as fallback) to get a public URL
4. **KIEAI Nano Banana 2** generates all four images in image-to-image mode using your product photo as reference — outputs are grounded in the actual product
5. The ad script is baked into the video prompt so the person in the video speaks it naturally
6. Assets appear one by one as they complete — click any to open a full-screen carousel with keyboard navigation
7. **Download** individually or as a single ZIP
8. Every generated pack is saved to **localStorage** and shown in the gallery below — visible after refresh

---

## Image generation fallback chain

If the primary model fails, the app automatically retries with the next model — nothing ever shows as permanently failed unless all three attempts fail:

| Attempt | Model | Reference image |
|---|---|---|
| 1 (primary) | `nano-banana-2` | ✅ product photo via `image_input` |
| 2 | `gpt-image-2-text-to-image` | ❌ prompt only |
| 3 | `nano-banana-2` | ❌ prompt only |

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4**
- **Gemini 2.5 Flash** via OpenRouter — product analysis & prompt generation
- **KIEAI API** — Nano Banana 2 (image-to-image) + Kling 2.6 (video with audio)
- **Vercel Blob** — product image hosting for KIEAI reference (fallback: Litterbox)
- **JSZip** — server-side ZIP bundling
- **localStorage + `public/showcase-seed.json`** — packs persist across sessions and are visible in production without a database

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/ChiragGadhvi/adpackai.git
cd adpack
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
KIEAI_API_KEY=your_kieai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

| Variable | Where to get it | Required |
|---|---|---|
| `KIEAI_API_KEY` | [kie.ai](https://kie.ai) → API Keys | ✅ |
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) → Keys | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → Blob → Connect | Optional (falls back to Litterbox) |

**To enable Vercel Blob:**
1. Go to your Vercel project → **Storage** → **Create Store** → **Blob**
2. Connect it to your project — the token is added to your env vars automatically on Vercel
3. Copy the token to `.env.local` for local development

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Deploy to Vercel

Set all three env vars in **Vercel → Settings → Environment Variables**, then deploy.

```bash
vercel --prod
```

---

## Persisting packs in production

Generated packs are stored in `localStorage` locally. To make them visible in the production deployment (without a database):

1. Generate packs locally
2. On the generate page, click **"Save for production"** (visible in dev mode only) — this writes `public/showcase-seed.json`
3. Commit and push — the seed file is served statically and loaded on every visit

---

## Project structure

```
app/
  page.tsx                    # Landing page with fullscreen video
  generate/page.tsx           # Generator UI — upload, generate, gallery
  api/
    analyze/route.ts          # Gemini 2.5 Flash — product analysis + prompt generation
    create-task/route.ts      # KIEAI task creation (image + video)
    task-status/route.ts      # KIEAI task polling
    download-pack/route.ts    # Server-side ZIP via JSZip
    upload-image/route.ts     # Product photo upload → Vercel Blob / Litterbox
    dev/export-seed/route.ts  # Dev-only: writes localStorage packs to showcase-seed.json
components/
  generate/
    AssetCard.tsx             # Image/video card with natural-ratio display + lightbox
    Carousel.tsx              # Full-screen carousel with keyboard navigation
    StepTracker.tsx           # 5-step progress indicator
    UploadZone.tsx            # Drag-and-drop upload + 5 built-in sample products
  ui/
    Navbar.tsx
lib/
  kieai.ts                    # KIEAI API wrapper — Nano Banana 2 i2i + Kling 2.6 video
public/
  samples/                    # 5 built-in product images (facewash, perfume, coffee, mouthwash, dogfood)
  showcase-seed.json          # Pre-seeded packs visible in production
```

---

## License

MIT
