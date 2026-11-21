import { MOCK_VIDEOS } from "./videoList.mock";
import { TranscriptConflictError, hasTranscriptTextChanged } from "@/lib/transcript";
import type {
  SaveTranscriptResult,
  Transcript,
  TranscriptSegment,
  TranscriptVersion,
} from "@/types/transcript.types";

export const MOCK_TRANSCRIPT_PREVIEW_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function seg(
  order: number,
  startMs: number,
  endMs: number,
  text: string,
  edited: boolean
): TranscriptSegment {
  return { id: `seg-${String(order).padStart(2, "0")}`, startMs, endMs, text, edited };
}

const MOCK_SEGMENTS: TranscriptSegment[] = [
  seg(1, 0, 8880, "Chào mừng các bạn đến với khóa học Nhập môn Lập trình Python.", false),
  seg(2, 9250, 19880, "Trong bài đầu tiên, chúng ta sẽ cài đặt môi trường làm việc cho cả khóa học.", false),
  seg(3, 20000, 32880, "Trước hết, hãy làm quen với khái niệm trình thông dịch và vì sao Python cần nó.", false),
  seg(4, 33250, 44880, "Các bạn truy cập trang chủ python.org và chọn phiên bản 3.11 mới nhất.", false),
  seg(5, 47000, 56880, "Nhấn vào nút Download rồi chờ tệp cài đặt tải về máy.", false),
  seg(6, 57250, 70880, "Khi mở tệp cài đặt, hãy tích chọn ô Add python.exe to PATH ở cuối cửa sổ.", false),
  seg(7, 71000, 85880, "Bước này rất quan trọng vì nó cho phép chạy lệnh python từ bất kỳ thư mục nào.", true),
  seg(8, 86250, 96880, "Sau đó chọn Install Now và đợi quá trình cài đặt hoàn tất.", false),
  seg(9, 97000, 109880, "Mở Command Prompt và gõ lệnh python --version để kiểm tra kết quả.", false),
  seg(10, 111250, 124880, "Nếu màn hình hiển thị Python 3.11, nghĩa là bạn đã cài đặt thành công.", false),
  seg(11, 125000, 138880, "Tiếp theo, chúng ta cài đặt Visual Studio Code làm trình soạn thảo mã nguồn.", false),
  seg(12, 139250, 151880, "Truy cập trang code.visualstudio.com và tải bản phù hợp với hệ điều hành.", false),
  seg(13, 152000, 163880, "Quá trình cài đặt khá đơn giản, các bạn chỉ cần nhấn Next qua các bước.", false),
  seg(14, 164250, 174880, "Mở Visual Studio Code, vào mục Extensions ở thanh bên trái.", false),
  seg(15, 175000, 184880, "Tìm và cài đặt tiện ích Python do Microsoft phát hành.", false),
  seg(16, 188250, 202880, "Tiện ích này cung cấp gợi ý mã, kiểm tra lỗi và gỡ lỗi ngay trong trình soạn thảo.", false),
  seg(17, 203000, 217880, "Bây giờ hãy tạo một thư mục mới tên là python-co-ban để chứa các bài thực hành.", false),
  seg(18, 218250, 231880, "Mở thư mục này trong Visual Studio Code bằng lệnh File, Open Folder.", false),
  seg(19, 232000, 247880, "Tạo tệp mới đặt tên là hello.py rồi gõ dòng lệnh print với nội dung Xin chào.", true),
  seg(20, 248250, 260880, "Nhấn nút Run ở góc trên bên phải để chạy chương trình đầu tiên.", false),
  seg(21, 261000, 271880, "Kết quả sẽ hiện ở cửa sổ Terminal bên dưới màn hình.", false),
  seg(22, 274250, 286880, "Chúc mừng các bạn, đây là chương trình Python đầu tiên của bạn.", false),
  seg(23, 287000, 296880, "Bây giờ chúng ta tìm hiểu khái niệm biến trong Python.", false),
  seg(24, 297250, 311880, "Biến là tên gọi dùng để lưu trữ một giá trị trong bộ nhớ của chương trình.", false),
  seg(25, 312000, 328880, "Ví dụ, gán tuoi bằng 20 nghĩa là biến tuoi đang giữ giá trị số nguyên hai mươi.", false),
  seg(26, 329250, 347880, "Python tự nhận biết kiểu dữ liệu nên các bạn không cần khai báo kiểu như ở nhiều ngôn ngữ khác.", false),
  seg(27, 348000, 365880, "Một khái niệm quan trọng khác là kiểu dữ liệu, gồm số nguyên, số thực, chuỗi và logic.", false),
  seg(28, 367250, 378880, "Dùng hàm type để kiểm tra kiểu dữ liệu của một biến bất kỳ.", false),
  seg(29, 379000, 395880, "Tên biến nên viết thường, các từ cách nhau bằng dấu gạch dưới theo quy ước PEP 8.", false),
  seg(30, 396250, 410880, "Hãy tránh đặt tên biến bắt đầu bằng chữ số hoặc trùng với từ khóa của Python.", false),
  seg(31, 411000, 421880, "Tiếp theo là cách nhập dữ liệu từ bàn phím bằng hàm input.", false),
  seg(32, 422250, 436880, "Giá trị trả về của hàm input luôn là chuỗi, nên cần ép kiểu trước khi tính toán.", false),
  seg(33, 437000, 446880, "Các bạn dùng hàm int hoặc float để chuyển chuỗi sang số.", false),
  seg(34, 449250, 464880, "Hãy thử viết chương trình hỏi tên và tuổi của người dùng rồi in lời chào tương ứng.", false),
  seg(35, 465000, 488880, "Khi gặp lỗi, đừng lo lắng, hãy đọc kỹ thông báo lỗi vì nó chỉ rõ tên lỗi, tên tệp và dòng gây ra sự cố; phần lớn lỗi của người mới học đến từ việc thụt lề sai, thiếu dấu hai chấm hoặc gõ nhầm tên biến, và chỉ cần sửa đúng chỗ là chương trình sẽ chạy bình thường.", true),
  seg(36, 489250, 503880, "Lỗi thường gặp nhất ở người mới học là thụt lề sai hoặc thiếu dấu hai chấm.", false),
  seg(37, 504000, 519880, "Để luyện tập, các bạn hãy làm bài tập cuối bài về tính diện tích hình chữ nhật.", false),
  seg(38, 520250, 535880, "Nhớ lưu tệp thường xuyên bằng tổ hợp phím Ctrl cộng S để không mất mã nguồn.", false),
  seg(39, 537000, 549880, "Trong bài tiếp theo, chúng ta sẽ học về câu lệnh điều kiện và vòng lặp.", false),
  seg(40, 550250, 559880, "Cảm ơn các bạn đã theo dõi, hẹn gặp lại ở bài học sau.", false),
];

