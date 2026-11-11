import { videoService } from "@/services/video.service";
import type {
  PartProgress,
  UploadedPart,
  UploadProgress,
  UploadStatus,
} from "@/types/video.types";

export type UploadErrorCode =
  | "NETWORK_ERROR"
  | "PART_UPLOAD_FAILED"
  | "MISSING_ETAG"
  | "INVALID_PART_PLAN"
  | "API_ERROR";

interface UploadErrorDetails {
  partNumber?: number;
  httpStatus?: number;
  backendCode?: string;
}

export class UploadError extends Error {
  readonly code: UploadErrorCode;
  readonly partNumber?: number;
  readonly httpStatus?: number;
  readonly backendCode?: string;

  constructor(code: UploadErrorCode, message: string, details: UploadErrorDetails = {}) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.partNumber = details.partNumber;
    this.httpStatus = details.httpStatus;
    this.backendCode = details.backendCode;
  }
}

export interface ChunkUploadOptions {
  file: File;
  videoId: string;
  uploadId: string;
  partSize: number;
  totalParts: number;
  partsUploaded?: number[];
  knownParts?: UploadedPart[];
  concurrency?: number;
  maxRetries?: number;
  onProgress?: (progress: UploadProgress) => void;
  onStatusChange?: (status: UploadStatus) => void;
  onPartCompleted?: (part: UploadedPart) => void;
}

interface RunContext {
  stopped: boolean;
  error: UploadError | null;
}

class RunInterrupted extends Error {}

const RETRY_BASE_DELAY_MS = 1000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function toApiError(error: unknown, partNumber?: number): UploadError {
  if (error instanceof UploadError) return error;
  const response = (
    error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
  )?.response;
  const message =
    response?.data?.error?.message ??
    (error instanceof Error ? error.message : "Không thể kết nối tới máy chủ");
  return new UploadError("API_ERROR", message, {
    partNumber,
    httpStatus: response?.status,
    backendCode: response?.data?.error?.code,
  });
}

export class ChunkUploadManager {
  private readonly file: File;
  private readonly videoId: string;
  private readonly uploadId: string;
  private readonly partSize: number;
  private readonly totalParts: number;
  private readonly concurrency: number;
  private readonly maxRetries: number;
  private readonly onProgress?: (progress: UploadProgress) => void;
  private readonly onStatusChange?: (status: UploadStatus) => void;
  private readonly onPartCompleted?: (part: UploadedPart) => void;

  private status: UploadStatus = "IDLE";
  private finalizing = false;
  private currentRun: RunContext | null = null;
  private reportedBytes = 0;
  private readonly completed = new Map<number, string>();
  private readonly parts = new Map<number, PartProgress>();
  private readonly activeRequests = new Map<number, XMLHttpRequest>();

