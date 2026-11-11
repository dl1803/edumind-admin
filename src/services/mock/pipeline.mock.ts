import { PIPELINE_STEP_ORDER } from "@/lib/pipeline";
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
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 30 },
    transcode: PENDING,
    transcribe: PENDING,
    index: PENDING,
  },
  processing: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 30 },
    transcode: { status: "processing", progress: 30, startSec: 30, endSec: null },
    transcribe: PENDING,
    index: PENDING,
  },
  completed: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 30 },
    transcode: { status: "completed", progress: 100, startSec: 30, endSec: 75 },
    transcribe: { status: "completed", progress: 100, startSec: 75, endSec: 140 },
    index: { status: "completed", progress: 100, startSec: 140, endSec: 170 },
  },
  failed: {
    upload: { status: "completed", progress: 100, startSec: 0, endSec: 30 },
    transcode: { status: "completed", progress: 100, startSec: 30, endSec: 75 },
    transcribe: {
      status: "failed",
      progress: 45,
      startSec: 75,
      endSec: 110,
      errorMessage: "Không nhận diện được giọng nói trong video.",
    },
    index: PENDING,
  },
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function offsetTime(base: string, seconds: number): string {
  return new Date(new Date(base).getTime() + seconds * 1000).toISOString();
}

function buildPipeline(video: VideoListItem): VideoPipeline {
  const seeds = STEP_SEEDS[video.overallStatus];
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

