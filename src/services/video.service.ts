import axios from "axios";
import { apiClient } from "./api-client";
import { PaginatedResponse } from "@/types/api.types";
import { PIPELINE_STEP_ORDER, findFailedPipelineStep } from "@/lib/pipeline";
import { mockGetVideos } from "./mock/videoList.mock";
import {
  mockCancelPipeline,
  mockGetPipelineStatus,
  mockRetryPipelineStep,
} from "./mock/pipeline.mock";
import {
  BackendCancelUploadResponse,
  BackendCompleteUploadResponse,
  BackendInitUploadResponse,
  BackendPartUrlResponse,
  BackendPipelineListResponse,
  BackendPipelineStatus,
  BackendPipelineStep,
  BackendRetryPipelineResponse,
  CancelUploadResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  InitUploadRequest,
  InitUploadResponse,
  PartUrlRequest,
  PartUrlResponse,
  PipelineStep,
  PipelineStepName,
  PipelineStepStatus,
  VideoListItem,
  VideoListParams,
  VideoOverallStatus,
  VideoPipeline,
} from "@/types/video.types";

function unwrap<T>(body: unknown, requiredKey: string): T {
  if (body && typeof body === "object" && !(requiredKey in body) && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

const DEFAULT_VIDEO_PAGE_SIZE = 10;

const OVERALL_STATUSES: VideoOverallStatus[] = [
  "uploading",
  "uploaded",
  "processing",
  "completed",
  "failed",
];

const STEP_STATUSES: PipelineStepStatus[] = ["pending", "processing", "completed", "failed"];

export function isVideoMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

function normalizeStepName(value: string | undefined): PipelineStepName | null {
  const name = (value ?? "").toLowerCase();
  if (name === "stt") return "transcribe";
  return PIPELINE_STEP_ORDER.find((candidate) => candidate === name) ?? null;
}

function normalizeStepStatus(value: string | undefined): PipelineStepStatus {
  const status = (value ?? "").toLowerCase();
  return STEP_STATUSES.find((candidate) => candidate === status) ?? "pending";
}

function mapPipelineStep(raw: BackendPipelineStep | null | undefined): PipelineStep | null {
  if (!raw || typeof raw !== "object") return null;
  const step = normalizeStepName(raw.step);
  if (!step) return null;
  return {
    step,
    status: normalizeStepStatus(raw.status),
    progress: typeof raw.progress === "number" ? raw.progress : null,
    errorMessage: raw.error_message ?? null,
    startedAt: raw.started_at ?? null,
    completedAt: raw.completed_at ?? null,
  };
}

function deriveOverallStatus(steps: PipelineStep[]): VideoOverallStatus {
  if (steps.some((item) => item.status === "failed")) return "failed";
  if (
    steps.length === PIPELINE_STEP_ORDER.length &&
    steps.every((item) => item.status === "completed")
  ) {
    return "completed";
  }
  const upload = steps.find((item) => item.step === "upload");
  if (upload?.status !== "completed") return "uploading";
  return steps.some((item) => item.status === "processing") ? "processing" : "uploaded";
}

function resolveOverallStatus(value: string | undefined, steps: PipelineStep[]): VideoOverallStatus {
  const status = (value ?? "").toLowerCase();
  return OVERALL_STATUSES.find((candidate) => candidate === status) ?? deriveOverallStatus(steps);
}

export function mapPipelineResponse(raw: BackendPipelineStatus | null | undefined): VideoPipeline {
  if (!raw || typeof raw !== "object") {
    throw new Error("Phản hồi trạng thái pipeline không hợp lệ hoặc rỗng.");
  }
  const steps = (Array.isArray(raw.steps) ? raw.steps : [])
    .map(mapPipelineStep)
    .filter((item): item is PipelineStep => item !== null);
  return {
    videoId: raw.video_id,
    lessonId: raw.lesson_id ?? "",
    lessonTitle: raw.lesson_title ?? "",
    steps,
    overallStatus: resolveOverallStatus(raw.overall_status, steps),
    errorMessage: raw.error_message ?? null,
    startedAt: raw.started_at ?? null,
    completedAt: raw.completed_at ?? null,
  };
}

export function mapVideoListItem(raw: BackendPipelineStatus): VideoListItem {
  const pipeline = mapPipelineResponse(raw);
  return {
    videoId: pipeline.videoId,
    lessonId: pipeline.lessonId,
    lessonTitle: pipeline.lessonTitle,
    overallStatus: pipeline.overallStatus,
    thumbnailUrl: null,
    durationSec: null,
    uploadedAt: pipeline.startedAt ?? "",
  };
}

async function fetchPipelineStatus(videoId: string): Promise<VideoPipeline | null> {
  try {
    const response = await apiClient.get<unknown>(
      `/admin/pipeline/${encodeURIComponent(videoId)}/status`
    );
    return mapPipelineResponse(unwrap<BackendPipelineStatus>(response.data, "overall_status"));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

async function resolveRetryStep(
  videoId: string,
  step?: PipelineStepName
): Promise<PipelineStepName> {
  if (step) return step;
  const pipeline = await fetchPipelineStatus(videoId);
  return (pipeline && findFailedPipelineStep(pipeline.steps)?.step.step) || "transcribe";
}

export const videoService = {
  async initUpload(request: InitUploadRequest): Promise<InitUploadResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload/init", {
      lesson_id: request.lessonId,
      file_name: request.fileName,
      file_size: request.fileSize,
      content_type: request.contentType,
    });
    const raw = unwrap<BackendInitUploadResponse>(response.data, "upload_id");
    return {
      videoId: raw.video_id,
      uploadId: raw.upload_id,
      partSize: raw.part_size,
      totalParts: raw.total_parts,
      partsUploaded: raw.parts_uploaded ?? [],
    };
  },

  async getPartUrl(request: PartUrlRequest): Promise<PartUrlResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload", {
      video_id: request.videoId,
      upload_id: request.uploadId,
      part_number: request.partNumber,
    });
    const raw = unwrap<BackendPartUrlResponse>(response.data, "presigned_url");
    return { presignedUrl: raw.presigned_url, expiresAt: raw.expires_at };
  },

  async completeUpload(request: CompleteUploadRequest): Promise<CompleteUploadResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload/complete", {
      video_id: request.videoId,
      upload_id: request.uploadId,
      parts: request.parts.map((part) => ({ part_number: part.partNumber, etag: part.etag })),
    });
    const raw = unwrap<BackendCompleteUploadResponse>(response.data, "overall_status");
    return { videoId: raw.video_id, overallStatus: raw.overall_status, message: raw.message };
  },

  async cancelUpload(videoId: string): Promise<CancelUploadResponse> {
    const response = await apiClient.put<unknown>(`/admin/pipeline/${encodeURIComponent(videoId)}/cancel`);
    const raw = unwrap<BackendCancelUploadResponse>(response.data, "overall_status");
    const message = raw.message || (response.data as { message?: string })?.message || "Đã hủy xử lý.";
    return { message, overallStatus: raw.overall_status };
  },

  async getVideos(params?: VideoListParams): Promise<PaginatedResponse<VideoListItem>> {
    if (isVideoMockEnabled()) {
      return mockGetVideos(params);
    }
    const page = params?.page ?? 1;
    const pageSize = params?.limit ?? DEFAULT_VIDEO_PAGE_SIZE;
    const response = await apiClient.get<unknown>("/admin/pipeline", {
      params: {
        page,
        page_size: pageSize,
        ...(params?.status ? { status: params.status } : {}),
      },
    });

    const resData = response.data;
    const rawItems: BackendPipelineStatus[] = Array.isArray(resData)
      ? resData
      : resData && typeof resData === "object" && "data" in resData && Array.isArray((resData as any).data)
      ? (resData as any).data
      : resData && typeof resData === "object" && "items" in resData && Array.isArray((resData as any).items)
      ? (resData as any).items
      : [];

    if (!rawItems.length && resData && typeof resData === "object" && !("data" in resData) && !("items" in resData) && !Array.isArray(resData)) {
      throw new Error("Phản hồi danh sách video không đúng định dạng hợp đồng.");
    }

    const items = rawItems.map(mapVideoListItem);
    const rawObj = resData && typeof resData === "object" ? (resData as Record<string, any>) : {};
    const total = typeof rawObj.total === "number" ? rawObj.total : items.length;
    const resolvedPage = typeof rawObj.page === "number" ? rawObj.page : page;
    const resolvedPageSize =
      typeof rawObj.page_size === "number"
        ? rawObj.page_size
        : typeof rawObj.pageSize === "number"
        ? rawObj.pageSize
        : pageSize;
    const resolvedTotalPages =
      typeof rawObj.total_pages === "number"
        ? rawObj.total_pages
        : typeof rawObj.totalPages === "number"
        ? rawObj.totalPages
        : Math.ceil(total / resolvedPageSize);

    return {
      items,
      total,
      page: resolvedPage,
      pageSize: resolvedPageSize,
      totalPages: resolvedTotalPages || 1,
    };
  },

  async getPipelineStatus(videoId: string): Promise<VideoPipeline | null> {
    if (isVideoMockEnabled()) {
      return mockGetPipelineStatus(videoId);
    }
    return fetchPipelineStatus(videoId);
  },

  async retryPipelineStep(
    videoId: string,
    step?: PipelineStepName
  ): Promise<{ message: string; videoId: string }> {
    if (isVideoMockEnabled()) {
      return mockRetryPipelineStep(videoId, step);
    }
    const targetStep = await resolveRetryStep(videoId, step);
    const response = await apiClient.post<unknown>(
      `/admin/pipeline/${encodeURIComponent(videoId)}/retry`,
      null,
      { params: { step: targetStep } }
    );
    const raw = unwrap<BackendRetryPipelineResponse>(response.data, "video_id");
    const message = raw.message || (response.data as { message?: string })?.message || "Đã bắt đầu xử lý lại tiến trình.";
    return { message, videoId: raw.video_id };
  },

  async cancelPipeline(videoId: string): Promise<CancelUploadResponse> {
    if (isVideoMockEnabled()) {
      return mockCancelPipeline(videoId);
    }
    return videoService.cancelUpload(videoId);
  },
};