export const MOCK_TRANSCRIPT_VERSIONS: TranscriptVersion[] = [
  { version: 1, createdAt: "2026-08-14T10:15:00+07:00", createdBy: "Whisper AI" },
  { version: 2, createdAt: "2026-08-15T08:30:00+07:00", createdBy: "TS. Nguyễn Văn A" },
  { version: 3, createdAt: "2026-08-16T14:05:00+07:00", createdBy: "Trần Quản Trị" },
];

const MOCK_CURRENT_EDITOR = "Trần Quản Trị";

const V1_TEXT_OVERRIDES: Record<string, string> = {
  "seg-07": "Bước này rất quan trọng vì nó cho phép chạy lệnh pai thon từ bất kỳ thư mục nào.",
  "seg-19": "Tạo tệp mới đặt tên là hello chấm pi rồi gõ dòng lệnh print với nội dung Xin chào.",
  "seg-35":
    "Khi gặp lỗi, đừng lo lắng, hãy đọc kỹ thông báo lỗi vì nó chỉ rõ tên lỗi, tên tệp và dòng gây ra sự cố.",
};

const V2_FIXED_IDS = ["seg-07", "seg-19"];

interface MockVersionRecord {
  meta: TranscriptVersion;
  segments: TranscriptSegment[];
}

const versionStore = new Map<string, MockVersionRecord[]>();

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function cloneSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  return segments.map((item) => ({ ...item }));
}

