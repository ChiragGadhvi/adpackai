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
        <div className="mx-auto max-w-6xl px-8 h-16 flex items-center justify-between">
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

          <Link
            href="#"
            className="transition-opacity hover:opacity-50"
            aria-label="GitHub"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </Link>
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
