"use client";

import React, { useState } from "react";
import { Chapter, Lesson } from "@/types/course.types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DotsSixVertical, Trash, Plus, X, PencilSimple } from "@phosphor-icons/react";

interface SyllabusEditorProps {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}

interface SortableLessonItemProps {
  lesson: Lesson;
  chapterIndex: number;
  index: number;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
}

const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  lesson,
  chapterIndex,
  index,
  onUpdateTitle,
  onDelete,
}) => {
  const [title, setTitle] = useState(lesson.title);

  React.useEffect(() => {
    setTitle(lesson.title);
  }, [lesson.title]);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs group gap-2"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-purple-600 p-0.5 shrink-0"
          title="Kéo thả sắp xếp thứ tự bài giảng"
        >
          <DotsSixVertical size={14} />
        </button>
        <span className="text-neutral-400 font-mono text-[11px] shrink-0 font-medium">
          {chapterIndex + 1}.{index + 1}
        </span>
        <div className="flex-1 flex items-center gap-1.5 bg-white hover:bg-neutral-100/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-purple-500/20 focus-within:border-purple-400 border border-neutral-200/60 rounded-lg px-2.5 py-1 transition min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onUpdateTitle(e.target.value);
            }}
            className="w-full text-xs font-medium text-neutral-800 bg-transparent focus:outline-none"
            placeholder="Nhập tên bài giảng..."
          />
        </div>
        {lesson.isPreview && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
            Học thử
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="text-neutral-400 hover:text-red-500 text-xs p-1 shrink-0"
        title="Xóa bài giảng"
      >
        <X size={14} />
      </button>
    </div>
  );
};

interface SortableChapterItemProps {
  chapter: Chapter;
  chapterIndex: number;
  onUpdateTitle: (title: string) => void;
  onDeleteChapter: () => void;
  onAddLesson: (title: string, isPreview: boolean) => void;
  onUpdateLessonTitle: (lessonIndex: number, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

const SortableChapterItem: React.FC<SortableChapterItemProps> = ({
  chapter,
  chapterIndex,
  onUpdateTitle,
  onDeleteChapter,
  onAddLesson,
  onUpdateLessonTitle,
  onDeleteLesson,
}) => {
  const [title, setTitle] = useState(chapter.title);

  React.useEffect(() => {
    setTitle(chapter.title);
  }, [chapter.title]);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: chapter.id,
  });

  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveLesson = () => {
    if (!newLessonTitle.trim()) return;
    onAddLesson(newLessonTitle.trim(), isPreview);
    setNewLessonTitle("");
    setIsPreview(false);
    setIsAddingLesson(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-2xl border border-purple-100 p-4 shadow-2xs space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-purple-600 p-1 shrink-0"
            title="Kéo thả sắp xếp thứ tự chương"
          >
            <DotsSixVertical size={18} />
          </button>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 shrink-0">
            Chương {chapterIndex + 1}
          </span>
          <div className="flex-1 flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-600 border border-neutral-200 rounded-xl px-3 py-1.5 transition min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                onUpdateTitle(e.target.value);
              }}
              className="w-full text-xs font-bold text-neutral-900 bg-transparent focus:outline-none"
              placeholder="Nhập tiêu đề chương học..."
            />
            <PencilSimple size={14} className="text-neutral-400 shrink-0 pointer-events-none" />
          </div>
        </div>
        <button
          type="button"
          onClick={onDeleteChapter}
          className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
          title="Xóa chương này"
        >
          <Trash size={16} />
        </button>
      </div>

