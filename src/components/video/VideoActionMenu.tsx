"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Article,
  Cpu,
  DotsThreeVertical,
  DownloadSimple,
  Link as LinkIcon,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";
import type { VideoListItem } from "@/types/video.types";

interface VideoActionMenuProps {
  video: VideoListItem;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenSummary?: (video: VideoListItem) => void;
  dropUp?: boolean;
}

export function VideoActionMenu({
  video,
  isOpen: controlledIsOpen,
  onOpenChange,
  onOpenSummary,
  dropUp = false,
}: VideoActionMenuProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setUncontrolledIsOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof next === "function" ? next(isOpen) : next;
    if (!isControlled) {
      setUncontrolledIsOpen(nextVal);
    }
    onOpenChange?.(nextVal);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-1 rounded-lg transition cursor-pointer ${
          isOpen
            ? "text-purple-700 bg-purple-100 ring-2 ring-purple-300"
            : "text-neutral-400 hover:text-purple-700 hover:bg-purple-50"
        }`}
        title="Tùy chọn thao tác"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <DotsThreeVertical size={16} weight="bold" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-52 bg-white rounded-xl shadow-2xl border border-purple-100 ring-1 ring-black/5 p-1.5 z-50 text-xs space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100`}
        >
          <Link
            href={`/videos/pipeline?videoId=${video.videoId}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition"
          >
            <Cpu size={14} className="text-purple-600" />
            <span>Tiến trình Pipeline</span>
          </Link>

          <Link
            href={`/videos/transcript?videoId=${video.videoId}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition"
          >
            <Article size={14} className="text-purple-600" />
            <span>Duyệt phụ đề</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenSummary?.(video);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition text-left cursor-pointer"
          >
            <Sparkle size={14} weight="fill" className="text-purple-600" />
            <span>Tóm tắt bài giảng AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              alert(`Đổi bài học cho video: ${video.videoTitle || video.lessonTitle}`);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition text-left cursor-pointer"
          >
            <LinkIcon size={14} className="text-purple-600" />
            <span>Đổi bài học</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              alert(`Tải tệp gốc: ${video.videoId}`);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition text-left cursor-pointer"
          >
            <DownloadSimple size={14} className="text-neutral-500" />
            <span>Tải tệp gốc</span>
          </button>

          <div className="h-px bg-neutral-100 my-1" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (confirm(`Bạn có chắc chắn muốn xóa video "${video.videoTitle || video.lessonTitle}"?`)) {
                alert(`Đã xóa video: ${video.videoId}`);
              }
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition text-left cursor-pointer"
          >
            <Trash size={14} className="text-rose-500" />
            <span>Xóa video</span>
          </button>
        </div>
      )}
    </div>
  );
}
