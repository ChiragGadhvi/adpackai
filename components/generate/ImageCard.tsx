"use client";

import { Download } from "lucide-react";
import { ImageSkeleton } from "@/components/ui/Skeleton";

interface ImageCardProps {
  label: string;
  url?: string;
  loading?: boolean;
}

export function ImageCard({ label, url, loading }: ImageCardProps) {
  if (loading || !url) {
    return <ImageSkeleton label={label} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "#6F6F6F" }}
        >
          {label}
        </p>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-1.5 transition-colors hover:bg-black/5"
          style={{ color: "#6F6F6F" }}
        >
          <Download size={12} />
        </a>
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/[0.06] bg-zinc-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
