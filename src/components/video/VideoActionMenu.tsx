"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cpu, DotsThreeVertical } from "@phosphor-icons/react";
import type { VideoListItem } from "@/types/video.types";

interface VideoActionMenuProps {
  video: VideoListItem;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dropUp?: boolean;
}

export function VideoActionMenu({
  video,
  isOpen: controlledIsOpen,
  onOpenChange,
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
          } w-48 bg-white rounded-xl shadow-2xl border border-purple-100 ring-1 ring-black/5 p-1.5 z-50 text-xs space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100`}
        >
          <Link
            href={`/videos/pipeline?videoId=${encodeURIComponent(video.videoId)}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-purple-50 hover:text-purple-800 font-medium transition"
          >
            <Cpu size={14} className="text-purple-600" />
            <span>Tiến trình Pipeline</span>
          </Link>
        </div>
      )}
    </div>
  );
}
