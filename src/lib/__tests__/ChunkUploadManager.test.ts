import { ChunkUploadManager, UploadError } from "../ChunkUploadManager";
import type { ChunkUploadOptions } from "../ChunkUploadManager";
import { videoService } from "@/services/video.service";

jest.mock("@/services/video.service", () => ({
  videoService: {
    getPartUrl: jest.fn(),
    completeUpload: jest.fn(),
    cancelUpload: jest.fn(),
  },
}));

type XhrHandler = (xhr: FakeXhr) => void;

class FakeXhr {
  static instances: FakeXhr[] = [];
  static handler: XhrHandler | null = null;
  static inFlight = 0;
  static maxInFlight = 0;

  upload: { onprogress: ((event: { lengthComputable: boolean; loaded: number }) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  url = "";
  blob: Blob | null = null;
  aborted = false;
  private finished = false;
  private etag: string | null = null;

  constructor() {
    FakeXhr.instances.push(this);
  }

  static reset() {
    FakeXhr.instances = [];
    FakeXhr.handler = null;
    FakeXhr.inFlight = 0;
    FakeXhr.maxInFlight = 0;
  }

  get partNumber(): number {
    return Number(this.url.split("/").pop());
  }

  open(_method: string, url: string) {
    this.url = url;
  }

  send(blob: Blob) {
    this.blob = blob;
    FakeXhr.inFlight += 1;
    FakeXhr.maxInFlight = Math.max(FakeXhr.maxInFlight, FakeXhr.inFlight);
    setTimeout(() => {
      if (!this.aborted && FakeXhr.handler) FakeXhr.handler(this);
    }, 0);
  }

  abort() {
    if (this.finished) return;
    this.finished = true;
    this.aborted = true;
    FakeXhr.inFlight -= 1;
    this.onabort?.();
  }

  getResponseHeader(name: string): string | null {
    return name === "ETag" ? this.etag : null;
  }

  respond(status: number, etag: string | null = null) {
    if (this.finished) return;
    this.finished = true;
    FakeXhr.inFlight -= 1;
    this.status = status;
    this.etag = etag;
    this.onload?.();
  }

  networkError() {
    if (this.finished) return;
    this.finished = true;
    FakeXhr.inFlight -= 1;
    this.onerror?.();
  }

  progress(loaded: number) {
    this.upload.onprogress?.({ lengthComputable: true, loaded });
  }
}

const acceptPart: XhrHandler = (xhr) => xhr.respond(200, `"etag-${xhr.partNumber}"`);

const realSetTimeout = global.setTimeout;
const realXhr = global.XMLHttpRequest;

function wait(ms: number) {
  return new Promise<void>((resolve) => realSetTimeout(resolve, ms));
}

function skipBackoff(): number[] {
  const delays: number[] = [];
  global.setTimeout = ((handler: () => void, ms?: number) => {
    const isBackoff = ms !== undefined && ms >= 1000;
    if (isBackoff) delays.push(ms);
    return realSetTimeout(handler, isBackoff ? 0 : ms);
  }) as unknown as typeof setTimeout;
  return delays;
}

function createManager(size: number, partSize: number, extra: Partial<ChunkUploadOptions> = {}) {
  return new ChunkUploadManager({
    file: new File([new Uint8Array(size)], "bai_01.mp4", { type: "video/mp4" }),
    videoId: "video-1",
    uploadId: "upload-1",
    partSize,
    totalParts: Math.ceil(size / partSize),
    ...extra,
  });
}

describe("ChunkUploadManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    FakeXhr.reset();
    jest.mocked(videoService.getPartUrl).mockImplementation(async ({ partNumber }) => ({
      presignedUrl: `https://s3.test/part/${partNumber}`,
      expiresAt: "2026-11-09T00:00:00Z",
    }));
    jest.mocked(videoService.completeUpload).mockResolvedValue({
      videoId: "video-1",
      overallStatus: "uploaded",
      message: "ok",
    });
    jest.mocked(videoService.cancelUpload).mockResolvedValue({
      message: "ok",
      overallStatus: "uploaded",
    });
    global.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    global.setTimeout = realSetTimeout;
    global.XMLHttpRequest = realXhr;
  });

  it("tải file 1 phần: gọi complete với ETag và kết thúc COMPLETED", async () => {
    FakeXhr.handler = acceptPart;
    const statuses: string[] = [];
    const manager = createManager(5, 10, { onStatusChange: (status) => statuses.push(status) });

    await manager.start();

    expect(manager.getStatus()).toBe("COMPLETED");
    expect(statuses).toEqual(["UPLOADING", "COMPLETED"]);
    expect(videoService.completeUpload).toHaveBeenCalledWith({
      videoId: "video-1",
      uploadId: "upload-1",
      parts: [{ partNumber: 1, etag: '"etag-1"' }],
    });
  });

  it("chia đúng số phần, tối đa 3 phần song song, progress tăng đơn điệu, parts sắp theo partNumber", async () => {
    FakeXhr.handler = (xhr) => {
      xhr.progress((xhr.blob as Blob).size / 2);
      realSetTimeout(() => acceptPart(xhr), 5);
    };
    const percents: number[] = [];
    const manager = createManager(45, 10, {
      onProgress: (progress) => percents.push(progress.totalPercent),
    });

    await manager.start();

    const sizes = FakeXhr.instances.map((xhr) => (xhr.blob as Blob).size).sort((a, b) => a - b);
    expect(sizes).toEqual([5, 10, 10, 10, 10]);
    expect(FakeXhr.maxInFlight).toBe(3);
    percents.forEach((percent, index) => {
      if (index > 0) expect(percent).toBeGreaterThanOrEqual(percents[index - 1]);
    });
    expect(percents[percents.length - 1]).toBe(100);
    const sent = jest.mocked(videoService.completeUpload).mock.calls[0][0];
    expect(sent.parts.map((part) => part.partNumber)).toEqual([1, 2, 3, 4, 5]);
  });

