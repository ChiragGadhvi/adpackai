const KIEAI_BASE = "https://api.kie.ai";

function headers() {
  return {
    Authorization: `Bearer ${process.env.KIEAI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function submitImageTask(
  model: string,
  prompt: string,
  aspectRatio: "1:1" | "9:16" | "16:9",
  resolution: "1K" | "2K"
): Promise<string | null> {
  const res = await fetch(`${KIEAI_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      input: { prompt, aspect_ratio: aspectRatio, resolution },
    }),
  });
  const data = await res.json();
  if (res.ok && data.code === 200) return data.data.taskId as string;
  console.error(`[kieai] ${model} failed: ${data.code} ${data.msg}`);
  return null;
}

export type ImageModel = "nano-banana-2" | "gpt-image-2-text-to-image";

export async function createImageTask(
  prompt: string,
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1",
  resolution: "1K" | "2K" = "2K",
  preferModel?: ImageModel
): Promise<string> {
  // nano-banana-2 (Google) is default primary — higher quality, better prompt adherence
  const order: ImageModel[] = preferModel === "gpt-image-2-text-to-image"
    ? ["gpt-image-2-text-to-image", "nano-banana-2"]
    : ["nano-banana-2", "gpt-image-2-text-to-image"];

  for (const model of order) {
    const taskId = await submitImageTask(model, prompt, aspectRatio, resolution);
    if (taskId) return taskId;
  }

  throw new Error("Image task creation failed on all models");
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
        sound: false,
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
    `${KIEAI_BASE}/api/v1/jobs/getTask?taskId=${taskId}`,
    { headers: headers() }
  );

  const data = await res.json();

  if (!res.ok || data.code !== 200) {
    return { status: "failed", error: `${data.code}: ${data.msg}` };
  }

  const task = data.data;
  const rawStatus: string = (task.status ?? task.taskStatus ?? "").toLowerCase();

  const status: TaskStatus =
    rawStatus.includes("complete") || rawStatus.includes("success") || rawStatus === "finished"
      ? "completed"
      : rawStatus.includes("fail") || rawStatus.includes("error")
      ? "failed"
      : rawStatus.includes("process") || rawStatus.includes("running") || rawStatus.includes("queue")
      ? "processing"
      : "pending";

  const outputUrl: string | undefined =
    task.output?.url ??
    task.output?.imageUrl ??
    task.output?.videoUrl ??
    task.resultUrl ??
    task.output?.[0]?.url ??
    undefined;

  return { status, outputUrl };
}
