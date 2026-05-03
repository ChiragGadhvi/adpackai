"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Start generating your first ad pack
        </h2>
        <p className="mt-4 text-zinc-500 text-lg">
          One product image. Amazon listings + UGC content + video. Done in seconds.
        </p>
        <div className="mt-10">
          <Link
            href="/generate"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            Generate Ad Pack
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
