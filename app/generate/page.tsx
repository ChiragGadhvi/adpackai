"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Zap, AlertCircle, Archive, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadZone } from "@/components/generate/UploadZone";
import { AssetCard } from "@/components/generate/AssetCard";
import { StepTracker } from "@/components/generate/StepTracker";
import { Carousel, type CarouselAsset } from "@/components/generate/Carousel";
import { Navbar } from "@/components/ui/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────

type AssetStatus = "idle" | "queued" | "generating" | "done" | "failed";
type PageStage = "idle" | "analyzing" | "generating" | "done" | "error";

interface Asset {
  status: AssetStatus;
  url?: string;
  taskId?: string;
  prompt?: string;
}

interface AdPack {
  listing1: Asset;
  listing2: Asset;
  listing3: Asset;
  ugc: Asset;
  video: Asset;
  adScript?: string;
}

interface SavedPack {
  id: string;
  createdAt: number;
  productName?: string;
  assets: {
    label: string;
    type: "image" | "video";
    url: string;
    prompt?: string;
    aspectRatio?: string;
  }[];
  adScript?: string;
}

type ScrapedData = { title: string; brand: string; bullets: string[]; imageUrls: string[] };

const STORAGE_KEY = "adpack_showcase";
const MAX_SAVED = 10;

const SAMPLE_AMAZON_PRODUCTS = [
  { label: "Kissan Jam",      url: "https://www.amazon.in/Kissan-Mixed-Fruit-Jam-1-04/dp/B0795VHLZ7/" },
  { label: "Bare Anatomy",    url: "https://www.amazon.in/Bare-Anatomy-Anti-Dandruff-Shampoo-Targets/dp/B0BJZXKH12/" },
  { label: "Nescafé Classic", url: "https://www.amazon.in/NESCAFE-Classic-Instant-Robusta-Roasted/dp/B01C5IX1PA/" },
  { label: "Sample Product",  url: "https://www.amazon.in/dp/B0F6C7SL4Z/" },
];

const queuedAsset = (prompt?: string): Asset => ({ status: "queued", prompt });


function getStatusText(stage: PageStage, statusMsg: string): string {
  if (stage === "analyzing") return statusMsg || "Reading your product image…";
  if (stage === "error") return "Something went wrong.";
  if (statusMsg) return statusMsg;
  return "";
}

// ── ZIP download via server ────────────────────────────────────────────────────

