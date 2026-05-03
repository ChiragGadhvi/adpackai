"use client";

import { ShoppingBag, Camera, Video, Smartphone } from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Listing Images",
    desc: "Amazon-ready product photos with studio lighting, white backgrounds, and benefit callouts.",
  },
  {
    icon: Camera,
    title: "UGC Lifestyle Shots",
    desc: "Authentic-looking lifestyle photos showing your product being used in real environments.",
  },
  {
    icon: Video,
    title: "AI UGC Video",
    desc: "5-second Kling-powered videos with handheld style, candid moments, and natural reactions.",
  },
  {
    icon: Smartphone,
    title: "Feed-First Content",
    desc: "Every asset is optimized for Instagram, TikTok, and Amazon — square, portrait, and landscape.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium tracking-widest text-zinc-600 uppercase mb-3">
            What you get
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Everything you need to launch
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 flex flex-col gap-4 hover:border-white/[0.15] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Icon size={16} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
