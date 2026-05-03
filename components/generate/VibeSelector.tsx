"use client";

import { cn } from "@/lib/utils";
import type { Vibe } from "@/lib/prompts";

const VIBES: { value: Vibe; label: string; emoji: string }[] = [
  { value: "Gym", label: "Gym", emoji: "🏋️" },
  { value: "Car", label: "Car", emoji: "🚗" },
  { value: "Home", label: "Home", emoji: "🏠" },
  { value: "Luxury", label: "Luxury", emoji: "✨" },
];

interface VibeSelectorProps {
  selected: Vibe;
  onChange: (vibe: Vibe) => void;
}

export function VibeSelector({ selected, onChange }: VibeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
        Vibe
      </label>
      <div className="flex gap-2 flex-wrap">
        {VIBES.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => onChange(v.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
              selected === v.value
                ? "bg-black text-white border-black"
                : "bg-transparent border-black/10 hover:border-black/30"
            )}
            style={{
              color: selected === v.value ? "#fff" : "#6F6F6F",
              fontFamily: "var(--font-inter)",
            }}
          >
            {v.emoji} {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
