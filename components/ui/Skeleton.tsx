"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "image" | "video" | "text" | "block";
}

export function Skeleton({ className, variant = "block" }: SkeletonProps) {
  const base = "rounded-xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200";

  const variants = {
    image: "aspect-square w-full rounded-xl",
    video: "aspect-video w-full rounded-xl",
    text: "h-4 w-full rounded-md",
    block: "w-full rounded-xl",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s infinite linear",
      }}
    />
  );
}

export function ImageSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "#6F6F6F" }}
        >
          {label}
        </p>
      )}
      <Skeleton variant="image" />
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-medium tracking-wider uppercase"
        style={{ color: "#6F6F6F" }}
      >
        UGC Video
      </p>
      <Skeleton variant="video" />
    </div>
  );
}

export function ScriptSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-medium tracking-wider uppercase"
        style={{ color: "#6F6F6F" }}
      >
        Ad Script
      </p>
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-black/[0.06] bg-zinc-50">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}
