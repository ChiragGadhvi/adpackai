"use client";

import { ArrowRight } from "lucide-react";

const OUTPUTS = [
  { label: "Amazon Listing", desc: "Studio-quality, white bg" },
  { label: "UGC Lifestyle", desc: "Authentic, feed-ready" },
  { label: "UGC Video", desc: "5-sec TikTok-style" },
];

export function Demo() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium tracking-widest text-zinc-600 uppercase mb-3">
            Before &amp; After
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            One image. Complete ad pack.
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Before */}
          <div className="w-full md:w-64 flex-shrink-0">
            <p className="text-xs font-medium tracking-wider text-zinc-600 uppercase mb-3">
              Input
            </p>
            <div className="aspect-square rounded-2xl border border-white/10 bg-zinc-900 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-sm text-zinc-500 text-center">Your product photo</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-zinc-700">
            <ArrowRight size={28} />
          </div>

          {/* After */}
          <div className="flex-1 w-full">
            <p className="text-xs font-medium tracking-wider text-zinc-600 uppercase mb-3">
              Output
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OUTPUTS.map((o, i) => (
                <div
                  key={o.label}
                  className="rounded-2xl border border-white/10 bg-zinc-900 p-4 flex flex-col gap-3"
                >
                  <div
                    className="aspect-square rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 40 + 220} 15% 12%), hsl(${i * 40 + 240} 12% 18%))`,
                    }}
                  >
                    <span className="text-3xl">{["🛍️", "📸", "🎬"][i]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{o.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
