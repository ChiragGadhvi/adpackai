const KIEAI_BASE = "https://api.kie.ai";

function headers() {
  return {
    Authorization: `Bearer ${process.env.KIEAI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function createImageTask(
  prompt: string,
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1",
  resolution: "1K" | "2K" = "2K",
  model = "gpt-image-2-text-to-image",
  referenceImageUrl?: string
): Promise<string> {
  const input: Record<string, unknown> = { prompt, aspect_ratio: aspectRatio, resolution };
  if (referenceImageUrl) input.image_url = referenceImageUrl;

  const res = await fetch(`${KIEAI_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model, input }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 200) {
    throw new Error(`KIEAI image task error ${data.code}: ${data.msg ?? "unknown"}`);
  }
  return data.data.taskId as string;
}

export async function createVideoTask(
  prompt: string,
  imageUrl: string
): Promise<string> {
  const res = await fetch(`${KIEAI_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "kling-2.6/image-to-video",
      input: {
        prompt,
        image_urls: [imageUrl],
        sound: true,
        duration: "5",
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 200) {
    throw new Error(`KIEAI video task error ${data.code}: ${data.msg ?? "unknown"}`);
  }
  return data.data.taskId as string;
}

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface TaskResult {
  status: TaskStatus;
  outputUrl?: string;
  error?: string;
}

export async function getTaskStatus(taskId: string): Promise<TaskResult> {
  const res = await fetch(
    `${KIEAI_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`,
    { headers: headers() }
  );

  const data = await res.json();

  if (!res.ok || data.code !== 200) {
    return { status: "failed", error: `${data.code}: ${data.msg}` };
  }

  const task = data.data;
  // API states: waiting | queuing | generating | success | fail
  const state: string = (task.state ?? "").toLowerCase();

  const status: TaskStatus =
    state === "success"
      ? "completed"
      : state === "fail"
      ? "failed"
      : state === "generating" || state === "queuing"
      ? "processing"
      : "pending";

  // resultJson is a JSON string: {"resultUrls":["https://..."]}
  let outputUrl: string | undefined;
  if (state === "success" && task.resultJson) {
    try {
      const result = JSON.parse(task.resultJson as string);
      outputUrl = result.resultUrls?.[0];
    } catch {
      // ignore parse error
    }
  }

  return { status, outputUrl };
}
