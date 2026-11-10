import type { PaginatedResponse } from "@/types/api.types";
import type { VideoListItem, VideoListParams, VideoOverallStatus } from "@/types/video.types";

const THUMBNAIL_1 = "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400";
const THUMBNAIL_2 = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400";
const THUMBNAIL_3 = "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400";
const THUMBNAIL_4 = "https://images.unsplash.com/photo-1581291518655-9523c932deb8?w=400";
const BROKEN_THUMBNAIL = "https://invalid.example/missing-thumbnail.jpg";

type VideoSeed = [
  lessonTitle: string,
  overallStatus: VideoOverallStatus,
  durationSec: number | null,
  uploadedAt: string,
  thumbnailUrl: string | null,
];

const VIDEO_SEEDS: VideoSeed[] = [
  ["Bài 1.1: Cài đặt môi trường Python", "completed", 750, "2026-10-14T09:30:00+07:00", THUMBNAIL_1],
  ["Bài 1.2: Danh sách và từ điển", "completed", 1095, "2026-10-14T10:15:00+07:00", THUMBNAIL_1],
  ["Bài 1.3: Hàm và module", "completed", 930, "2026-10-15T08:45:00+07:00", THUMBNAIL_1],
  ["Bài 2.1: Câu lệnh điều kiện và vòng lặp", "completed", 1210, "2026-10-16T14:20:00+07:00", THUMBNAIL_2],
  ["Bài 2.2: Tích hợp mô hình AI", "completed", 1190, "2026-10-17T09:05:00+07:00", THUMBNAIL_2],
  ["Bài 2.3: Xử lý phản hồi dòng", "failed", 1210, "2026-10-18T16:40:00+07:00", THUMBNAIL_2],
  ["Bài 3.1: Giới thiệu RAG", "completed", 870, "2026-10-19T11:00:00+07:00", BROKEN_THUMBNAIL],
  ["Bài 3.2: Vector hóa tài liệu", "completed", 1340, "2026-10-20T13:30:00+07:00", THUMBNAIL_3],
  ["Bài 3.3: Truy xuất ngữ cảnh", "completed", 1015, "2026-10-21T15:10:00+07:00", THUMBNAIL_3],
  ["Bài 4.1: Nguyên tắc thiết kế giao diện", "completed", 760, "2026-10-22T09:50:00+07:00", THUMBNAIL_4],
  ["Bài 4.2: Lưới và khoảng cách", "completed", 645, "2026-10-23T10:25:00+07:00", THUMBNAIL_4],
  ["Bài 4.3: Màu sắc và kiểu chữ", "processing", 920, "2026-10-26T08:15:00+07:00", THUMBNAIL_4],
  ["Bài 5.1: Tổng quan học máy", "completed", 1480, "2026-10-27T14:00:00+07:00", THUMBNAIL_1],
  ["Bài 5.2: Hồi quy tuyến tính", "completed", 1325, "2026-10-28T09:40:00+07:00", THUMBNAIL_1],
  ["Bài 5.3: Phân loại với cây quyết định", "processing", 1410, "2026-10-29T16:20:00+07:00", THUMBNAIL_2],
  ["Bài 6.1: Làm quen với SQL", "failed", 705, "2026-10-30T10:05:00+07:00", THUMBNAIL_2],
  ["Bài 6.2: Truy vấn nhiều bảng", "completed", 985, "2026-10-31T13:45:00+07:00", THUMBNAIL_3],
  ["Bài 6.3: Chỉ mục và hiệu năng", "processing", 1120, "2026-11-01T09:10:00+07:00", null],
  ["Bài 7.1: Bảo mật ứng dụng web", "failed", 840, "2026-11-02T15:30:00+07:00", THUMBNAIL_3],
  ["Bài 7.2: Xác thực và phân quyền", "processing", 1260, "2026-11-03T11:20:00+07:00", THUMBNAIL_4],
  ["Bài 8.1: Triển khai với Docker", "processing", 1385, "2026-11-04T10:00:00+07:00", THUMBNAIL_4],
  ["Bài 8.2: Quy trình CI/CD", "uploaded", null, "2026-11-05T14:35:00+07:00", THUMBNAIL_1],
  ["Bài 8.3: Giám sát hệ thống", "uploaded", null, "2026-11-06T09:25:00+07:00", THUMBNAIL_1],
  ["Bài 9.1: Tổng kết khóa học", "uploading", null, "2026-11-07T08:50:00+07:00", THUMBNAIL_2],
  ["Bài 9.2: Dự án cuối khóa", "uploading", null, "2026-11-07T16:10:00+07:00", THUMBNAIL_3],
];

export const MOCK_VIDEOS: VideoListItem[] = VIDEO_SEEDS.map(
  ([lessonTitle, overallStatus, durationSec, uploadedAt, thumbnailUrl], index) => {
    const order = String(index + 1).padStart(2, "0");
    return {
      videoId: `vid-${order}`,
      lessonId: `les-${order}`,
      lessonTitle,
      overallStatus,
      thumbnailUrl,
      durationSec,
      uploadedAt,
    };
  }
);

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function mockGetVideos(
  params: VideoListParams = {}
): Promise<PaginatedResponse<VideoListItem>> {
  await delay(300);

  const { status, sort = "newest", page = 1, limit = 10 } = params;

  const filtered = MOCK_VIDEOS.filter((video) => !status || video.overallStatus === status);
  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    return sort === "newest" ? -diff : diff;
  });

  const start = (page - 1) * limit;

  return {
    items: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(sorted.length / limit),
  };
}

