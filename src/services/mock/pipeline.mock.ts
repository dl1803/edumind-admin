import { PIPELINE_STEP_LABELS, PIPELINE_STEP_ORDER } from "@/lib/pipeline";
import { MOCK_VIDEOS } from "./videoList.mock";
import type {
  PipelineStep,
  PipelineStepName,
  PipelineStepStatus,
  VideoListItem,
  VideoOverallStatus,
  VideoPipeline,
} from "@/types/video.types";

interface StepSeed {
  status: PipelineStepStatus;
  progress: number | null;
  startSec: number | null;
  endSec: number | null;
  errorMessage?: string;
}

type StepSeeds = Record<PipelineStepName, StepSeed>;

const PENDING: StepSeed = { status: "pending", progress: null, startSec: null, endSec: null };

const STEP_SEEDS: Record<VideoOverallStatus, StepSeeds> = {
  uploading: {
    upload: { status: "processing", progress: 60, startSec: 0, endSec: null },
    transcode: PENDING,
    transcribe: PENDING,
    index: PENDING,
  },
  uploaded: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 15 },
    transcode: PENDING,
    transcribe: PENDING,
    index: PENDING,
  },
  processing: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 15 },
    transcode: { status: "completed", progress: 100, startSec: 16, endSec: 44 },
    transcribe: { status: "processing", progress: 78, startSec: 46, endSec: null },
    index: PENDING,
  },
  completed: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 12 },
    transcode: { status: "completed", progress: 100, startSec: 12, endSec: 30 },
    transcribe: { status: "completed", progress: 100, startSec: 30, endSec: 52 },
    index: { status: "completed", progress: 100, startSec: 52, endSec: 60 },
  },
  failed: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 14 },
    transcode: { status: "completed", progress: 100, startSec: 14, endSec: 38 },
    transcribe: {
      status: "failed",
      progress: 45,
      startSec: 38,
      endSec: 58,
      errorMessage: "Không nhận diện được giọng nói rõ ràng trong video",
    },
    index: PENDING,
  },
};

const retriedSeeds = new Map<string, StepSeeds>();

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function offsetTime(base: string, seconds: number): string {
  return new Date(new Date(base).getTime() + seconds * 1000).toISOString();
}

function buildPipeline(video: VideoListItem): VideoPipeline {
  const seeds = retriedSeeds.get(video.videoId) ?? STEP_SEEDS[video.overallStatus];
  const steps = PIPELINE_STEP_ORDER.map((name): PipelineStep => {
    const seed = seeds[name];
    return {
      step: name,
      status: seed.status,
      progress: seed.progress,
      errorMessage: seed.errorMessage ?? null,
      startedAt: seed.startSec === null ? null : offsetTime(video.uploadedAt, seed.startSec),
      completedAt: seed.endSec === null ? null : offsetTime(video.uploadedAt, seed.endSec),
    };
  });
  const failedStep = steps.find((step) => step.status === "failed");

  return {
    videoId: video.videoId,
    lessonId: video.lessonId,
    lessonTitle: video.lessonTitle,
    steps,
    overallStatus: video.overallStatus,
    errorMessage: failedStep?.errorMessage ?? null,
    startedAt: steps[0].startedAt,
    completedAt: video.overallStatus === "completed" ? steps[steps.length - 1].completedAt : null,
  };
}

export async function mockGetPipelineStatus(videoId: string): Promise<VideoPipeline | null> {
  await delay(400);
  const video = MOCK_VIDEOS.find((item) => item.videoId === videoId);
  return video ? buildPipeline(video) : null;
}

export async function mockRetryPipelineStep(
  videoId: string,
  step?: PipelineStepName
): Promise<{ message: string; videoId: string }> {
  await delay(400);
  const video = MOCK_VIDEOS.find((item) => item.videoId === videoId);
  if (!video) {
    throw new Error("Video không tồn tại.");
  }
  if (video.overallStatus !== "failed") {
    throw new Error("Chỉ có thể thử lại video đang gặp lỗi.");
  }

  const targetStep =
    step ??
    PIPELINE_STEP_ORDER.find((name) => STEP_SEEDS.failed[name].status === "failed") ??
    "transcribe";

  const targetOrder = PIPELINE_STEP_ORDER.indexOf(targetStep);
  const nextSeeds = { ...STEP_SEEDS.failed };
  PIPELINE_STEP_ORDER.forEach((name, idx) => {
    if (idx < targetOrder) {
      nextSeeds[name] = STEP_SEEDS.failed[name];
    } else if (idx === targetOrder) {
      nextSeeds[name] = { status: "processing", progress: 20, startSec: 60, endSec: null };
    } else {
      nextSeeds[name] = PENDING;
    }
  });

  retriedSeeds.set(video.videoId, nextSeeds);
  video.overallStatus = "processing";

  return {
    message: `Đã bắt đầu xử lý lại bước ${PIPELINE_STEP_LABELS[targetStep]}.`,
    videoId: video.videoId,
  };
}
