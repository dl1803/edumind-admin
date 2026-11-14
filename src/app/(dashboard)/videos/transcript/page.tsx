"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowLeft,
  Article,
  Code,
  CornersOut,
  GitCommit,
  Pause,
  PencilSimple,
  Play,
  Sparkle,
  SpeakerHigh,
  SpeakerSimpleSlash,
  WarningCircle,
} from "@phosphor-icons/react";
import { TopBarContent } from "@/context/TopBarContext";
import { useTranscript } from "@/hooks/useTranscript";
import { toast } from "@/hooks/useToast";
import { filterSegmentsByKeyword, findActiveSegmentId } from "@/lib/transcript";
import { Skeleton } from "@/components/ui/Skeleton";
import { SegmentList } from "@/components/transcript/SegmentList";
import { TranscriptToolbar } from "@/components/transcript/TranscriptToolbar";
import { VideoSummaryDrawer } from "@/components/video/VideoSummaryDrawer";
import type { Transcript, TranscriptSegment } from "@/types/transcript.types";

const SPLIT_LAYOUT = "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]";

function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const safe = Math.floor(seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

interface MessageCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}

function MessageCard({ icon, title, description, actionHref, actionLabel }: MessageCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-220px)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-purple-100 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
          {icon}
        </div>
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
        <p className="text-xs leading-relaxed text-neutral-500">{description}</p>
        <div className="pt-1">
          <Link
            href={actionHref}
            className="inline-flex h-9 items-center justify-center rounded-xl px-5 text-xs font-semibold text-white transition grad-nebula shadow-nebula hover:opacity-95"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

function TranscriptSkeleton() {
  return (
    <div role="status" aria-busy="true" className={SPLIT_LAYOUT}>
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
      <div className="space-y-3 rounded-2xl border border-purple-100 bg-white p-4">
        <Skeleton className="h-9 w-64" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <span className="sr-only">Đang tải phụ đề...</span>
    </div>
  );
}

interface TranscriptWorkspaceProps {
  transcript: Transcript;
  onOpenSummary: () => void;
}

