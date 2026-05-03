"use client";

import Link from "next/link";

function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#000000" />
      <line x1="11" y1="11" x2="29" y2="29" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="29" y1="11" x2="11" y2="29" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.5" fill="white" />
    </svg>
  );
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span
            style={{
              fontFamily: "var(--font-instrument)",
              fontSize: "1.15rem",
              letterSpacing: "-0.02em",
              color: "#000",
              lineHeight: 1,
            }}
          >
            AdPack<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
          </span>
        </Link>
        <Link
          href="/generate"
          className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Generate Ad Pack →
        </Link>
      </div>
    </nav>
  );
}