  constructor(options: ChunkUploadOptions) {
    const { file, partSize, totalParts } = options;
    if (file.size <= 0 || partSize <= 0 || Math.ceil(file.size / partSize) !== totalParts) {
      throw new UploadError(
        "INVALID_PART_PLAN",
        "Kế hoạch chia phần không khớp với dung lượng file"
      );
    }

    this.file = file;
    this.videoId = options.videoId;
    this.uploadId = options.uploadId;
    this.partSize = partSize;
    this.totalParts = totalParts;
    this.concurrency = options.concurrency ?? 3;
    this.maxRetries = options.maxRetries ?? 3;
    this.onProgress = options.onProgress;
    this.onStatusChange = options.onStatusChange;
    this.onPartCompleted = options.onPartCompleted;

    const serverParts = new Set(options.partsUploaded ?? []);
    const hasServerParts = Boolean(options.partsUploaded && options.partsUploaded.length > 0);
    for (const part of options.knownParts ?? []) {
      if (part.partNumber >= 1 && part.partNumber <= totalParts) {
        if (!hasServerParts || serverParts.has(part.partNumber)) {
          this.completed.set(part.partNumber, part.etag);
        }
      }
    }

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const totalBytes = this.partBytes(partNumber);
      const isDone = this.completed.has(partNumber);
      this.parts.set(partNumber, {
        partNumber,
        status: isDone ? "COMPLETED" : "PENDING",
        loadedBytes: isDone ? totalBytes : 0,
        totalBytes,
      });
    }
  }

  getStatus(): UploadStatus {
    return this.status;
  }

  start(): Promise<void> {
    if (this.status !== "IDLE") return Promise.resolve();
    return this.run();
  }

  resume(): Promise<void> {
    if (this.status !== "PAUSED" && this.status !== "FAILED") return Promise.resolve();
    return this.run();
  }

  pause(): void {
    if (this.status !== "UPLOADING" || this.finalizing) return;
    this.stopCurrentRun();
    this.setStatus("PAUSED");
  }

  async cancel(): Promise<void> {
    if (this.status === "COMPLETED" || this.status === "CANCELLED" || this.finalizing) return;
    this.stopCurrentRun();
    this.setStatus("CANCELLED");
    try {
      await videoService.cancelUpload(this.videoId);
    } catch (error) {
      throw toApiError(error);
    }
  }

  private async run(): Promise<void> {
    const run: RunContext = { stopped: false, error: null };
    this.currentRun = run;
    this.setStatus("UPLOADING");
    this.emitProgress();

    const queue = [...this.parts.values()]
      .filter((part) => part.status !== "COMPLETED")
      .map((part) => part.partNumber);

    const worker = async (): Promise<void> => {
      while (!run.stopped) {
        const partNumber = queue.shift();
        if (partNumber === undefined) return;
        try {
          await this.uploadPart(partNumber, run);
        } catch (error) {
          if (error instanceof RunInterrupted || run.stopped) return;
          run.error = toApiError(error, partNumber);
          run.stopped = true;
          this.abortActiveRequests();
          return;
        }
      }
    };

    const workerCount = Math.min(this.concurrency, queue.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    if (run.error) {
      this.resetInFlightParts();
      this.setStatus("FAILED");
      throw run.error;
    }
    if (run.stopped || this.currentRun !== run) return;

    this.finalizing = true;
    try {
      await videoService.completeUpload({
        videoId: this.videoId,
        uploadId: this.uploadId,
        parts: [...this.completed.entries()]
          .sort(([a], [b]) => a - b)
          .map(([partNumber, etag]) => ({ partNumber, etag })),
      });
    } catch (error) {
      this.finalizing = false;
      this.setStatus("FAILED");
      throw toApiError(error);
    }
    this.finalizing = false;
    this.setStatus("COMPLETED");
  }

  private async uploadPart(partNumber: number, run: RunContext): Promise<void> {
    const blob = this.slicePart(partNumber);
    this.updatePart(partNumber, { status: "UPLOADING", loadedBytes: 0 });

    let lastError: UploadError | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
      this.assertActive(run);
      try {
        const { presignedUrl } = await videoService.getPartUrl({
          videoId: this.videoId,
          uploadId: this.uploadId,
          partNumber,
        });
        this.assertActive(run);
        const etag = await this.putPart(partNumber, blob, presignedUrl);
        if (this.status === "CANCELLED") return;
        this.completed.set(partNumber, etag);
        this.updatePart(partNumber, { status: "COMPLETED", loadedBytes: blob.size });
        this.onPartCompleted?.({ partNumber, etag });
        return;
      } catch (error) {
        if (error instanceof RunInterrupted) throw error;
        lastError = toApiError(error, partNumber);
        this.updatePart(partNumber, { status: "UPLOADING", loadedBytes: 0 });
        if (lastError.code === "MISSING_ETAG") break;
      }
    }

    this.updatePart(partNumber, { status: "FAILED", loadedBytes: 0 });
    throw lastError ?? new UploadError("PART_UPLOAD_FAILED", "Không thể tải phần lên", { partNumber });
  }

  private putPart(partNumber: number, blob: Blob, url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.activeRequests.set(partNumber, xhr);
      const release = () => {
        if (this.activeRequests.get(partNumber) === xhr) {
          this.activeRequests.delete(partNumber);
        }
      };

      xhr.open("PUT", url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          this.updatePart(partNumber, { loadedBytes: Math.min(event.loaded, blob.size) });
        }
      };
      xhr.onload = () => {
        release();
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag");
          if (etag) {
            resolve(etag);
          } else {
            reject(
              new UploadError(
                "MISSING_ETAG",
                "Không đọc được ETag từ S3. Kiểm tra cấu hình CORS (ExposeHeaders: ETag) của bucket",
                { partNumber, httpStatus: xhr.status }
              )
            );
          }
        } else {
          reject(
            new UploadError("PART_UPLOAD_FAILED", `S3 từ chối phần ${partNumber} (mã ${xhr.status})`, {
              partNumber,
              httpStatus: xhr.status,
            })
          );
        }
      };
      const onNetworkFailure = () => {
        release();
        reject(
          new UploadError(
            "NETWORK_ERROR",
            `Không gửi được phần ${partNumber} lên S3 (mất mạng hoặc bucket chưa cấu hình CORS)`,
            { partNumber }
          )
        );
      };
      xhr.onerror = onNetworkFailure;
      xhr.ontimeout = onNetworkFailure;
      xhr.onabort = () => {
        release();
        reject(new RunInterrupted());
      };
      xhr.send(blob);
    });
  }

  private slicePart(partNumber: number): Blob {
    const start = (partNumber - 1) * this.partSize;
    return this.file.slice(start, Math.min(start + this.partSize, this.file.size));
  }

  private partBytes(partNumber: number): number {
    if (partNumber < this.totalParts) return this.partSize;
    return this.file.size - this.partSize * (this.totalParts - 1);
  }

  private assertActive(run: RunContext): void {
    if (run.stopped || this.currentRun !== run) throw new RunInterrupted();
  }

  private stopCurrentRun(): void {
    if (this.currentRun) this.currentRun.stopped = true;
    this.abortActiveRequests();
    this.resetInFlightParts();
  }

  private abortActiveRequests(): void {
    for (const xhr of [...this.activeRequests.values()]) {
      xhr.abort();
    }
  }

  private resetInFlightParts(): void {
    for (const part of this.parts.values()) {
      if (part.status === "UPLOADING") {
        part.status = "PENDING";
        part.loadedBytes = 0;
      }
    }
    this.emitProgress();
  }

  private updatePart(partNumber: number, patch: Partial<PartProgress>): void {
    const part = this.parts.get(partNumber);
    if (!part) return;
    Object.assign(part, patch);
    this.emitProgress();
  }

  private emitProgress(): void {
    const parts = [...this.parts.values()].map((part) => ({ ...part }));
    const uploadedBytes = parts.reduce((sum, part) => sum + part.loadedBytes, 0);
    this.reportedBytes = Math.max(this.reportedBytes, uploadedBytes);
    this.onProgress?.({
      totalPercent: Math.min(100, Math.floor((this.reportedBytes / this.file.size) * 100)),
      uploadedBytes: this.reportedBytes,
      totalBytes: this.file.size,
      parts,
    });
  }

  private setStatus(status: UploadStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.onStatusChange?.(status);
  }
}
