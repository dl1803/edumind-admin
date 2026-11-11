"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CheckCircle,
  CloudArrowUp,
  Sparkle,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { TopBarContent } from "@/context/TopBarContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { UploadDropzone } from "@/components/video/UploadDropzone";
import { UploadProgressPanel } from "@/components/video/UploadProgressPanel";
import { useLessonOptions } from "@/hooks/useLessonOptions";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { loadPendingUpload } from "@/lib/uploadResumeStorage";
import { validateVideoFile } from "@/lib/uploadConstraints";
import { cn, formatFileSize } from "@/lib/utils";
import { VideoUploadFormValues, videoUploadSchema } from "@/lib/validations/videoUpload.schema";
import { PendingUpload } from "@/types/video.types";

export default function UploadVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [courseTouched, setCourseTouched] = useState(false);
  const [lessonTouched, setLessonTouched] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const upload = useVideoUpload();

  const {
    watch,
    setValue,
    trigger,
    clearErrors,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<VideoUploadFormValues>({
    resolver: zodResolver(videoUploadSchema),
    mode: "onChange",
    defaultValues: { courseId: "", lessonId: "" },
  });

  const courseId = watch("courseId");
  const lessonId = watch("lessonId");
  const { courseOptions, lessonOptions, isLoadingCourses, isLoadingLessons } = useLessonOptions(courseId);

  useEffect(() => {
    const stored = loadPendingUpload();
    setPending(stored);
    if (stored) {
      setValue("courseId", stored.courseId, { shouldValidate: true });
      setValue("lessonId", stored.lessonId, { shouldValidate: true });
    }
  }, [setValue]);

  useEffect(() => {
    setPending(loadPendingUpload());
  }, [upload.status]);

  const isActive = upload.status === "UPLOADING" || upload.status === "PAUSED" || upload.status === "FAILED";
  const isCompleted = upload.status === "COMPLETED";
  const formLocked = isActive || isCompleted || upload.isStarting;

  const pendingForForm = upload.status === "IDLE" ? pending : null;
  const pendingMatches =
    pendingForForm !== null &&
    file !== null &&
    pendingForForm.fileName === file.name &&
    pendingForForm.fileSize === file.size &&
    pendingForForm.lessonId === lessonId;
  const pendingMismatch = pendingForForm !== null && file !== null && !pendingMatches;

  const dropzoneError = fileError ?? (upload.errorKind === "FILE" ? upload.errorMessage : null);
  const shouldShowCourseError = (courseTouched || hasAttemptedSubmit) && Boolean(errors.courseId);
  const shouldShowLessonError = (lessonTouched || hasAttemptedSubmit) && Boolean(errors.lessonId);

  const isSubmitDisabled =
    formLocked ||
    upload.isStarting ||
    Boolean(dropzoneError) ||
    !file ||
    pendingMismatch ||
    !courseId ||
    !lessonId;

  const handleFileSelect = (selected: File | null) => {
    if (upload.errorKind) upload.reset();
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }
    const result = validateVideoFile(selected);
    setFile(result.valid ? selected : null);
    setFileError(result.message);
  };

  const handleCourseChange = (value: string) => {
    setValue("courseId", value, { shouldValidate: true });
    setCourseTouched(true);
    setValue("lessonId", "", { shouldValidate: false });
    clearErrors("lessonId");
    setLessonTouched(false);
  };

  const handleLessonChange = (value: string) => {
    setValue("lessonId", value, { shouldValidate: true });
    setLessonTouched(true);
  };

  const handleStart = async () => {
    if (formLocked || upload.isStarting) return;
    setHasAttemptedSubmit(true);
    const valid = await trigger();
    if (!file) {
      setFileError("Vui lòng chọn file video để tải lên");
      return;
    }
    if (!valid || dropzoneError || pendingMismatch) {
      return;
    }
    void upload.start(file, courseId, lessonId);
  };

  const handleRetry = () => {
    if (upload.status === "FAILED") {
      upload.resume();
    } else if (file) {
      void upload.start(file, courseId, lessonId);
    }
  };

  const handleDiscardPending = async () => {
    await upload.cancel();
    setPending(null);
  };

  const handleUploadAnother = () => {
    upload.reset();
    setFile(null);
    setFileError(null);
    setCourseTouched(false);
    setLessonTouched(false);
    setHasAttemptedSubmit(false);
    resetForm({ courseId: "", lessonId: "" });
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <Link href="/videos" className="text-neutral-500 hover:text-purple-700 font-medium transition">
              Video &amp; Xử lý AI
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-bold text-neutral-900">Kho video bài học</span>
          </div>
        }
      />

      <div className="w-[580px] max-w-full bg-white rounded-2xl p-6 shadow-2xl border border-purple-100 relative space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0">
              <CloudArrowUp size={22} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Tải lên video bài giảng mới</h3>
              <p className="text-[11px] text-neutral-500">Mỗi video được gán trực tiếp vào một bài học và kích hoạt pipeline xử lý AI</p>
            </div>
          </div>
          <Link
            href="/videos"
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </Link>
        </div>

        {pendingForForm && !file && (
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-neutral-700 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-purple-900 flex items-center gap-1.5">
                <Sparkle size={14} weight="fill" className="text-purple-600" />
                Có phiên tải dở dang
              </p>
              <button
                type="button"
                onClick={handleDiscardPending}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer shrink-0"
              >
                Bỏ phiên dở dang
              </button>
            </div>
            <p className="text-[11px] text-neutral-600">
              File: <strong className="text-neutral-900">{pendingForForm.fileName}</strong> ({formatFileSize(pendingForForm.fileSize)}). Hãy chọn lại đúng file này để tiếp tục tải.
            </p>
          </div>
        )}

        {pendingMismatch && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center justify-between gap-2 font-semibold text-[11px]">
              <div className="flex items-center gap-1.5">
                <WarningCircle size={15} weight="fill" className="shrink-0 text-amber-600" />
                <span>File hoặc bài học không khớp với bản ghi dở dang</span>
              </div>
              <button
                type="button"
                onClick={handleDiscardPending}
                className="text-[11px] text-amber-900 font-bold underline cursor-pointer shrink-0"
              >
                Bỏ phiên dở dang
              </button>
            </div>
            <p className="text-[10px] text-amber-800">
              Vui lòng chọn đúng file ({pendingForForm?.fileName}) và bài học đã lưu, hoặc bấm bỏ phiên dở dang để bắt đầu mới.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Khóa học <span className="text-red-500">*</span>
            </label>
            <SelectDropdown
              value={courseId}
              options={courseOptions}
              onChange={handleCourseChange}
              placeholder={isLoadingCourses ? "Đang tải khóa học..." : "Chọn khóa học"}
              disabled={formLocked || isLoadingCourses}
              error={shouldShowCourseError}
              fullWidth
            />
            {shouldShowCourseError && (
              <div role="alert" className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-600 font-medium">
                <WarningCircle size={14} weight="fill" className="shrink-0 text-red-500" />
                <span>{errors.courseId?.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Gán vào bài học <span className="text-red-500">*</span> <span className="text-neutral-500 font-normal">(1 bài/video)</span>
            </label>
            <SelectDropdown
              value={lessonId}
              options={lessonOptions}
              onChange={handleLessonChange}
              placeholder={
                isLoadingLessons
                  ? "Đang tải bài học..."
                  : !courseId
                  ? "Chọn khóa học trước"
                  : "Chọn bài học"
              }
              disabled={formLocked || !courseId || isLoadingLessons}
              error={shouldShowLessonError}
              fullWidth
            />
            {shouldShowLessonError && (
              <div role="alert" className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-600 font-medium">
                <WarningCircle size={14} weight="fill" className="shrink-0 text-red-500" />
                <span>{errors.lessonId?.message}</span>
              </div>
            )}
          </div>
        </div>

        {!isActive && !isCompleted && (
          <UploadDropzone
            file={file}
            error={dropzoneError}
            disabled={formLocked}
            onFileSelect={handleFileSelect}
          />
        )}

        {isActive && file && (
          <UploadProgressPanel
            status={upload.status}
            progress={upload.progress}
            fileName={file.name}
            errorMessage={upload.errorMessage}
            onPause={upload.pause}
            onResume={upload.resume}
            onRetry={handleRetry}
            onCancel={upload.cancel}
          />
        )}

        {isCompleted && (
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0" />
              <span className="font-bold text-sm">Tải lên video hoàn tất!</span>
            </div>
            <p className="text-xs text-neutral-600">
              Video đã được tải lên máy chủ an toàn và đang tự động kích hoạt pipeline xử lý AI.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleUploadAnother}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition text-xs cursor-pointer"
              >
                Tải video khác
              </button>
              <Link
                href="/videos"
                className="px-4 py-2 rounded-lg text-white grad-nebula font-semibold shadow-nebula hover:opacity-95 transition text-xs"
              >
                Về danh sách video
              </Link>
            </div>
          </div>
        )}

        <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 flex items-center gap-2 text-[11px] text-purple-700 font-medium">
          <Sparkle size={14} weight="fill" className="text-purple-600 shrink-0" />
          <span>Pipeline 4 bước (Mã hóa HLS, Whisper STT &amp; Vector Index) sẽ tự động chạy ngầm.</span>
        </div>

        {upload.errorKind === "GENERAL" && upload.status === "IDLE" && upload.errorMessage && (
          <div role="alert" className="flex items-center gap-1.5 text-[11px] font-medium text-red-600">
            <WarningCircle size={14} weight="fill" className="shrink-0 text-red-500" />
            <span>{upload.errorMessage}</span>
          </div>
        )}

        {!isCompleted && (
          <div className="flex items-center justify-end pt-4 border-t border-neutral-100 gap-2.5">
            <Link
              href="/videos"
              className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition text-xs cursor-pointer whitespace-nowrap"
            >
              Hủy
            </Link>
            <button
              type="button"
              onClick={handleStart}
              disabled={isSubmitDisabled}
              className={cn(
                "px-5 py-2.5 rounded-lg text-white font-semibold transition inline-flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0",
                isSubmitDisabled
                  ? "bg-neutral-300 opacity-60 cursor-not-allowed shadow-none"
                  : "grad-nebula shadow-nebula hover:opacity-95 cursor-pointer"
              )}
            >
              <Check size={14} weight="bold" />
              <span>{pendingMatches ? "Tiếp tục upload & Chạy Pipeline" : "Bắt đầu tải lên & Chạy Pipeline"}</span>
            </button>
          </div>
        )}
      </div>

      <Modal
        open={upload.errorKind === "CONFLICT"}
        onClose={upload.reset}
        title="Không thể tải lên"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outlined" size="sm" onClick={handleDiscardPending}>
              Hủy phiên tải dở dang
            </Button>
            <Button size="sm" onClick={upload.reset}>
              Đã hiểu
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-700">{upload.errorMessage}</p>
      </Modal>
    </div>
  );
}