      <div className="pl-6 space-y-2 border-l-2 border-purple-100">
        {chapter.lessons.length === 0 ? (
          <p className="text-[11px] text-neutral-400 italic">Chưa có bài giảng nào trong chương này.</p>
        ) : (
          <SortableContext
            items={chapter.lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {chapter.lessons.map((lesson, lIdx) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  chapterIndex={chapterIndex}
                  index={lIdx}
                  onUpdateTitle={(newTitle) => onUpdateLessonTitle(lIdx, newTitle)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}

        <button
          type="button"
          onClick={() => setIsAddingLesson(true)}
          className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-semibold pt-1 transition"
        >
          <Plus size={14} weight="bold" />
          <span>Thêm bài giảng vào chương</span>
        </button>
      </div>

      <Modal
        open={isAddingLesson}
        onClose={() => setIsAddingLesson(false)}
        title={`Thêm bài giảng vào Chương ${chapterIndex + 1}`}
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Tiêu đề bài giảng <span className="text-red-500">*</span>
            </label>
            <Input
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="Ví dụ: 1.1 Khởi tạo môi trường phát triển..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`preview-${chapter.id}`}
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor={`preview-${chapter.id}`} className="text-xs text-neutral-700 cursor-pointer">
              Cho phép học sinh xem trước miễn phí (Học thử)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outlined" size="sm" onClick={() => setIsAddingLesson(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSaveLesson}>
              Lưu bài giảng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const SyllabusEditor: React.FC<SyllabusEditorProps> = ({ chapters, onChange }) => {
  const [chapterToDelete, setChapterToDelete] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Kéo thả sắp xếp Chương
    const activeChapterIdx = chapters.findIndex((c) => c.id === active.id);
    const overChapterIdx = chapters.findIndex((c) => c.id === over.id);
    if (activeChapterIdx !== -1 && overChapterIdx !== -1) {
      onChange(arrayMove(chapters, activeChapterIdx, overChapterIdx));
      return;
    }

    // Kéo thả sắp xếp Bài giảng trong cùng một Chương
    for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
      const lessons = chapters[cIdx].lessons;
      const activeLessonIdx = lessons.findIndex((l) => l.id === active.id);
      const overLessonIdx = lessons.findIndex((l) => l.id === over.id);
      if (activeLessonIdx !== -1 && overLessonIdx !== -1) {
        const updatedChapters = [...chapters];
        updatedChapters[cIdx] = {
          ...chapters[cIdx],
          lessons: arrayMove(lessons, activeLessonIdx, overLessonIdx),
        };
        onChange(updatedChapters);
        return;
      }
    }
  };

  const handleAddChapter = () => {
    const newChap: Chapter = {
      id: `chap-${Date.now()}`,
      title: "Tiêu đề chương mới",
      order: chapters.length + 1,
      lessons: [],
    };
    onChange([...chapters, newChap]);
  };

  const handleUpdateChapterTitle = (index: number, newTitle: string) => {
    const updated = chapters.map((c, i) =>
      i === index ? { ...c, title: newTitle } : c
    );
    onChange(updated);
  };

  const handleUpdateLessonTitle = (
    chapterIndex: number,
    lessonIndex: number,
    newTitle: string
  ) => {
    const updated = chapters.map((c, cIdx) => {
      if (cIdx !== chapterIndex) return c;
      return {
        ...c,
        lessons: c.lessons.map((l, lIdx) =>
          lIdx === lessonIndex ? { ...l, title: newTitle } : l
        ),
      };
    });
    onChange(updated);
  };

  const confirmDeleteChapter = () => {
    if (chapterToDelete !== null) {
      onChange(chapters.filter((_, i) => i !== chapterToDelete));
      setChapterToDelete(null);
    }
  };

  const handleAddLesson = (chapterIndex: number, title: string, isPreview: boolean) => {
    const updated = chapters.map((c, cIdx) => {
      if (cIdx !== chapterIndex) return c;
      const newLesson: Lesson = {
        id: `les-${Date.now()}`,
        title,
        isPreview,
        order: c.lessons.length + 1,
      };
      return {
        ...c,
        lessons: [...c.lessons, newLesson],
      };
    });
    onChange(updated);
  };

  const handleDeleteLesson = (chapterIndex: number, lessonId: string) => {
    const updated = chapters.map((c, cIdx) => {
      if (cIdx !== chapterIndex) return c;
      return {
        ...c,
        lessons: c.lessons.filter((l) => l.id !== lessonId),
      };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
            Đề cương khóa học ({chapters.length} chương)
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Kéo thả biểu tượng ⠿ để sắp xếp lại thứ tự chương và bài giảng.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddChapter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
        >
          <Plus size={14} weight="bold" />
          <span>Thêm chương mới</span>
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-purple-200 p-8 text-center space-y-3">
          <p className="text-xs text-neutral-500">Khóa học hiện chưa có chương đề cương nào.</p>
          <Button variant="outlined" size="sm" onClick={handleAddChapter}>
            + Bắt đầu thêm Chương 1
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapters.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <SortableChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  chapterIndex={index}
                  onUpdateTitle={(title) => handleUpdateChapterTitle(index, title)}
                  onDeleteChapter={() => setChapterToDelete(index)}
                  onAddLesson={(title, isPrev) => handleAddLesson(index, title, isPrev)}
                  onUpdateLessonTitle={(lessonIndex, title) =>
                    handleUpdateLessonTitle(index, lessonIndex, title)
                  }
                  onDeleteLesson={(lessonId) => handleDeleteLesson(index, lessonId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        open={chapterToDelete !== null}
        onClose={() => setChapterToDelete(null)}
        title="Xác nhận xóa chương học"
      >
        <div className="space-y-3 py-2 text-xs">
          <p className="text-neutral-700">
            Bạn có chắc chắn muốn xóa chương này cùng toàn bộ các bài giảng bên trong?
          </p>
          <p className="text-red-500 font-medium">Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outlined" size="sm" onClick={() => setChapterToDelete(null)}>
              Hủy
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDeleteChapter}>
              Xóa chương
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