function buildSeedSegments(version: number): TranscriptSegment[] {
  if (version >= 3) return cloneSegments(MOCK_SEGMENTS);
  return MOCK_SEGMENTS.map((item) => {
    const isFixedInV2 = version === 2 && V2_FIXED_IDS.includes(item.id);
    return {
      ...item,
      text: isFixedInV2 ? item.text : V1_TEXT_OVERRIDES[item.id] ?? item.text,
      edited: isFixedInV2,
    };
  });
}

function findVideo(videoId: string) {
  const found = MOCK_VIDEOS.find((item) => item.videoId === videoId);
  if (found) return found;
  if (videoId) {
    return {
      videoId,
      lessonId: `les-${videoId.slice(0, 8)}`,
      videoTitle: `Video ${videoId.slice(0, 8)}`,
      lessonTitle: "Bài giảng",
      courseTitle: "Khóa học",
      overallStatus: "completed" as const,
      thumbnailUrl: null,
      durationSec: 560,
      uploadedAt: new Date().toISOString(),
    };
  }
  return undefined;
}

function getRecords(videoId: string): MockVersionRecord[] {
  const existing = versionStore.get(videoId);
  if (existing) return existing;
  const seeded = MOCK_TRANSCRIPT_VERSIONS.map((meta) => ({
    meta: { ...meta },
    segments: buildSeedSegments(meta.version),
  }));
  versionStore.set(videoId, seeded);
  return seeded;
}

function getEditableRecords(videoId: string): MockVersionRecord[] {
  const video = findVideo(videoId);
  if (!video || video.overallStatus !== "completed") {
    throw new Error("Video chưa có phụ đề để cập nhật.");
  }
  return getRecords(videoId);
}

function appendVersion(
  records: MockVersionRecord[],
  segments: TranscriptSegment[]
): SaveTranscriptResult {
  const latest = records[records.length - 1];
  const reindexingTriggered = hasTranscriptTextChanged(latest.segments, segments);
  const meta: TranscriptVersion = {
    version: latest.meta.version + 1,
    createdAt: new Date().toISOString(),
    createdBy: MOCK_CURRENT_EDITOR,
  };
  records.push({ meta, segments: cloneSegments(segments) });
  return { version: meta.version, reindexingTriggered, segments: cloneSegments(segments) };
}

export async function mockGetTranscript(
  videoId: string,
  version?: number
): Promise<Transcript | null> {
  await delay(400);
  const video = findVideo(videoId);
  if (!video) return null;

  const baseInfo = {
    videoId,
    lessonId: video.lessonId,
    transcriptId: `tc-${video.videoId.replace("vid-", "")}`,
    videoTitle: video.videoTitle,
    lessonTitle: video.lessonTitle,
    courseTitle: video.courseTitle,
    previewUrl: MOCK_TRANSCRIPT_PREVIEW_URL,
  };

  if (video.overallStatus !== "completed") {
    return { ...baseInfo, version: 0, segments: [] };
  }

  const records = getRecords(videoId);
  const record =
    version === undefined
      ? records[records.length - 1]
      : records.find((item) => item.meta.version === version);
  if (!record) return null;

  return {
    ...baseInfo,
    version: record.meta.version,
    segments: cloneSegments(record.segments),
  };
}

export async function mockGetTranscriptVersions(videoId: string): Promise<TranscriptVersion[]> {
  await delay(300);
  const video = findVideo(videoId);
  if (!video || video.overallStatus !== "completed") return [];
  return getRecords(videoId).map((item) => ({ ...item.meta }));
}

export async function mockSaveTranscript(
  videoId: string,
  segments: TranscriptSegment[],
  baseVersion: number
): Promise<SaveTranscriptResult> {
  await delay(600);
  const records = getEditableRecords(videoId);
  const latest = records[records.length - 1];
  if (baseVersion !== latest.meta.version) throw new TranscriptConflictError();
  const normalized = segments.map((item, index) => ({
    ...item,
    id: `seg-${String(index + 1).padStart(2, "0")}`,
    text: item.text.trim(),
  }));
  return appendVersion(records, normalized);
}

export async function mockRestoreTranscriptVersion(
  videoId: string,
  version: number
): Promise<SaveTranscriptResult> {
  await delay(600);
  const records = getEditableRecords(videoId);
  const target = records.find((item) => item.meta.version === version);
  if (!target) throw new Error("Không tìm thấy phiên bản cần khôi phục.");
  return appendVersion(records, target.segments);
}
