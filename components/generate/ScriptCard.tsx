"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { ScriptSkeleton } from "@/components/ui/Skeleton";

interface ScriptCardProps {
  script?: string;
  loading?: boolean;
}

export function ScriptCard({ script, loading }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);

  if (loading || !script) {
    return <ScriptSkeleton />;
  }

  function copy() {
    navigator.clipboard.writeText(script!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "#6F6F6F" }}
        >
          Ad Script
        </p>
        <button
          onClick={copy}
          className="rounded-full p-1.5 transition-colors hover:bg-black/5"
          style={{ color: "#6F6F6F" }}
        >
          {copied ? (
            <Check size={12} style={{ color: "#22c55e" }} />
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>
      <div className="rounded-xl border border-black/[0.06] bg-zinc-50 p-4">
        <p
          className="text-sm leading-relaxed italic"
          style={{ color: "#000", fontFamily: "var(--font-instrument)" }}
        >
          &ldquo;{script}&rdquo;
        </p>
      </div>
    </div>
  );
}
