"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselAsset {
  url: string;
  type: "image" | "video";
  label: string;
}

interface CarouselProps {
  assets: CarouselAsset[];
  startIndex: number;
  onClose: () => void;
}

export function Carousel({ assets, startIndex, onClose }: CarouselProps) {
  const [index, setIndex] = useState(startIndex);

  const current = assets[index];
  const total = assets.length;

  function prev() { setIndex((i) => (i - 1 + total) % total); }
  function next() { setIndex((i) => (i + 1) % total); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-white/10 z-10"
        style={{ color: "white" }}
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", color: "white", fontFamily: "var(--font-inter)" }}
      >
        {current.label} &nbsp;·&nbsp; {index + 1} / {total}
      </div>

      {/* Prev arrow */}
      {total > 1 && (
        <button
          className="absolute left-4 rounded-full p-2.5 transition-colors hover:bg-white/10 z-10"
          style={{ color: "white" }}
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Asset */}
      <div
        className="flex items-center justify-center"
        style={{ maxWidth: "88vw", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === "image" ? (
          <img
            key={current.url}
            src={current.url}
            alt={current.label}
            className="rounded-xl object-contain"
            style={{ maxWidth: "88vw", maxHeight: "88vh" }}
          />
        ) : (
          <video
            key={current.url}
            src={current.url}
            controls
            autoPlay
            loop
            playsInline
            className="rounded-xl"
            style={{ maxWidth: "88vw", maxHeight: "88vh" }}
          />
        )}
      </div>

      {/* Next arrow */}
      {total > 1 && (
        <button
          className="absolute right-4 rounded-full p-2.5 transition-colors hover:bg-white/10 z-10"
          style={{ color: "white" }}
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {assets.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className="rounded-full transition-all"
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                background: i === index ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