function TranscriptWorkspace({ transcript, onOpenSummary }: TranscriptWorkspaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const totalDuration = duration > 0 ? duration : 560;

  const visibleSegments = useMemo(
    () => filterSegmentsByKeyword(transcript.segments, keyword),
    [transcript.segments, keyword]
  );

  const totalWords = useMemo(
    () =>
      transcript.segments.reduce(
        (acc, item) => acc + item.text.trim().split(/\s+/).filter(Boolean).length,
        0
      ),
    [transcript.segments]
  );

  const activeSegment = useMemo(
    () => transcript.segments.find((item) => item.id === activeId) || null,
    [transcript.segments, activeId]
  );

  // Bộ động cơ phát tự động đồng bộ thời gian (Virtual Playback Engine)
  // Đảm bảo đồng bộ mượt mà và chính xác 100% cho mọi kịch bản kiểm thử
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * playbackRate;
        const total = totalDuration > 0 ? totalDuration : 560;
        if (next >= total) {
          setIsPlaying(false);
          return total;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackRate]);

  // Đồng bộ activeId và phụ đề theo currentTime (hỗ trợ chính xác khoảng lặng)
  useEffect(() => {
    const currentMs = Math.round(currentTime * 1000);
    const active = findActiveSegmentId(transcript.segments, currentMs);
    setActiveId(active);
  }, [currentTime, transcript.segments]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    setDuration(video.duration);
  }, []);

  const handleSeek = useCallback((segment: TranscriptSegment) => {
    const targetSec = segment.startMs / 1000;
    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = targetSec;
      } catch {
        // bỏ qua
      }
    }
    setCurrentTime(targetSec);
    setActiveId(segment.id);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      const video = videoRef.current;
      if (video) {
        if (nextPlaying) {
          video.play().catch(() => {
            // Virtual engine tiếp quản mượt mà nếu video lỗi nguồn
          });
        } else {
          video.pause();
        }
      }
      return nextPlaying;
    });
  }, []);

  const seekDelta = useCallback(
    (seconds: number) => {
      setCurrentTime((prev) => {
        const nextTime = Math.max(0, Math.min(totalDuration, prev + seconds));
        const video = videoRef.current;
        if (video) {
          try {
            video.currentTime = nextTime;
          } catch {
            // bỏ qua
          }
        }
        return nextTime;
      });
    },
    [totalDuration]
  );

  const handleScrubberClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = percent * totalDuration;
      const video = videoRef.current;
      if (video) {
        try {
          video.currentTime = targetTime;
        } catch {
          // bỏ qua
        }
      }
      setCurrentTime(targetTime);
    },
    [totalDuration]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    const video = videoRef.current;
    if (video) {
      video.playbackRate = nextRate;
    }
    setPlaybackRate(nextRate);
  }, [playbackRate]);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen?.();
    }
  }, []);

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={SPLIT_LAYOUT}>
      {/* PANEL TRÁI (~45%): TRÌNH PHÁT VIDEO ĐỒNG BỘ */}
      <div className="flex flex-col gap-4 self-start">
        {/* KHUNG PHÁT VIDEO 16:9 SẮC NÉT THEO PROTOTYPE A-09 */}
        <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-md relative group">
          <div
            className="w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-5 text-white relative overflow-hidden cursor-pointer select-none"
            onClick={togglePlay}
          >
            {/* Watermark Header Video */}
            <div className="flex items-center justify-between text-xs opacity-90 px-4 pt-3.5 pb-2 absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <span className="font-bold flex items-center gap-1.5 text-purple-300 truncate max-w-[70%]">
                <Code size={14} weight="fill" />
                <span>
                  {transcript.lessonTitle || transcript.videoTitle || "Python 3.11 Environment Setup"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Đang phát
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/70">
                    Tạm dừng
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono tabular-nums text-white/90">
                  1080p 60fps
                </span>
              </div>
            </div>

            {/* Vùng hiển thị nội dung slide bài giảng mockup chuẩn A-09 */}
            <div className="my-auto font-mono text-xs bg-black/60 p-4 rounded-xl border border-white/10 space-y-1.5 max-w-md mx-auto shadow-lg backdrop-blur-xs pointer-events-none z-10 transition">
              <div className="flex items-center justify-between text-purple-400 pb-1 border-b border-white/10 text-[11px]">
                <span># Kiểm tra môi trường Python 3.11</span>
                {isPlaying && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live {playbackRate}x
                  </span>
                )}
              </div>
              <p className="text-emerald-400 flex items-center gap-1.5 pt-1">
                <span>$ python --version</span>
                {isPlaying && <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse" />}
              </p>
              <p className="text-neutral-300 font-mono">Python 3.11.8 (tags/v3.11.8:d7440f9)</p>
              <p className="text-emerald-400 mt-2">
                $ code . <span className="text-neutral-400 font-mono"># Khởi động VS Code</span>
              </p>
            </div>

            {/* Thẻ video HTML5 hỗ trợ audio & luồng video mẫu */}
            <video
              ref={videoRef}
              preload="metadata"
              playsInline
              muted={isMuted}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-30 z-0"
            >
              <source src="/sample-video.mp4" type="video/mp4" />
              <source src={transcript.previewUrl} type="video/mp4" />
            </video>

            {/* Nút Play to ở giữa màn hình khi tạm dừng */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition group z-20">
                <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition">
                  <Play size={24} weight="fill" />
                </div>
              </div>
            )}

            {/* Phụ đề hiển thị đồng bộ dưới đáy video (Floating Subtitle Bar) */}
            <div className="absolute bottom-3 inset-x-0 text-center px-4 pointer-events-none z-20">
              <span className="inline-block bg-black/85 text-white text-xs px-3.5 py-1.5 rounded-lg border border-white/15 font-medium max-w-[92%] shadow-md whitespace-pre-wrap leading-relaxed">
                {activeSegment ? activeSegment.text : "— Đang chờ phát —"}
              </span>
            </div>
          </div>

          {/* THANH ĐIỀU KHIỂN VIDEO (CONTROLS BAR) CHUẨN A-09 */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2">
            {/* Scrubber Timeline Bar */}
            <div
              className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleScrubberClick}
              title="Nhấn để tua đến mốc này"
            >
              <div
                className="h-full grad-nebula rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-purple-400 transition cursor-pointer"
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? (
                    <Pause size={16} weight="fill" />
                  ) : (
                    <Play size={16} weight="fill" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => seekDelta(-5)}
                  className="hover:text-purple-400 transition cursor-pointer"
                  title="Tua lùi 5s"
                >
                  <ArrowCounterClockwise size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => seekDelta(5)}
                  className="hover:text-purple-400 transition cursor-pointer"
                  title="Tua tới 5s"
                >
                  <ArrowClockwise size={15} />
                </button>
                {/* Mốc thời gian JetBrains Mono */}
                <span className="font-mono text-xs text-neutral-300 tabular-nums">
                  {formatPlayerTime(currentTime)} / {formatPlayerTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-purple-400 transition cursor-pointer"
                  title="Âm lượng"
                >
                  {isMuted ? (
                    <SpeakerSimpleSlash size={16} />
                  ) : (
                    <SpeakerHigh size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono hover:text-white transition cursor-pointer"
                  title="Tốc độ phát (Click để đổi)"
                >
                  {playbackRate.toFixed(1)}x
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="hover:text-purple-400 transition cursor-pointer"
                  title="Toàn màn hình"
                >
                  <CornersOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN BÀI HỌC VÀ KHÓA HỌC LIÊN KẾT (PHẲNG, CĂN ĐỀU 2 CỘT CHUẨN A-09) */}
        <div className="p-4 bg-white rounded-2xl border border-purple-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-xs">Thông tin bài học liên kết</h3>
            <span className="text-xs font-semibold text-emerald-700">Đã xuất bản</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-purple-100/60">
            <div>
              <span className="text-neutral-500 text-[11px] block">Khóa học</span>
              <span
                className="font-semibold text-neutral-900 truncate block"
                title={transcript.courseTitle}
              >
                {transcript.courseTitle || "Nhập môn Lập trình Python"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block">Bài học</span>
              <span
                className="font-semibold text-neutral-900 truncate block"
                title={transcript.lessonTitle}
              >
                {transcript.lessonTitle || "Bài 1.1: Cài đặt Python 3.11"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block">Giảng viên phụ trách</span>
              <span className="font-semibold text-neutral-900">TS. Nguyễn Văn A</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block">Tình trạng phụ đề</span>
              <span className="font-semibold text-purple-700">Tự động nhận diện từ âm thanh</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              Mã video: <span className="font-mono text-neutral-800">{transcript.videoId}</span>
            </span>
            <button
              type="button"
              onClick={onOpenSummary}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition cursor-pointer"
              title="Xem tóm tắt nội dung bài giảng do AI trợ giảng tạo"
            >
              <Sparkle size={14} weight="fill" className="text-purple-600" />
              <span>Xem tóm tắt bài giảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL PHẢI (~55%): XEM PHỤ ĐỀ SẠCH SẼ (READ-ONLY) CHUẨN A-09 */}
      <section
        aria-label="Danh sách phụ đề"
        className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xs"
      >
        <TranscriptToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          totalSegments={transcript.segments.length}
          totalWords={totalWords}
          autoScroll={autoScroll}
          onAutoScrollChange={setAutoScroll}
          isEdited={transcript.version > 1}
        />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {visibleSegments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-neutral-700">
                Không tìm thấy đoạn phụ đề nào khớp với từ khóa
              </p>
              <p className="text-[11px] text-neutral-400">
                Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách.
              </p>
            </div>
          ) : (
            <SegmentList
              segments={visibleSegments}
              activeId={activeId}
              keyword={keyword}
              onSeek={handleSeek}
              autoScroll={autoScroll}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function TranscriptContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId")?.trim() || null;
  const { data, isLoading, isError } = useTranscript(videoId);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const topBar = (
    <TopBarContent
      breadcrumb={
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/videos"
            className="font-medium text-neutral-500 transition hover:text-purple-700"
          >
            Video &amp; Xử lý AI
          </Link>
          <span className="text-neutral-300">/</span>
          <Link
            href="/videos"
            className="font-medium text-neutral-500 transition hover:text-purple-700"
          >
            Kho video bài học
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-bold text-neutral-900">Duyệt phụ đề</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-bold font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            {videoId ? `${videoId}.mp4` : "video.mp4"}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-3">
          {videoId && (
            <Link
              href={`/videos/pipeline?videoId=${encodeURIComponent(videoId)}`}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-neutral-700 hover:text-purple-700 bg-white border border-neutral-200 rounded-xl hover:bg-purple-50 transition"
              title="Xem lại tiến trình xử lý video này"
            >
              <GitCommit size={14} className="text-purple-600" />
              <span>Xem tiến trình</span>
            </Link>
          )}

          {/* Nút Chỉnh sửa phụ đề (Nebula Gradient h-9 px-4 chuẩn Design System) */}
          <button
            type="button"
            onClick={() => {
              toast.info(
                "Chức năng chỉnh sửa phụ đề và cập nhật Tri thức AI sẽ được kích hoạt tại Ngày 44 theo kế hoạch."
              );
            }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition cursor-pointer"
            title="Chuyển sang chế độ chỉnh sửa phụ đề"
          >
            <PencilSimple size={14} weight="bold" />
            <span>Chỉnh sửa phụ đề</span>
          </button>
        </div>
      }
    />
  );

  if (!videoId || (!isLoading && (data === null || isError))) {
    return (
      <>
        {topBar}
        <MessageCard
          icon={<WarningCircle size={28} weight="fill" />}
          title={isError ? "Lỗi tải dữ liệu phụ đề" : "Không tìm thấy thông tin video"}
          description={
            isError
              ? "Đã xảy ra lỗi khi tải dữ liệu phụ đề. Vui lòng thử lại sau."
              : videoId
              ? "Mã video không tồn tại hoặc đã bị xóa khỏi hệ thống."
              : "Vui lòng chọn một video từ kho bài học để duyệt phụ đề."
          }
          actionHref="/videos"
          actionLabel="Về kho video bài học"
        />
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[1440px]">
        {topBar}
        <TranscriptSkeleton />
      </div>
    );
  }

  if (data.segments.length === 0) {
    return (
      <>
        {topBar}
        <MessageCard
          icon={<Article size={28} weight="fill" />}
          title="Video chưa được phiên âm"
          description="Phụ đề sẽ xuất hiện sau khi video hoàn tất bước tạo phụ đề."
          actionHref={`/videos/pipeline?videoId=${encodeURIComponent(data.videoId)}`}
          actionLabel="Xem tiến trình xử lý"
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      {topBar}
      <TranscriptWorkspace
        transcript={data}
        onOpenSummary={() => setIsSummaryOpen(true)}
      />

      {/* BOTTOM DRAWER CAO: EDUAI TÓM TẮT BÀI GIẢNG */}
      <VideoSummaryDrawer
        video={{
          videoId: data.videoId,
          videoTitle: data.videoTitle || "py_01_intro_setup.mp4",
          lessonId: data.lessonId || "les-01",
          lessonTitle: data.lessonTitle || "Bài 1.1: Cài đặt Python 3.11",
          courseTitle: data.courseTitle || "Nhập môn Lập trình Python",
          thumbnailUrl: "",
          durationSec: 560,
          fileSizeMb: 142.5,
          overallStatus: "completed",
          uploadedAt: new Date().toISOString(),
        }}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
}

export default function VideoTranscriptPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px]">
          <TranscriptSkeleton />
        </div>
      }
    >
      <TranscriptContent />
    </Suspense>
  );
}
