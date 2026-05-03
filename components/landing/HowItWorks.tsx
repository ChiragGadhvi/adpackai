"use client";

const STEPS = [
  {
    number: "01",
    title: "Upload product",
    desc: "Drop in any product photo — JPG, PNG, or WebP. We handle the rest.",
  },
  {
    number: "02",
    title: "AI understands it",
    desc: "Gemini analyzes your product, extracts benefits, and builds the perfect prompts.",
  },
  {
    number: "03",
    title: "Get your ad pack",
    desc: "Listing images, UGC photo, video, and ad script — ready to publish.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium tracking-widest text-zinc-600 uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Three steps to launch-ready content
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-white/[0.07]" />

          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex-1 flex flex-col items-center text-center px-4">
              {/* Number circle */}
              <div className="relative z-10 w-16 h-16 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center mb-5">
                <span className="text-sm font-mono font-bold text-zinc-400">{step.number}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-[200px]">{step.desc}</p>

              {/* Mobile connector */}
              {i < STEPS.length - 1 && (
                <div className="md:hidden mt-6 w-px h-8 bg-white/[0.07]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
