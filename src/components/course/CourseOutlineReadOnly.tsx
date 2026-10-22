import React, { useState } from "react";
import { ExtendedChapter, ExtendedLesson } from "@/hooks/useCourse";
import { CourseLessonDrawer } from "./CourseLessonDrawer";
import { StatusText } from "@/components/ui/StatusText";
import {
  PlayCircle,
  ArrowSquareOut,
  FolderSimplePlus,
  DotsSixVertical,
  CaretDown,
} from "@phosphor-icons/react";

interface CourseOutlineReadOnlyProps {
  chapters?: ExtendedChapter[];
  onAddChapter?: () => void;
}

export function CourseOutlineReadOnly({
  chapters = [],
  onAddChapter,
}: CourseOutlineReadOnlyProps) {
  const [selectedLesson, setSelectedLesson] = useState<{
    lesson: ExtendedLesson;
    chapterTitle: string;
    chapterOrder: number;
  } | null>(null);

  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-5xl mx-auto space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-xl">
          <FolderSimplePlus size={28} />
        </div>
        <h3 className="text-sm font-bold text-neutral-800">Chưa có đề cương bài giảng</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Khóa học này hiện chưa được thiết lập chương và bài học. Hãy sử dụng chức năng thêm chương để bắt đầu.
        </p>
        {onAddChapter && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onAddChapter}
              className="px-4 py-2 rounded-xl text-white grad-nebula text-xs font-bold inline-flex items-center gap-1.5 shadow-nebula hover:opacity-95 transition cursor-pointer"
            >
              <FolderSimplePlus size={16} weight="bold" />
              <span>Thêm chương học đầu tiên</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapterIds[chapter.id] ?? true;
        const lessonList = chapter.lessons || [];

        return (
          <div
            key={chapter.id}
            className="bg-white rounded-2xl shadow-xs overflow-hidden"
          >
            <div
              onClick={() => toggleChapter(chapter.id)}
              className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-neutral-50/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <DotsSixVertical
                  size={16}
                  className="text-slate-300 hover:text-slate-600 shrink-0"
                />
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                  {chapter.order}
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{chapter.title}</h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg">
                  {lessonList.length} bài học
                </span>
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`text-slate-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {isExpanded && (
              <>
                {lessonList.length === 0 ? (
                  <div className="p-4 pt-1 pb-4">
                    <div className="bg-neutral-50 rounded-xl p-3 text-center">
                      <span className="text-xs text-neutral-400 font-medium">
                        Chưa có bài học nào trong chương này
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 px-4 pb-2 text-xs">
                    {lessonList.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() =>
                          setSelectedLesson({
                            lesson,
                            chapterTitle: chapter.title,
                            chapterOrder: chapter.order,
                          })
                        }
                        className="py-3 px-2 hover:bg-neutral-50/70 rounded-xl transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <DotsSixVertical
                            size={14}
                            className="text-slate-300 hover:text-slate-600 shrink-0"
                          />
                          <PlayCircle size={22} weight="fill" className="text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-neutral-900 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                              <span className="truncate">{lesson.title}</span>
                              <ArrowSquareOut
                                size={12}
                                className="text-purple-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {lesson.durationSeconds
                                ? `${Math.floor(lesson.durationSeconds / 60)}:${String(
                                    lesson.durationSeconds % 60
                                  ).padStart(2, "0")}`
                                : "12:30"}{" "}
                              <span className="text-neutral-300 mx-1">|</span>{" "}
                              {lesson.fileSizeMb || 128}MB{" "}
                              <span className="text-neutral-300 mx-1">|</span>{" "}
                              {lesson.videoQuality || "HLS 1080p"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <StatusText
                            status={lesson.pipelineStatus || "READY"}
                            labelOverride={
                              lesson.pipelineStatus === "PROCESSING"
                                ? "Đang xử lý AI"
                                : lesson.pipelineStatus === "FAILED"
                                ? "Lỗi Vector Index"
                                : lesson.pipelineStatus === "COMPLETED"
                                ? "Hoàn tất"
                                : "Vector Index Sẵn sàng"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {onAddChapter && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAddChapter}
            className="w-full py-3 bg-white hover:bg-purple-50/40 rounded-2xl text-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <FolderSimplePlus size={16} weight="bold" />
            <span>+ Thêm chương học mới</span>
          </button>
        </div>
      )}

      <CourseLessonDrawer
        open={Boolean(selectedLesson)}
        lesson={selectedLesson?.lesson || null}
        chapterTitle={selectedLesson?.chapterTitle}
        chapterOrder={selectedLesson?.chapterOrder}
        onClose={() => setSelectedLesson(null)}
      />
    </div>
  );
}