  it("phần lỗi: thử lại đúng 3 lần với backoff 1s, 2s, 4s rồi mới FAILED", async () => {
    FakeXhr.handler = (xhr) => xhr.respond(500);
    const delays = skipBackoff();
    const manager = createManager(5, 10);

    await expect(manager.start()).rejects.toMatchObject({
      code: "PART_UPLOAD_FAILED",
      httpStatus: 500,
    });

    expect(FakeXhr.instances).toHaveLength(4);
    expect(delays).toEqual([1000, 2000, 4000]);
    expect(manager.getStatus()).toBe("FAILED");
    expect(videoService.completeUpload).not.toHaveBeenCalled();
  });

  it("phần lỗi lần 1 nhưng thành công ở lần thử lại: upload tiếp bình thường", async () => {
    let attempts = 0;
    FakeXhr.handler = (xhr) => {
      attempts += 1;
      if (attempts === 1) xhr.networkError();
      else acceptPart(xhr);
    };
    skipBackoff();
    const manager = createManager(5, 10);

    await manager.start();

    expect(manager.getStatus()).toBe("COMPLETED");
    expect(FakeXhr.instances).toHaveLength(2);
  });

  it("S3 không trả ETag: báo MISSING_ETAG ngay, không thử lại", async () => {
    FakeXhr.handler = (xhr) => xhr.respond(200, null);
    const manager = createManager(5, 10);

    const error = await manager.start().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UploadError);
    expect((error as UploadError).code).toBe("MISSING_ETAG");
    expect(FakeXhr.instances).toHaveLength(1);
  });

  it("tạm dừng rồi tiếp tục: chỉ tải các phần còn thiếu", async () => {
    const manager = createManager(30, 10, { concurrency: 2 });
    const running = manager.start();
    await wait(20);
    expect(FakeXhr.instances).toHaveLength(2);

    FakeXhr.instances[0].respond(200, '"etag-1"');
    await wait(20);
    expect(FakeXhr.instances).toHaveLength(3);

    manager.pause();
    await running;
    expect(manager.getStatus()).toBe("PAUSED");
    expect(FakeXhr.instances[1].aborted).toBe(true);
    expect(FakeXhr.instances[2].aborted).toBe(true);

    FakeXhr.handler = acceptPart;
    const before = FakeXhr.instances.length;
    await manager.resume();

    expect(manager.getStatus()).toBe("COMPLETED");
    expect(FakeXhr.instances.length - before).toBe(2);
    const sent = jest.mocked(videoService.completeUpload).mock.calls[0][0];
    expect(sent.parts.map((part) => part.partNumber)).toEqual([1, 2, 3]);
  });

  it("hủy: abort các request, gọi cancelUpload và không tạo request mới", async () => {
    const manager = createManager(30, 10);
    const running = manager.start();
    await wait(20);

    await manager.cancel();
    await running;

    expect(manager.getStatus()).toBe("CANCELLED");
    expect(videoService.cancelUpload).toHaveBeenCalledWith("video-1");
    expect(FakeXhr.instances.every((xhr) => xhr.aborted)).toBe(true);
    const count = FakeXhr.instances.length;
    await wait(20);
    expect(FakeXhr.instances).toHaveLength(count);
    expect(videoService.completeUpload).not.toHaveBeenCalled();
  });

  it("tiếp tục sau khi tải lại trang: bỏ qua phần đã có trên server và có ETag, tải lại phần thiếu ETag", async () => {
    FakeXhr.handler = acceptPart;
    const manager = createManager(40, 10, {
      partsUploaded: [1, 2, 3],
      knownParts: [
        { partNumber: 1, etag: '"old-1"' },
        { partNumber: 2, etag: '"old-2"' },
        { partNumber: 4, etag: '"old-4"' },
      ],
    });

    await manager.start();

    expect(FakeXhr.instances.map((xhr) => xhr.partNumber).sort()).toEqual([3, 4]);
    expect(videoService.completeUpload).toHaveBeenCalledWith({
      videoId: "video-1",
      uploadId: "upload-1",
      parts: [
        { partNumber: 1, etag: '"old-1"' },
        { partNumber: 2, etag: '"old-2"' },
        { partNumber: 3, etag: '"etag-3"' },
        { partNumber: 4, etag: '"etag-4"' },
      ],
    });
  });

  it("thử lại sau khi lỗi (FAILED): resume tiếp tục tải các phần chưa xong", async () => {
    let attempts = 0;
    FakeXhr.handler = (xhr) => {
      attempts += 1;
      if (attempts === 1) {
        xhr.respond(200, '"etag-1"');
      } else {
        xhr.networkError();
      }
    };
    skipBackoff();
    const manager = createManager(20, 10, { concurrency: 1 });

    await manager.start().catch((e: unknown) => e);
    expect(manager.getStatus()).toBe("FAILED");

    FakeXhr.handler = acceptPart;
    await manager.resume();

    expect(manager.getStatus()).toBe("COMPLETED");
    expect(videoService.completeUpload).toHaveBeenCalledWith({
      videoId: "video-1",
      uploadId: "upload-1",
      parts: [
        { partNumber: 1, etag: '"etag-1"' },
        { partNumber: 2, etag: '"etag-2"' },
      ],
    });
  });

  it("kế hoạch chia phần không khớp dung lượng file: ném INVALID_PART_PLAN", () => {
    expect(() => createManager(25, 10, { totalParts: 2 })).toThrow(UploadError);
  });
});
