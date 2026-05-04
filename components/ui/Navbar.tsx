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
      <div className="mx-auto max-w-6xl px-4 sm:px-8 h-14 flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <Link
            href="https://chiraggadhvi.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-60"
            aria-label="Chirag Gadhvi"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chirag.svg" alt="Chirag Gadhvi" width={26} height={26} style={{ borderRadius: "50%" }} />
          </Link>
          <Link
            href="https://github.com/ChiragGadhvi/adpackai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-50"
            aria-label="GitHub"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#000000" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
