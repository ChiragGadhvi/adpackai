"use client";

type AssetStatus = "idle" | "queued" | "generating" | "done" | "failed";

interface Step {
  label: string;
  status: AssetStatus;
}

interface StepTrackerProps {
  steps: Step[];
}

export function StepTracker({ steps }: StepTrackerProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          {/* Circle + label */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div className="relative flex items-center justify-center">
              {/* Pulse ring for generating */}
              {step.status === "generating" && (
                <span
                  className="absolute rounded-full border-2 border-black animate-ping"
                  style={{ width: 28, height: 28, animationDuration: "1.2s" }}
                />
              )}
              <div
                className="relative flex items-center justify-center rounded-full transition-all duration-500"
                style={{
                  width: 24,
                  height: 24,
                  background:
                    step.status === "done"
                      ? "#000"
                      : step.status === "generating"
                        ? "#000"
                        : step.status === "failed"
                          ? "#ef4444"
                          : "#e4e4e7",
                  border: step.status === "idle" || step.status === "queued"
                    ? "2px solid #d4d4d8"
                    : "none",
                }}
              >
                {step.status === "done" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {step.status === "generating" && (
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v2M5 7v2M1 5h2M7 5h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                {step.status === "failed" && (
                  <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✕</span>
                )}
                {(step.status === "idle" || step.status === "queued") && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#a1a1aa",
                      display: "block",
                    }}
                  />
                )}
              </div>
            </div>
            <span
              className="text-center leading-tight"
              style={{
                fontSize: "0.6rem",
                fontFamily: "var(--font-inter)",
                color:
                  step.status === "done"
                    ? "#000"
                    : step.status === "generating"
                      ? "#000"
                      : "#a1a1aa",
                fontWeight: step.status === "generating" ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className="flex-1 mx-2 transition-all duration-500"
              style={{
                height: 1,
                marginBottom: 18,
                background:
                  steps[i + 1].status !== "idle" && steps[i + 1].status !== "queued"
                    ? "#000"
                    : "#e4e4e7",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
