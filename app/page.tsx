"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_101827_abebfeec-f243-466b-b494-7f6814c0fbbf.mp4";

function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#000000" />
      <line x1="11" y1="11" x2="29" y2="29" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="29" y1="11" x2="11" y2="29" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.5" fill="white" />
    </svg>
  );
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-full" style={{ height: "100svh", background: "#fff" }}>

      {/* ── Fullscreen video ── */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        loop
        preload="auto"
        className="absolute w-full h-full object-cover pointer-events-none"
        style={{ inset: 0, zIndex: 0 }}
      />

      {/* ── Navbar — transparent, logo left + GitHub right ── */}
      <nav
        className="fixed top-0 left-0 right-0"
        style={{ zIndex: 50 }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span
              style={{
                fontFamily: "var(--font-instrument)",
                fontSize: "1.15rem",
                letterSpacing: "-0.03em",
                color: "#000000",
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
              <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000000" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — vertically centered ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{ zIndex: 10 }}
      >
        <h1
          className="max-w-4xl font-normal"
          style={{
            fontFamily: "var(--font-instrument)",
            fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
            lineHeight: 0.97,
            letterSpacing: "-2px",
            color: "#000000",
            opacity: 0,
            animation: "fade-rise 0.8s ease-out forwards",
          }}
        >
          Turn any product into{" "}
          <em style={{ color: "#6F6F6F", fontStyle: "italic" }}>high-converting</em>{" "}
          ad creatives.
        </h1>

        <p
          className="max-w-lg mt-6 leading-relaxed"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.95rem",
            color: "#6F6F6F",
            opacity: 0,
            animation: "fade-rise 0.8s ease-out 0.2s forwards",
          }}
        >
          Generate Amazon listing images, UGC lifestyle photos, and short
          videos — all from a single product photo.
        </p>

        <Link
          href="/generate"
          className="mt-10 rounded-full font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: "#000000",
            padding: "0.85rem 2.8rem",
            fontSize: "0.875rem",
            fontFamily: "var(--font-inter)",
            opacity: 0,
            animation: "fade-rise 0.8s ease-out 0.4s forwards",
          }}
        >
          Generate Ad Pack
        </Link>
      </div>
    </div>
  );
}
