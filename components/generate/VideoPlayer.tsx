"use client";

import { Download } from "lucide-react";
import { VideoSkeleton } from "@/components/ui/Skeleton";

interface VideoPlayerProps {
  url?: string;
  loading?: boolean;
}

export function VideoPlayer({ url, loading }: VideoPlayerProps) {
  if (loading || !url) {
    return <VideoSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "#6F6F6F" }}
        >
          UGC Video
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
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/[0.06] bg-zinc-50">
        <video
          src={url}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
