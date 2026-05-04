"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

const SAMPLES = [
  { file: "/samples/facewash.jpeg",  mimeType: "image/jpeg", label: "Face Wash" },
  { file: "/samples/perfume.webp",   mimeType: "image/webp", label: "Perfume" },
  { file: "/samples/coffe.webp",     mimeType: "image/webp", label: "Coffee" },
  { file: "/samples/mouthwash.webp", mimeType: "image/webp", label: "Mouthwash" },
  { file: "/samples/dogfood.webp",   mimeType: "image/webp", label: "Dog Food" },
];

export function UploadZone({ onImageSelect, preview, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      onImageSelect(base64, file.type, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function pickSample(sample: typeof SAMPLES[number]) {
    setLoadingSample(sample.file);
    try {
      const res = await fetch(sample.file);
      const arrayBuf = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const dataUrl = `data:${sample.mimeType};base64,${base64}`;
      onImageSelect(base64, sample.mimeType, dataUrl);
    } catch { /* ignore */ }
    setLoadingSample(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-black/[0.08] aspect-square bg-zinc-50 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Product" className="w-full h-full object-contain p-3" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
          dragging
            ? "border-black/30 bg-black/5"
            : "border-black/[0.12] hover:border-black/25 hover:bg-black/[0.02]"
        )}
      >
        <div className="rounded-full bg-zinc-100 p-3">
          <Upload size={20} style={{ color: "#6F6F6F" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "#000" }}>Drop product image here</p>
          <p className="text-xs mt-1" style={{ color: "#6F6F6F" }}>or click to browse — JPG, PNG, WebP</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>

      {/* Sample products */}
      <div>
        <p className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: "#a1a1aa" }}>
          Or try a sample
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.file}
              onClick={() => pickSample(s)}
              disabled={loadingSample === s.file}
              className="relative rounded-lg overflow-hidden border border-black/[0.08] aspect-square bg-zinc-50 hover:border-black/30 hover:bg-zinc-100 transition-all disabled:opacity-50"
              title={s.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.file} alt={s.label} className="w-full h-full object-contain p-1" />
              {loadingSample === s.file && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                  <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
