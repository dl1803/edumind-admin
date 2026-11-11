import type { PaginatedResponse } from "@/types/api.types";
import type { VideoListItem, VideoListParams, VideoOverallStatus } from "@/types/video.types";

const THUMBNAIL_1 = "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400";
const THUMBNAIL_2 = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400";
const THUMBNAIL_3 = "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400";
const THUMBNAIL_4 = "https://images.unsplash.com/photo-1581291518655-9523c932deb8?w=400";
const BROKEN_THUMBNAIL = "https://invalid.example/missing-thumbnail.jpg";

type VideoSeed = [
  videoTitle: string,
  lessonTitle: string,
  courseTitle: string,
  fileSizeMb: number,
  overallStatus: VideoOverallStatus,
  durationSec: number | null,
  uploadedAt: string,
  thumbnailUrl: string | null,
];

const VIDEO_SEEDS: VideoSeed[] = [
  ["Cài đặt Python 3.11 & VS Code", "Bài 1.1: Cài đặt môi trường", "Nhập môn Lập trình Python", 240, "completed", 750, "2026-08-14T09:30:00+07:00", THUMBNAIL_1],
  ["Tích hợp mô hình AI và Gọi hàm", "Bài 2.2: Tích hợp mô hình AI", "Xây dựng Ứng dụng RAG Thông minh", 420, "processing", 1190, "2026-08-15T09:15:00+07:00", THUMBNAIL_2],
  ["Xử lý Phản hồi Dòng trong LangChain", "Bài 2.3: Streaming LangChain", "Xây dựng Ứng dụng RAG Thông minh", 380, "failed", 1210, "2026-08-15T14:40:00+07:00", THUMBNAIL_2],
  ["demo_prototype_intro_v2.mp4", "", "", 165, "uploaded", 525, "2026-08-16T10:00:00+07:00", null],
  ["Cấu trúc Dữ liệu List & Dict", "Bài 1.2: Danh sách và từ điển", "Nhập môn Lập trình Python", 210, "completed", 1095, "2026-08-14T11:00:00+07:00", THUMBNAIL_1],
  ["Hàm và Module Tái sử dụng", "Bài 1.3: Hàm và module", "Nhập môn Lập trình Python", 195, "completed", 930, "2026-08-15T08:45:00+07:00", THUMBNAIL_1],
  ["Câu lệnh điều kiện và Vòng lặp", "Bài 2.1: Điều kiện và lặp", "Nhập môn Lập trình Python", 310, "completed", 1210, "2026-08-16T14:20:00+07:00", THUMBNAIL_2],
  ["Tổng quan Kiến trúc RAG và Vector DB", "Bài 3.1: Giới thiệu RAG", "Xây dựng Ứng dụng RAG Thông minh", 280, "completed", 870, "2026-08-17T11:00:00+07:00", BROKEN_THUMBNAIL],
  ["Vector hóa Tài liệu với OpenAI Embedding", "Bài 3.2: Vector hóa tài liệu", "Xây dựng Ứng dụng RAG Thông minh", 450, "completed", 1340, "2026-08-18T13:30:00+07:00", THUMBNAIL_3],
  ["Truy xuất Ngữ cảnh và Reranking", "Bài 3.3: Truy xuất ngữ cảnh", "Xây dựng Ứng dụng RAG Thông minh", 330, "completed", 1015, "2026-08-19T15:10:00+07:00", THUMBNAIL_3],
  ["Nguyên tắc Thiết kế Giao diện Hiện đại", "Bài 4.1: Nguyên tắc thiết kế", "Thiết kế Giao diện UI/UX Nâng cao", 180, "completed", 760, "2026-08-20T09:50:00+07:00", THUMBNAIL_4],
  ["Hệ thống Lưới và Spacing Base-4px", "Bài 4.2: Lưới và khoảng cách", "Thiết kế Giao diện UI/UX Nâng cao", 155, "completed", 645, "2026-08-21T10:25:00+07:00", THUMBNAIL_4],
  ["Màu sắc Thương hiệu và Phối màu UI", "Bài 4.3: Màu sắc và kiểu chữ", "Thiết kế Giao diện UI/UX Nâng cao", 290, "processing", 920, "2026-08-22T08:15:00+07:00", THUMBNAIL_4],
  ["Tổng quan Học máy và Học sâu", "Bài 5.1: Tổng quan học máy", "Nhập môn Lập trình Python", 520, "completed", 1480, "2026-08-23T14:00:00+07:00", THUMBNAIL_1],
  ["Mô hình Hồi quy Tuyến tính", "Bài 5.2: Hồi quy tuyến tính", "Nhập môn Lập trình Python", 460, "completed", 1325, "2026-08-24T09:40:00+07:00", THUMBNAIL_1],
  ["Cây quyết định và Random Forest", "Bài 5.3: Cây quyết định", "Nhập môn Lập trình Python", 490, "processing", 1410, "2026-08-25T16:20:00+07:00", THUMBNAIL_2],
  ["Cơ bản về Truy vấn SQL", "Bài 6.1: Làm quen với SQL", "Nhập môn Lập trình Python", 140, "failed", 705, "2026-08-26T10:05:00+07:00", THUMBNAIL_2],
  ["Truy vấn Nhiều bảng và Index", "Bài 6.2: Truy vấn nhiều bảng", "Nhập môn Lập trình Python", 270, "completed", 985, "2026-08-27T13:45:00+07:00", THUMBNAIL_3],
  ["Tối ưu Hiệu năng Cơ sở Dữ liệu", "Bài 6.3: Chỉ mục và hiệu năng", "Nhập môn Lập trình Python", 350, "processing", 1120, "2026-08-28T09:10:00+07:00", null],
  ["Bảo mật Ứng dụng Web và OAuth2", "Bài 7.1: Bảo mật ứng dụng web", "Xây dựng Ứng dụng RAG Thông minh", 205, "failed", 840, "2026-08-29T15:30:00+07:00", THUMBNAIL_3],
  ["Xác thực JWT và Phân quyền RBAC", "Bài 7.2: Xác thực và phân quyền", "Xây dựng Ứng dụng RAG Thông minh", 390, "processing", 1260, "2026-08-30T11:20:00+07:00", THUMBNAIL_4],
  ["Đóng gói Ứng dụng với Docker", "Bài 8.1: Triển khai với Docker", "Thiết kế Giao diện UI/UX Nâng cao", 410, "uploaded", null, "2026-08-31T10:00:00+07:00", THUMBNAIL_4],
  ["Xây dựng Quy trình CI/CD GitHub Actions", "Bài 8.2: Quy trình CI/CD", "Thiết kế Giao diện UI/UX Nâng cao", 340, "uploaded", null, "2026-09-01T14:35:00+07:00", THUMBNAIL_1],
  ["Tổng kết Khóa học và Định hướng", "Bài 9.1: Tổng kết khóa học", "Thiết kế Giao diện UI/UX Nâng cao", 190, "uploading", null, "2026-09-02T08:50:00+07:00", THUMBNAIL_2],
  ["Đánh giá Dự án Cuối khóa", "Bài 9.2: Dự án cuối khóa", "Thiết kế Giao diện UI/UX Nâng cao", 225, "uploading", null, "2026-09-02T16:10:00+07:00", THUMBNAIL_3],
];

export const MOCK_VIDEOS: VideoListItem[] = VIDEO_SEEDS.map(
  ([videoTitle, lessonTitle, courseTitle, fileSizeMb, overallStatus, durationSec, uploadedAt, thumbnailUrl], index) => {
    const order = String(index + 1).padStart(2, "0");
    return {
      videoId: `vid-${order}`,
      videoTitle,
      lessonId: `les-${order}`,
      lessonTitle: lessonTitle || videoTitle,
      courseTitle,
      fileSizeMb,
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

  const { search, courseTitle, status, sort = "newest", page = 1, limit = 10 } = params;

  const normalizedSearch = (search || "").trim().toLowerCase();

  const filtered = MOCK_VIDEOS.filter((video) => {
    if (status && video.overallStatus !== status) return false;
    if (courseTitle && video.courseTitle !== courseTitle) return false;
    if (normalizedSearch) {
      const matchTitle = (video.videoTitle || "").toLowerCase().includes(normalizedSearch);
      const matchLesson = (video.lessonTitle || "").toLowerCase().includes(normalizedSearch);
      const matchCourse = (video.courseTitle || "").toLowerCase().includes(normalizedSearch);
      if (!matchTitle && !matchLesson && !matchCourse) return false;
    }
    return true;
  });

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
