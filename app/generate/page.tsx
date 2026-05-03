"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Zap, AlertCircle, Download } from "lucide-react";
import { UploadZone } from "@/components/generate/UploadZone";
import { AssetCard } from "@/components/generate/AssetCard";
import { StepTracker } from "@/components/generate/StepTracker";
import { ScriptCard } from "@/components/generate/ScriptCard";
import { Navbar } from "@/components/ui/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

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

const emptyAsset = (prompt?: string): Asset => ({ status: "idle", prompt });
const queuedAsset = (prompt?: string): Asset => ({ status: "queued", prompt });

// ── Status narration ──────────────────────────────────────────────────────────

function getStatusText(stage: PageStage, pack: AdPack | null, statusMsg: string): string {
  if (stage === "analyzing") return statusMsg || "Reading your product image…";
  if (stage === "error") return "Something went wrong.";
  if (stage === "idle" || !pack) return "";
  if (statusMsg) return statusMsg;

  const done = (["listing1", "listing2", "listing3", "ugc", "video"] as (keyof AdPack)[])
    .filter((k) => (pack[k] as Asset).status === "done").length;
  if (done === 5) return "Your ad pack is complete ✓";
  return "Generating…";
}

// ── Download all ──────────────────────────────────────────────────────────────

function downloadAll(pack: AdPack) {
  const assets = [
    { url: pack.listing1.url, name: "listing-1.png" },
    { url: pack.listing2.url, name: "listing-2.png" },
    { url: pack.listing3.url, name: "listing-3.png" },
    { url: pack.ugc.url, name: "ugc-photo.png" },
    { url: pack.video.url, name: "ugc-video.mp4" },
  ].filter((a) => !!a.url);

  assets.forEach((a, i) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = a.url!;
      link.download = a.name;
      link.target = "_blank";
      link.click();
    }, i * 350);
  });
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
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  function updateAsset(key: keyof AdPack, patch: Partial<Asset>) {
    setPack((prev) =>
      prev ? { ...prev, [key]: { ...(prev[key] as Asset), ...patch } } : prev
    );
  }

  // Poll a single task until it completes, updating status on the asset
  async function waitForTask(
    taskId: string,
    assetKey: keyof AdPack
  ): Promise<string> {
    while (true) {
      if (abortRef.current) throw new Error("Aborted");
      await new Promise((r) => setTimeout(r, 4000));
      const res = await fetch(`/api/task-status?taskId=${taskId}`);
      const data = await res.json();
      if (data.status === "completed" && data.outputUrl) {
        return data.outputUrl as string;
      }
      if (data.status === "failed") {
        updateAsset(assetKey, { status: "failed" });
        throw new Error(`Task failed: ${taskId}`);
      }
    }
  }

  type TaskBody = {
    type: "image" | "video";
    prompt: string;
    aspectRatio?: "1:1" | "9:16" | "16:9";
    imageUrl?: string;
    preferModel?: "nano-banana-2" | "gpt-image-2-text-to-image";
  };

  // Submit one task and wait for completion; auto-retries once with fallback model
  async function runTask(
    assetKey: keyof AdPack,
    body: TaskBody,
    attempt = 0
  ): Promise<string> {
    updateAsset(assetKey, { status: "generating" });

    const res = await fetch("/api/create-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Task creation failed");

    try {
      const url = await waitForTask(data.taskId as string, assetKey);
      updateAsset(assetKey, { status: "done", url, taskId: data.taskId });
      return url;
    } catch (err) {
      // On first failure, retry with the other model
      if (attempt === 0 && body.type === "image") {
        const fallback = body.preferModel === "gpt-image-2-text-to-image"
          ? "nano-banana-2"
          : "gpt-image-2-text-to-image";
        return runTask(assetKey, { ...body, preferModel: fallback }, 1);
      }
      throw err;
    }
  }

  async function handleGenerate() {
    if (!image) return;
    abortRef.current = false;
    setError(null);
    setPack(null);
    setStage("analyzing");
    setStatusMsg("Reading your product image…");

    try {
      // ── Step 1: Analyze ──────────────────────────────────────────────────
      setStatusMsg("Extracting brand details and writing prompts…");
      const aRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.base64, mimeType: image.mimeType }),
      });
      const aData = await aRes.json();
      if (!aRes.ok) throw new Error(aData.error ?? "Analysis failed");

      const { listingPrompts, ugcPrompt, videoPrompt, adScript } = aData as {
        listingPrompts: [string, string, string];
        ugcPrompt: string;
        videoPrompt: string;
        adScript: string;
      };

      // ── Step 2: Show pack skeleton ───────────────────────────────────────
      setPack({
        listing1: queuedAsset(listingPrompts[0]),
        listing2: queuedAsset(listingPrompts[1]),
        listing3: queuedAsset(listingPrompts[2]),
        ugc: queuedAsset(ugcPrompt),
        video: queuedAsset(videoPrompt),
        adScript,
      });
      setStage("generating");

      // ── Step 3: Sequential generation ───────────────────────────────────

      setStatusMsg("Generating Listing Image 1 — hero studio shot…");
      await runTask("listing1", {
        type: "image",
        prompt: listingPrompts[0],
        aspectRatio: "1:1",
      });

      if (abortRef.current) return;
      setStatusMsg("Listing 1 ready ✓ — generating Listing Image 2…");
      await runTask("listing2", {
        type: "image",
        prompt: listingPrompts[1],
        aspectRatio: "1:1",
      });

      if (abortRef.current) return;
      setStatusMsg("Listing 2 ready ✓ — generating Listing Image 3…");
      await runTask("listing3", {
        type: "image",
        prompt: listingPrompts[2],
        aspectRatio: "1:1",
      });

      if (abortRef.current) return;
      setStatusMsg("Listing 3 ready ✓ — generating UGC lifestyle photo…");
      const ugcUrl = await runTask("ugc", {
        type: "image",
        prompt: ugcPrompt,
        aspectRatio: "9:16",
      });

      if (abortRef.current) return;
      setStatusMsg("UGC photo ready ✓ — generating 5-second video with Kling 2.6…");
      await runTask("video", {
        type: "video",
        prompt: videoPrompt,
        imageUrl: ugcUrl,
      });

      if (abortRef.current) return;
      setStatusMsg("Your ad pack is complete ✓");
      setStage("done");
    } catch (err) {
      if (abortRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
      setStatusMsg("");
    }
  }

  const isGenerating = stage === "analyzing" || stage === "generating";

  const doneCount = pack
    ? (["listing1", "listing2", "listing3", "ugc", "video"] as (keyof AdPack)[])
        .filter((k) => (pack[k] as Asset).status === "done").length
    : 0;

  const stepStatuses = pack
    ? ([
        pack.listing1.status,
        pack.listing2.status,
        pack.listing3.status,
        pack.ugc.status,
        pack.video.status,
      ] as AssetStatus[])
    : (["idle", "idle", "idle", "idle", "idle"] as AssetStatus[]);

  const steps = [
    { label: "Listing 1", status: stepStatuses[0] },
    { label: "Listing 2", status: stepStatuses[1] },
    { label: "Listing 3", status: stepStatuses[2] },
    { label: "UGC Photo", status: stepStatuses[3] },
    { label: "Video",     status: stepStatuses[4] },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-20">
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

            {/* Status narration */}
            {(isGenerating || stage === "done") && (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: stage === "done" ? "#000" : "#6F6F6F", minHeight: 20 }}
              >
                {isGenerating && (
                  <Loader2 size={13} className="animate-spin flex-shrink-0" />
                )}
                <span style={{ fontFamily: "var(--font-inter)" }}>
                  {getStatusText(stage, pack, statusMsg)}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!image || isGenerating}
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
              Uses 5 KIEAI tasks · 3 listing images + 1 UGC photo + 1 video
            </p>
          </div>

          {/* ── Right panel ── */}
          {pack ? (
            <div className="flex flex-col gap-8">

              {/* Step tracker */}
              <div className="py-2">
                <StepTracker steps={steps} />
              </div>

              {/* Listing images row */}
              <div>
                <p
                  className="text-[10px] font-medium tracking-widest uppercase mb-4"
                  style={{ color: "#a1a1aa" }}
                >
                  Amazon Listing Images
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <AssetCard
                    label="Listing 1"
                    type="image"
                    status={pack.listing1.status}
                    url={pack.listing1.url}
                    prompt={pack.listing1.prompt}
                  />
                  <AssetCard
                    label="Listing 2"
                    type="image"
                    status={pack.listing2.status}
                    url={pack.listing2.url}
                    prompt={pack.listing2.prompt}
                  />
                  <AssetCard
                    label="Listing 3"
                    type="image"
                    status={pack.listing3.status}
                    url={pack.listing3.url}
                    prompt={pack.listing3.prompt}
                  />
                </div>
              </div>

              {/* UGC photo + video row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-[10px] font-medium tracking-widest uppercase mb-4"
                    style={{ color: "#a1a1aa" }}
                  >
                    UGC Lifestyle Photo
                  </p>
                  <AssetCard
                    label="UGC Photo"
                    type="image"
                    status={pack.ugc.status}
                    url={pack.ugc.url}
                    prompt={pack.ugc.prompt}
                  />
                </div>
                <div>
                  <p
                    className="text-[10px] font-medium tracking-widest uppercase mb-4"
                    style={{ color: "#a1a1aa" }}
                  >
                    UGC Video
                  </p>
                  <AssetCard
                    label="Video"
                    type="video"
                    status={pack.video.status}
                    url={pack.video.url}
                    prompt={pack.video.prompt}
                  />
                </div>
              </div>

              {/* Ad Script */}
              {pack.adScript && (
                <ScriptCard script={pack.adScript} loading={false} />
              )}

              {/* Download All */}
              {doneCount > 0 && (
                <div className="pt-2 border-t border-black/[0.06]">
                  <button
                    onClick={() => downloadAll(pack)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 py-3 text-sm font-medium transition-all hover:bg-black hover:text-white hover:border-black"
                    style={{
                      color: "#000",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <Download size={14} />
                    {doneCount === 5
                      ? "Download Full Pack (5/5)"
                      : `Download Ready (${doneCount}/5)`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.08] min-h-[480px]">
              <p className="text-sm" style={{ color: "#d4d4d8" }}>
                Your ad pack will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