async function downloadZip(pack: AdPack) {
  const assetDefs = [
    { key: "listing1" as keyof AdPack, filename: "listing-1.jpg" },
    { key: "listing2" as keyof AdPack, filename: "listing-2.jpg" },
    { key: "listing3" as keyof AdPack, filename: "listing-3.jpg" },
    { key: "ugc" as keyof AdPack, filename: "ugc-photo.jpg" },
    { key: "video" as keyof AdPack, filename: "ugc-video.mp4" },
  ];

  const assets = assetDefs
    .map(({ key, filename }) => {
      const asset = pack[key] as Asset;
      return asset.url ? { url: asset.url, filename } : null;
    })
    .filter(Boolean) as { url: string; filename: string }[];

  if (!assets.length) return;

  const res = await fetch("/api/download-pack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assets }),
  });

  if (!res.ok) throw new Error("ZIP download failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "adpack.zip";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Showcase persistence ───────────────────────────────────────────────────────

function savePack(pack: AdPack, productName?: string) {
  const assets: SavedPack["assets"] = [];
  const assetDefs: { key: keyof AdPack; label: string; type: "image" | "video"; aspectRatio: string }[] = [
    { key: "listing1", label: "Listing 1", type: "image", aspectRatio: "1/1" },
    { key: "listing2", label: "Listing 2", type: "image", aspectRatio: "1/1" },
    { key: "listing3", label: "Listing 3", type: "image", aspectRatio: "1/1" },
    { key: "ugc",      label: "UGC Photo", type: "image", aspectRatio: "9/16" },
    { key: "video",    label: "Video",     type: "video", aspectRatio: "9/16" },
  ];

  for (const { key, label, type, aspectRatio } of assetDefs) {
    const a = pack[key] as Asset;
    if (a.url) assets.push({ label, type, url: a.url, prompt: a.prompt, aspectRatio });
  }

  if (!assets.length) return;

  const saved: SavedPack = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    productName,
    assets,
    adScript: pack.adScript,
  };

  try {
    const existing: SavedPack[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const updated = [saved, ...existing].slice(0, MAX_SAVED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function loadSavedPacks(): SavedPack[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// ── Showcase card ──────────────────────────────────────────────────────────────

function ShowcaseCard({ saved, onDelete, readOnly = false }: { saved: SavedPack; onDelete: () => void; readOnly?: boolean }) {
  const [zipping, setZipping] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState<number | null>(null);

  const carouselAssets: CarouselAsset[] = saved.assets
    .filter(a => a.url)
    .map(a => ({ url: a.url, type: a.type, label: a.label }));

  async function handleZip() {
    setZipping(true);
    try {
      const fakeAssets = saved.assets.filter(a => a.url);
      const res = await fetch("/api/download-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: fakeAssets.map(a => ({
            url: a.url,
            filename: a.label.toLowerCase().replace(/\s+/g, "-") + (a.type === "video" ? ".mp4" : ".jpg"),
          })),
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `adpack-${saved.id}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setZipping(false);
  }

  const date = new Date(saved.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ borderColor: "rgba(0,0,0,0.07)", fontFamily: "var(--font-inter)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#000" }}>
            {saved.productName ?? "Ad Pack"}
          </p>
          <p className="text-[11px]" style={{ color: "#a1a1aa" }}>{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZip}
            disabled={zipping}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium transition-all hover:bg-black hover:text-white hover:border-black disabled:opacity-40"
            style={{ color: "#000" }}
          >
            {zipping ? <Loader2 size={11} className="animate-spin" /> : <Archive size={11} />}
            {zipping ? "Zipping…" : "Download ZIP"}
          </button>
          {!readOnly && (
            <button
              onClick={onDelete}
              className="text-[11px] transition-opacity hover:opacity-50"
              style={{ color: "#a1a1aa" }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Asset bento grid */}
      <div className="flex flex-col gap-2">
        {/* Listing images — 3 columns, square */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {saved.assets.map((asset, i) => asset.aspectRatio !== "9/16" ? (
            <AssetCard
              key={asset.label}
              label={asset.label}
              type={asset.type}
              status="done"
              url={asset.url}
              prompt={asset.prompt}
              aspectRatio="1/1"
              compact
              onView={() => setCarouselIdx(i)}
            />
          ) : null)}
        </div>
        {/* UGC + video — 2 columns, reduced height (4:5 in gallery) */}
        <div className="grid grid-cols-2 gap-2">
          {saved.assets.map((asset, i) => asset.aspectRatio === "9/16" ? (
            <AssetCard
              key={asset.label}
              label={asset.label}
              type={asset.type}
              status="done"
              url={asset.url}
              prompt={asset.prompt}
              aspectRatio="4/5"
              compact
              onView={() => setCarouselIdx(i)}
            />
          ) : null)}
        </div>
      </div>

      {carouselIdx !== null && carouselAssets.length > 0 && (
        <Carousel
          assets={carouselAssets}
          startIndex={Math.min(carouselIdx, carouselAssets.length - 1)}
          onClose={() => setCarouselIdx(null)}
        />
      )}

      {/* Script */}
      {saved.adScript && (
        <div
          className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
          style={{ background: "#f4f4f5", color: "#6F6F6F", fontStyle: "italic" }}
        >
          {saved.adScript}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [image, setImage] = useState<{
    base64: string;
    mimeType: string;
    preview: string;
  } | null>(null);
  const [stage, setStage] = useState<PageStage>("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<AdPack | null>(null);
  const [zipping, setZipping] = useState(false);
  const [savedPacks, setSavedPacks] = useState<SavedPack[]>([]);
  const [seedPacks, setSeedPacks] = useState<SavedPack[]>([]);
  const [analysisData, setAnalysisData] = useState<{ productName?: string } | null>(null);
  const [carouselIdx, setCarouselIdx] = useState<number | null>(null);
  const abortRef = useRef<boolean>(false);
  const hasSavedRef = useRef(false);

  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedProduct, setScrapedProduct] = useState<{
    title: string;
    brand: string;
    bullets: string[];
    imageUrls: string[];
  } | null>(null);

  const [samplePrefetch, setSamplePrefetch] = useState<Record<string, ScrapedData | "loading" | "error">>({});
  const prefetchDoneRef = useRef(false);

  useEffect(() => {
    setSavedPacks(loadSavedPacks());
    // Load seed packs committed to the repo (visible in production)
    fetch("/showcase-seed.json")
      .then(r => r.json())
      .then((data: SavedPack[]) => {
        const local = loadSavedPacks();
        const localIds = new Set(local.map(p => p.id));
        // Only show seed packs that aren't already in localStorage
        setSeedPacks(data.filter(p => !localIds.has(p.id)));
      })
      .catch(() => { /* no seed file — fine */ });
    return () => { abortRef.current = true; };
  }, []);

  useEffect(() => {
    if (inputMode !== "url" || prefetchDoneRef.current) return;
    prefetchDoneRef.current = true;
    const uniqueUrls = [...new Set(SAMPLE_AMAZON_PRODUCTS.map(s => s.url))];
    setSamplePrefetch(Object.fromEntries(uniqueUrls.map(u => [u, "loading"])));
    uniqueUrls.forEach(url => {
      fetch("/api/scrape-amazon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
        .then(r => r.json())
        .then((data: ScrapedData) => setSamplePrefetch(prev => ({ ...prev, [url]: data })))
        .catch(() => setSamplePrefetch(prev => ({ ...prev, [url]: "error" })));
    });
  }, [inputMode]);

  function updateAsset(key: keyof AdPack, patch: Partial<Asset>) {
    setPack((prev) =>
      prev ? { ...prev, [key]: { ...(prev[key] as Asset), ...patch } } : prev
    );
  }

  type TaskBody = {
    type: "image" | "video";
    prompt: string;
    aspectRatio?: "1:1" | "9:16" | "16:9";
    imageUrl?: string;
    model?: string;
    referenceImageUrl?: string;
  };

  async function waitForTask(taskId: string, assetKey: keyof AdPack): Promise<string> {
    const MAX_POLLS = 150;
    for (let i = 0; i < MAX_POLLS; i++) {
      if (abortRef.current) throw new Error("Aborted");
      await new Promise((r) => setTimeout(r, 4000));
      const res = await fetch(`/api/task-status?taskId=${taskId}`);
      const data = await res.json();
      if (data.status === "completed" && data.outputUrl) return data.outputUrl as string;
      if (data.status === "failed") throw new Error(`Task failed: ${taskId}`);
    }
    throw new Error("Task timed out after 10 minutes");
  }

  async function runTask(assetKey: keyof AdPack, body: TaskBody, attempt = 0): Promise<string> {
    updateAsset(assetKey, { status: "generating" });
    const res = await fetch("/api/create-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      if (attempt === 0 && body.type === "image") {
        return runTask(assetKey, { ...body, model: "gpt-image-2-text-to-image", referenceImageUrl: undefined }, 1);
      }
      if (attempt === 1 && body.type === "image") {
        return runTask(assetKey, { ...body, model: "nano-banana-2", referenceImageUrl: undefined }, 2);
      }
      throw new Error(data.error ?? "Task creation failed");
    }
    try {
      const url = await waitForTask(data.taskId as string, assetKey);
      updateAsset(assetKey, { status: "done", url, taskId: data.taskId });
      return url;
    } catch (err) {
      if (attempt === 0 && body.type === "image") {
        return runTask(assetKey, { ...body, model: "gpt-image-2-text-to-image", referenceImageUrl: undefined }, 1);
      }
      if (attempt === 1 && body.type === "image") {
        return runTask(assetKey, { ...body, model: "nano-banana-2", referenceImageUrl: undefined }, 2);
      }
      updateAsset(assetKey, { status: "failed" });
      throw err;
    }
  }

  async function scrapeUrl(url: string) {
    setScraping(true);
    setError(null);
    setScrapedProduct(null);
    try {
      const res = await fetch("/api/scrape-amazon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");
      setScrapedProduct(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read Amazon page");
    }
    setScraping(false);
  }

  async function handleScrape() {
    if (!amazonUrl) return;
    await scrapeUrl(amazonUrl);
  }

  async function handleGenerate() {
    if (inputMode === "upload" && !image) return;
    if (inputMode === "url" && !scrapedProduct) return;
    abortRef.current = false;
    hasSavedRef.current = false;
    setError(null);
    setPack(null);
    setStage("analyzing");
    setStatusMsg("Reading your product image…");

    try {
      setStatusMsg("Analyzing brand & writing prompts…");

      let refImageUrl: string | undefined;
      let aRes: Response;

      if (inputMode === "url" && scrapedProduct) {
        // Use Amazon image URL directly — no upload needed
        refImageUrl = scrapedProduct.imageUrls[0];
        aRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: refImageUrl }),
        });
      } else {
        aRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: image!.base64, mimeType: image!.mimeType }),
        });
      }

      const aData = await aRes.json();
      if (!aRes.ok) throw new Error(aData.error ?? "Analysis failed");

      const { listingPrompts, ugcPrompt, videoPrompt, adScript, analysis } = aData as {
        listingPrompts: [string, string, string];
        ugcPrompt: string;
        videoPrompt: string;
        adScript: string;
        analysis: { productName?: string };
      };

      setAnalysisData(analysis);

      const finalVideoPrompt = adScript
        ? `${videoPrompt} The person says: "${adScript}"`
        : videoPrompt;

      // Upload product image to get a public HTTPS URL for KIEAI reference (upload mode only)
      if (inputMode === "upload" && image && !refImageUrl) {
        try {
          setStatusMsg("Uploading reference image…");
          const uploadRes = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64: image.base64, mimeType: image.mimeType }),
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json() as { url?: string };
            refImageUrl = uploadData.url;
          }
        } catch { /* proceed without reference image if upload fails */ }
      }

      setPack({
        listing1: queuedAsset(listingPrompts[0]),
        listing2: queuedAsset(listingPrompts[1]),
        listing3: queuedAsset(listingPrompts[2]),
        ugc: queuedAsset(ugcPrompt),
        video: queuedAsset(finalVideoPrompt),
        adScript,
      });
      setStage("generating");
      setStatusMsg("All engines running — assets will appear as they complete…");

      const stagger = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

      // Stagger task creation by 3s each to avoid KIEAI rate limits; polling still runs in parallel
      const [, , , ugcUrl] = await Promise.all([
        runTask("listing1", { type: "image", prompt: listingPrompts[0], aspectRatio: "1:1",  referenceImageUrl: refImageUrl }),
        stagger(3000).then(() => runTask("listing2", { type: "image", prompt: listingPrompts[1], aspectRatio: "1:1",  referenceImageUrl: refImageUrl })),
        stagger(6000).then(() => runTask("listing3", { type: "image", prompt: listingPrompts[2], aspectRatio: "1:1",  referenceImageUrl: refImageUrl })),
        stagger(9000).then(() => runTask("ugc",      { type: "image", prompt: ugcPrompt,          aspectRatio: "9:16", referenceImageUrl: refImageUrl })),
      ]);

      if (abortRef.current) return;
      setStatusMsg("Images ready ✓ — generating video…");
      await runTask("video", { type: "video", prompt: finalVideoPrompt, imageUrl: ugcUrl });

      if (abortRef.current) return;
      setStatusMsg("Your ad pack is complete ✓");
      setStage("done");

      // Save to showcase (guard against React StrictMode double-invoke)
      setPack((finalPack) => {
        if (finalPack && !hasSavedRef.current) {
          hasSavedRef.current = true;
          savePack(finalPack, analysis?.productName);
          setSavedPacks(loadSavedPacks());
        }
        return finalPack;
      });
    } catch (err) {
      if (abortRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
      setStatusMsg("");
    }
  }

  async function handleDownloadZip() {
    if (!pack) return;
    setZipping(true);
    try {
      await downloadZip(pack);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ZIP download failed");
    }
    setZipping(false);
  }

  function deleteShowcase(id: string) {
    const updated = savedPacks.filter((p) => p.id !== id);
    setSavedPacks(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* */ }
  }

  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  async function exportSeedFile() {
    if (savedPacks.length === 0) return;
    setExporting(true);
    setExportDone(false);
    try {
      const res = await fetch("/api/dev/export-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedPacks),
      });
      if (res.ok) {
        setExportDone(true);
        setTimeout(() => setExportDone(false), 3000);
      }
    } catch { /* ignore */ }
    setExporting(false);
  }

  const isGenerating = stage === "analyzing" || stage === "generating";

  const recentSaved = savedPacks[0] ?? seedPacks[0] ?? null;

  const doneCount = pack
    ? (["listing1", "listing2", "listing3", "ugc", "video"] as (keyof AdPack)[])
        .filter((k) => (pack[k] as Asset).status === "done").length
    : 0;

  const stepStatuses: AssetStatus[] = pack
    ? [pack.listing1.status, pack.listing2.status, pack.listing3.status, pack.ugc.status, pack.video.status]
    : ["idle", "idle", "idle", "idle", "idle"];

  const steps = [
    { label: "Listing 1", status: stepStatuses[0] },
    { label: "Listing 2", status: stepStatuses[1] },
    { label: "Listing 3", status: stepStatuses[2] },
    { label: "UGC Photo", status: stepStatuses[3] },
    { label: "Video",     status: stepStatuses[4] },
  ];

  // Flat carousel assets for the live pack
  const packCarouselAssets: CarouselAsset[] = pack ? (
    [
      { url: pack.listing1.url ?? "", type: "image" as const, label: "Listing 1" },
      { url: pack.listing2.url ?? "", type: "image" as const, label: "Listing 2" },
      { url: pack.listing3.url ?? "", type: "image" as const, label: "Listing 3" },
      { url: pack.ugc.url ?? "",      type: "image" as const, label: "UGC Photo" },
      { url: pack.video.url ?? "",    type: "video" as const, label: "Video" },
    ] as CarouselAsset[]
  ).filter(a => a.url) : [];

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">

          {/* ── Left panel (sticky) ── */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            <div>
              <h1
                className="font-normal"
                style={{
                  fontFamily: "var(--font-instrument)",
                  fontSize: "1.75rem",
                  letterSpacing: "-0.03em",
                  color: "#000",
                  lineHeight: 1.1,
                }}
              >
                Generate Ad Pack
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#6F6F6F" }}>
                Upload a product image and get a full ad pack in minutes.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-lg border border-black/[0.08] p-0.5 gap-0.5">
              <button
                onClick={() => { setInputMode("upload"); setScrapedProduct(null); setAmazonUrl(""); setPack(null); setStage("idle"); setError(null); }}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  inputMode === "upload" ? "bg-black text-white" : "text-zinc-500 hover:text-black"
                )}
              >
                Upload Image
              </button>
              <button
                onClick={() => { setInputMode("url"); setImage(null); setPack(null); setStage("idle"); setError(null); }}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  inputMode === "url" ? "bg-black text-white" : "text-zinc-500 hover:text-black"
                )}
              >
                Amazon URL
              </button>
            </div>

            {inputMode === "upload" ? (
              <UploadZone
                onImageSelect={(base64, mimeType, preview) =>
                  setImage({ base64, mimeType, preview })
                }
                preview={image?.preview ?? null}
                onClear={() => {
                  abortRef.current = true;
                  setImage(null);
                  setPack(null);
                  setStage("idle");
                  setError(null);
                  setStatusMsg("");
                }}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    value={amazonUrl}
                    onChange={e => setAmazonUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleScrape()}
                    placeholder="https://www.amazon.in/dp/…"
                    className="flex-1 rounded-xl border border-black/[0.12] px-3 py-2.5 text-sm outline-none focus:border-black/30"
                  />
                  <button
                    onClick={handleScrape}
                    disabled={!amazonUrl || scraping}
                    className="rounded-xl bg-black text-white px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
                  >
                    {scraping ? <Loader2 size={14} className="animate-spin" /> : "Fetch"}
                  </button>
                </div>

                {/* Sample Amazon products — pre-fetched on tab open */}
                {!scrapedProduct && (
                  <div>
                    <p className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: "#a1a1aa" }}>
                      Or try a sample
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_AMAZON_PRODUCTS.map((s, i) => {
                        const prefetched = samplePrefetch[s.url];
                        const isLoading = prefetched === "loading" || prefetched === undefined;
                        const thumbUrl = typeof prefetched === "object" ? prefetched?.imageUrls[0] : undefined;
                        return (
                          <button
                            key={`${s.url}-${i}`}
                            disabled={scraping || isLoading}
                            onClick={() => {
                              if (typeof prefetched !== "object" || !prefetched) return;
                              setAmazonUrl(s.url);
                              setScrapedProduct(prefetched);
                            }}
                            className="relative rounded-lg overflow-hidden border border-black/[0.08] aspect-square bg-zinc-50 hover:border-black/30 hover:bg-zinc-100 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 p-1"
                            title={s.label}
                          >
                            {isLoading ? (
                              <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                            ) : thumbUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumbUrl} alt={s.label} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[9px] text-center leading-tight px-1" style={{ color: "#6F6F6F" }}>{s.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {scrapedProduct && (
                  <div className="rounded-xl border border-black/[0.08] p-3 flex gap-3 items-start">
                    {scrapedProduct.imageUrls[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={scrapedProduct.imageUrls[0]}
                        alt=""
                        className="w-16 h-16 object-contain rounded-lg border border-black/[0.06] bg-zinc-50 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium line-clamp-2" style={{ color: "#000" }}>{scrapedProduct.title}</p>
                      {scrapedProduct.brand && (
                        <p className="text-[11px] mt-0.5" style={{ color: "#6F6F6F" }}>{scrapedProduct.brand}</p>
                      )}
                      <p className="text-[11px] mt-1" style={{ color: "#a1a1aa" }}>
                        {scrapedProduct.bullets.length} features · {scrapedProduct.imageUrls.length} image{scrapedProduct.imageUrls.length !== 1 ? "s" : ""} detected
                      </p>
                    </div>
                    <button
                      onClick={() => { setScrapedProduct(null); setAmazonUrl(""); }}
                      className="text-zinc-300 hover:text-zinc-500 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {(isGenerating || stage === "done") && (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: stage === "done" ? "#000" : "#6F6F6F", minHeight: 20 }}
              >
                {isGenerating && <Loader2 size={13} className="animate-spin flex-shrink-0" />}
                <span style={{ fontFamily: "var(--font-inter)" }}>
                  {getStatusText(stage, statusMsg)}
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={(!image && !scrapedProduct) || isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: "#000", fontFamily: "var(--font-inter)" }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {stage === "analyzing" ? "Analyzing…" : "Generating…"}
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Generate Ad Pack
                </>
              )}
            </button>

            <p className="text-[10px]" style={{ color: "#d4d4d8" }}>
              3 listing images · 1 UGC photo · 1 video
            </p>
          </div>

          {/* ── Right panel ── */}
          {pack ? (
            <div className="flex flex-col gap-8">
              <div className="py-2">
                <StepTracker steps={steps} />
              </div>

              {/* Listing images */}
              <div>
                <p className="text-[10px] font-medium tracking-widest uppercase mb-4" style={{ color: "#a1a1aa" }}>
                  Amazon Listing Images
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AssetCard label="Listing 1" type="image" aspectRatio="1/1" status={pack.listing1.status} url={pack.listing1.url} prompt={pack.listing1.prompt} onView={() => setCarouselIdx(0)} />
                  <AssetCard label="Listing 2" type="image" aspectRatio="1/1" status={pack.listing2.status} url={pack.listing2.url} prompt={pack.listing2.prompt} onView={() => setCarouselIdx(1)} />
                  <AssetCard label="Listing 3" type="image" aspectRatio="1/1" status={pack.listing3.status} url={pack.listing3.url} prompt={pack.listing3.prompt} onView={() => setCarouselIdx(2)} />
                </div>
              </div>

              {/* UGC photo + video — fixed-width 9:16 cards */}
              <div className="flex gap-6">
                <div style={{ width: 195, flexShrink: 0 }}>
                  <p className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: "#a1a1aa" }}>
                    UGC Photo
                  </p>
                  <AssetCard label="UGC Photo" type="image" aspectRatio="9/16" status={pack.ugc.status} url={pack.ugc.url} prompt={pack.ugc.prompt} onView={() => setCarouselIdx(3)} />
                </div>
                <div style={{ width: 195, flexShrink: 0 }}>
                  <p className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: "#a1a1aa" }}>
                    UGC Video
                  </p>
                  <AssetCard label="Video" type="video" aspectRatio="9/16" status={pack.video.status} url={pack.video.url} prompt={pack.video.prompt} onView={() => setCarouselIdx(4)} />
                </div>
              </div>

              {/* Download buttons */}
              {doneCount > 0 && (
                <div className="pt-2 border-t border-black/[0.06] flex flex-col gap-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={zipping}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "#000", fontFamily: "var(--font-inter)" }}
                  >
                    {zipping
                      ? <><Loader2 size={14} className="animate-spin" /> Building ZIP…</>
                      : <><Archive size={14} /> {doneCount === 5 ? "Download Full Pack — ZIP (5/5)" : `Download Ready — ZIP (${doneCount}/5)`}</>
                    }
                  </button>
                </div>
              )}
            </div>
          ) : recentSaved ? (
            <div className="hidden lg:flex flex-col gap-3">
              <p className="text-[11px]" style={{ color: "#a1a1aa", fontFamily: "var(--font-inter)" }}>
                Last generated · {recentSaved.productName ?? "Ad Pack"}
              </p>
              <ShowcaseCard saved={recentSaved} onDelete={() => deleteShowcase(recentSaved.id)} />
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.08] min-h-[480px]">
              <p className="text-sm" style={{ color: "#d4d4d8" }}>
                Your ad pack will appear here
              </p>
            </div>
          )}

          {/* Live pack carousel */}
          {carouselIdx !== null && packCarouselAssets.length > 0 && (
            <Carousel
              assets={packCarouselAssets}
              startIndex={Math.min(carouselIdx, packCarouselAssets.length - 1)}
              onClose={() => setCarouselIdx(null)}
            />
          )}
        </div>

        {/* ── Showcase gallery ── */}
        {(savedPacks.length > 0 || seedPacks.length > 0) && (
          <div className="mt-24">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2
                  className="font-normal"
                  style={{
                    fontFamily: "var(--font-instrument)",
                    fontSize: "1.4rem",
                    letterSpacing: "-0.02em",
                    color: "#000",
                  }}
                >
                  Generated Packs
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "#6F6F6F" }}>
                  Previously generated — download or copy prompts without regenerating.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {savedPacks.length > 0 && process.env.NODE_ENV === "development" && (
                  <button
                    onClick={exportSeedFile}
                    disabled={exporting}
                    className="text-xs transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{ color: exportDone ? "#22c55e" : "#6F6F6F", fontFamily: "var(--font-inter)" }}
                    title="Saves to public/showcase-seed.json — commit & push to show in production"
                  >
                    {exporting ? "Saving…" : exportDone ? "Saved — commit & push ✓" : "Save for production"}
                  </button>
                )}
                {savedPacks.length > 0 && (
                  <button
                    onClick={() => {
                      setSavedPacks([]);
                      try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
                    }}
                    className="text-xs transition-opacity hover:opacity-50"
                    style={{ color: "#a1a1aa", fontFamily: "var(--font-inter)" }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {savedPacks.map((saved) => (
                <ShowcaseCard
                  key={saved.id}
                  saved={saved}
                  onDelete={() => deleteShowcase(saved.id)}
                />
              ))}
              {seedPacks.map((saved) => (
                <ShowcaseCard
                  key={saved.id}
                  saved={saved}
                  onDelete={() => {}}
                  readOnly
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
