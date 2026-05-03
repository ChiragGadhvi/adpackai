"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

export function UploadZone({ onImageSelect, preview, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

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

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Product" className="w-full h-full object-cover" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
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
  );
}
