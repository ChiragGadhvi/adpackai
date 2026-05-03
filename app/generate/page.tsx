"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Zap, AlertCircle } from "lucide-react";
import { UploadZone } from "@/components/generate/UploadZone";
import { VibeSelector } from "@/components/generate/VibeSelector";
import { ImageCard } from "@/components/generate/ImageCard";
import { VideoPlayer } from "@/components/generate/VideoPlayer";
import { ScriptCard } from "@/components/generate/ScriptCard";
import { Navbar } from "@/components/ui/Navbar";
import type { Vibe } from "@/lib/prompts";

type Stage =
  | "idle"
  | "analyzing"
  | "submitting"
  | "polling"
  | "done"
  | "error";

interface TaskState {
  taskId?: string;
  url?: string;
  loading: boolean;
}

interface AdPackState {
  listing: [TaskState, TaskState, TaskState];
  ugc: TaskState;
  video: TaskState;
  script?: string;
}

const emptyTask = (): TaskState => ({ loading: true });

const INITIAL_PACK: AdPackState = {
  listing: [emptyTask(), emptyTask(), emptyTask()],
  ugc: emptyTask(),
  video: emptyTask(),
};

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  analyzing: "Analyzing product...",
  submitting: "Submitting to AI...",
  polling: "Generating creatives...",
  done: "Ad pack ready!",
  error: "Something went wrong",
};

export default function GeneratePage() {
  const [image, setImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [vibe, setVibe] = useState<Vibe>("Home");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<AdPackState | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  async function pollTask(taskId: string): Promise<string | null> {
    const res = await fetch(`/api/task-status?taskId=${taskId}`);
    const data = await res.json();
    if (data.status === "completed" && data.outputUrl) return data.outputUrl as string;
    if (data.status === "failed") throw new Error(`Task ${taskId} failed`);
    return null;
  }

  async function startPolling(
    taskIds: { listing: [string, string, string]; ugc: string },
    videoPrompt: string,
    script: string
  ) {
    setStage("polling");

    let resolved = {
      l0: false, l1: false, l2: false,
      ugc: false, video: false,
      videoSubmitted: false,
      videoTaskId: "",
    };

    pollRef.current = setInterval(async () => {
      try {
        // Poll listing images
        for (let i = 0; i < 3; i++) {
          const key = `l${i}` as "l0" | "l1" | "l2";
          if (!resolved[key]) {
            const url = await pollTask(taskIds.listing[i]);
            if (url) {
              resolved[key] = true;
              setPack((prev) => {
                if (!prev) return prev;
                const listing = [...prev.listing] as AdPackState["listing"];
                listing[i] = { loading: false, url, taskId: taskIds.listing[i] };
                return { ...prev, listing };
              });
            }
          }
        }

        // Poll UGC image
        if (!resolved.ugc) {
          const url = await pollTask(taskIds.ugc);
          if (url) {
            resolved.ugc = true;
            setPack((prev) =>
              prev ? { ...prev, ugc: { loading: false, url, taskId: taskIds.ugc } } : prev
            );

            // Submit video task once UGC image is ready
            if (!resolved.videoSubmitted) {
              resolved.videoSubmitted = true;
              const vRes = await fetch("/api/generate-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoPrompt, imageUrl: url }),
              });
              const vData = await vRes.json();
              if (vData.taskId) {
                resolved.videoTaskId = vData.taskId;
              }
            }
          }
        }

        // Poll video
        if (resolved.videoTaskId && !resolved.video) {
          const url = await pollTask(resolved.videoTaskId);
          if (url) {
            resolved.video = true;
            setPack((prev) =>
              prev ? { ...prev, video: { loading: false, url, taskId: resolved.videoTaskId } } : prev
            );
          }
        }

        // Check if everything is done
        const allDone =
          resolved.l0 && resolved.l1 && resolved.l2 &&
          resolved.ugc && resolved.video;

        if (allDone) {
          stopPolling();
          setStage("done");
        }
      } catch (err) {
        stopPolling();
        setError(err instanceof Error ? err.message : "Polling failed");
        setStage("error");
      }
    }, 5000);
  }

  async function handleGenerate() {
    if (!image) return;
    setError(null);
    setStage("analyzing");

    try {
      // Step 1: analyze
      const aRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.base64, mimeType: image.mimeType, vibe }),
      });
      const aData = await aRes.json();
      if (!aRes.ok) throw new Error(aData.error ?? "Analysis failed");

      const { listingPrompts, ugcPrompt, videoPrompt, adScript } = aData;

      // Show skeleton output panel immediately
      setPack({ ...INITIAL_PACK, script: adScript });
      setStage("submitting");

      // Step 2: submit image tasks
      const iRes = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingPrompts, ugcPrompt }),
      });
      const iData = await iRes.json();
      if (!iRes.ok) throw new Error(iData.error ?? "Image submission failed");

      // Step 3: start polling (video submitted later once UGC is done)
      await startPolling(iData.taskIds, videoPrompt, adScript);
    } catch (err) {
      stopPolling();
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  const isGenerating = stage === "analyzing" || stage === "submitting" || stage === "polling";

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="mb-10">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-instrument)", fontSize: "2rem", color: "#000" }}
          >
            Generate Ad Pack
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6F6F6F" }}>
            Upload a product image and get Amazon listings + UGC content in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* ── Input panel ── */}
          <div className="flex flex-col gap-5">
            <UploadZone
              onImageSelect={(base64, mimeType, preview) =>
                setImage({ base64, mimeType, preview })
              }
              preview={image?.preview ?? null}
              onClear={() => { setImage(null); setPack(null); setStage("idle"); }}
            />

            <VibeSelector selected={vibe} onChange={setVibe} />

            {/* Credit notice */}
            <p className="text-[11px] text-zinc-600">
              Uses ~5 KIEAI tasks (3 listing images + 1 UGC photo + 1 video)
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!image || isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#000000", fontFamily: "var(--font-inter)" }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {STAGE_LABELS[stage]}
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Generate Ad Pack
                </>
              )}
            </button>
          </div>

          {/* ── Output panel ── */}
          {pack ? (
            <div className="flex flex-col gap-8">
              {/* Listing images */}
              <div>
                <p className="text-xs font-medium tracking-widest text-zinc-600 uppercase mb-4">
                  Listing Images
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pack.listing.map((t, i) => (
                    <ImageCard
                      key={i}
                      label={`Listing ${i + 1}`}
                      url={t.url}
                      loading={t.loading}
                    />
                  ))}
                </div>
              </div>

              {/* UGC + Video row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageCard
                  label="UGC Lifestyle"
                  url={pack.ugc.url}
                  loading={pack.ugc.loading}
                />
                <VideoPlayer
                  url={pack.video.url}
                  loading={pack.video.loading}
                />
              </div>

              {/* Ad Script */}
              <ScriptCard script={pack.script} loading={!pack.script} />
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-black/[0.06] bg-zinc-50 min-h-[400px]">
              <p className="text-sm" style={{ color: "#6F6F6F" }}>Your ad pack will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
