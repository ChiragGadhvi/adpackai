"use client";

import { useState } from "react";
import { Download, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

type AssetStatus = "idle" | "queued" | "generating" | "done" | "failed";

interface AssetCardProps {
  label: string;
  type: "image" | "video";
  status: AssetStatus;
  url?: string;
  prompt?: string;
  compact?: boolean;
  aspectRatio?: string;
  onView?: () => void;
}

export function AssetCard({ label, type, status, url, prompt, compact = false, aspectRatio, onView }: AssetCardProps) {
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  function copyPrompt() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = label.toLowerCase().replace(/\s+/g, "-") + (type === "video" ? ".mp4" : ".png");
    a.target = "_blank";
    a.click();
  }

  const isDone = status === "done" && !!url;
  const isLoading = status === "queued" || status === "generating";
  const isFailed = status === "failed";

  const resolvedAspectRatio = aspectRatio ?? "1/1";

  return (
    <div className="flex flex-col gap-0" style={{ fontFamily: "var(--font-inter)" }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={compact ? "text-[10px] font-medium uppercase tracking-wider" : "text-xs font-medium tracking-wider uppercase"}
            style={{ color: isDone ? "#000" : "#a1a1aa" }}
          >
            {label}
          </span>
          {status === "generating" && (
            <span className="text-xs" style={{ color: "#6F6F6F", fontStyle: "italic" }}>
              generating…
            </span>
          )}
        </div>

        {isDone && (
          <div className="flex items-center gap-1">
            {prompt && (
              <button
                onClick={copyPrompt}
                title="Copy prompt"
                className="rounded-full p-1.5 transition-colors hover:bg-black/5"
                style={{ color: "#a1a1aa" }}
              >
                {copied ? <Check size={12} style={{ color: "#22c55e" }} /> : <Copy size={12} />}
              </button>
            )}
            <button
              onClick={download}
              title="Download"
              className="rounded-full p-1.5 transition-colors hover:bg-black/5"
              style={{ color: "#a1a1aa" }}
            >
              <Download size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Asset display — skeleton/idle uses fixed aspect ratio; done media shows at natural ratio */}
      {isDone ? (
        <div
          className={`overflow-hidden rounded-xl border relative${onView ? " cursor-zoom-in" : ""}`}
          style={{
            borderColor: "rgba(0,0,0,0.06)",
            background: "#000",
            aspectRatio: !mediaLoaded ? resolvedAspectRatio : undefined,
          }}
          onClick={onView}
        >
          {!mediaLoaded && (
            <div className="absolute inset-0">
              <Skeleton
                variant={type === "video" ? "video" : "image"}
                className="w-full h-full rounded-none"
              />
            </div>
          )}
          {type === "image" ? (
            <img
              src={url}
              alt={label}
              className="w-full h-auto block"
              style={{
                opacity: mediaLoaded ? 1 : 0,
                animation: mediaLoaded ? "fade-rise 0.4s ease-out forwards" : undefined,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => setMediaLoaded(true)}
            />
          ) : (
            <video
              src={url}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto block"
              style={{
                opacity: mediaLoaded ? 1 : 0,
                animation: mediaLoaded ? "fade-rise 0.4s ease-out forwards" : undefined,
                transition: "opacity 0.3s ease",
              }}
              onCanPlay={() => setMediaLoaded(true)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "rgba(0,0,0,0.06)",
            background: "#fafafa",
            aspectRatio: resolvedAspectRatio,
            position: "relative",
          }}
        >
          {isLoading && (
            <div className="absolute inset-0">
              <Skeleton
                variant={type === "video" ? "video" : "image"}
                className="w-full h-full rounded-none"
              />
            </div>
          )}
          {isFailed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs" style={{ color: "#ef4444" }}>Generation failed</p>
            </div>
          )}
          {status === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: "#e4e4e7" }} />
            </div>
          )}
        </div>
      )}

      {/* Prompt drawer */}
      {isDone && prompt && (
        <div className="mt-1.5">
          <button
            onClick={() => setPromptOpen((o) => !o)}
            className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-70"
            style={{ color: "#a1a1aa", fontFamily: "var(--font-inter)" }}
          >
            {promptOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {promptOpen ? "Hide prompt" : "View prompt"}
          </button>
          {promptOpen && (
            <div
              className="mt-1.5 rounded-lg p-3 text-[10px] leading-relaxed"
              style={{
                background: "#f4f4f5",
                color: "#6F6F6F",
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {prompt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
