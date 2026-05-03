"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
        <Sparkles size={12} className="text-zinc-400" />
        <span className="text-xs text-zinc-400 font-medium">
          AI-powered ad creative generation
        </span>
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
        Turn Any Product Image Into{" "}
        <span className="text-zinc-400">High-Converting</span> Ad Creatives
      </h1>

      {/* Subheadline */}
      <p className="mt-6 max-w-xl text-center text-lg text-zinc-500 leading-relaxed">
        Generate Amazon listing images + UGC lifestyle photos + short videos — all from a single product photo, in seconds.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/generate"
          className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
        >
          Generate Ad Pack
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <p className="text-xs text-zinc-600">No credit card required to preview</p>
      </div>

      {/* Stat pills */}
      <div className="mt-16 flex flex-wrap justify-center gap-6 text-center">
        {[
          { value: "3", label: "Listing Images" },
          { value: "1", label: "UGC Lifestyle Shot" },
          { value: "1", label: "Short Video" },
          { value: "1", label: "Ad Script" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{s.value}</span>
            <span className="text-xs text-zinc-600 mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
