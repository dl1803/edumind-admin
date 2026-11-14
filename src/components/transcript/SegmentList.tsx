"use client";

import { useEffect, useRef } from "react";
import { Play, SpeakerHigh } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatTranscriptTime, splitByKeyword } from "@/lib/transcript";
import type { TranscriptSegment } from "@/types/transcript.types";

interface SegmentListProps {
  segments: TranscriptSegment[];
  activeId: string | null;
  keyword: string;
  onSeek: (segment: TranscriptSegment) => void;
  autoScroll?: boolean;
}

export function SegmentList({
  segments,
  activeId,
  keyword,
  onSeek,
  autoScroll = true,
}: SegmentListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    if (!activeId || !autoScroll) return;
    const row = rowRefs.current.get(activeId);
    const container = listRef.current?.parentElement;
    if (!row || !container) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetTop = row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeId, autoScroll]);

  return (
    <ul ref={listRef} className="space-y-3">
      {segments.map((segment) => {
        const isActive = segment.id === activeId;
        const startLabel = formatTranscriptTime(segment.startMs);
        const endLabel = formatTranscriptTime(segment.endMs);

        return (
          <li
            key={segment.id}
            ref={(node) => {
              if (node) rowRefs.current.set(segment.id, node);
              else rowRefs.current.delete(segment.id);
            }}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSeek(segment)}
            className={cn(
              "rounded-xl transition space-y-1.5 group cursor-pointer select-none",
              isActive
                ? "p-3.5 bg-purple-50 border-2 border-purple-500 shadow-xs relative"
                : "p-3 bg-neutral-50/70 hover:bg-neutral-100/70 border border-neutral-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {isActive ? (
                  <span
                    className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0"
                    title="Đang phát đoạn này"
                  >
                    <SpeakerHigh size={12} weight="fill" className="animate-pulse" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(segment);
                    }}
                    aria-label={`Tua video đến ${startLabel}`}
                    className="w-6 h-6 rounded-lg bg-neutral-200 text-neutral-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Nhảy video đến mốc này"
                  >
                    <Play size={10} weight="fill" />
                  </button>
                )}

                <span
                  className={cn(
                    "px-2 py-0.5 rounded font-mono text-[11px] tabular-nums",
                    isActive
                      ? "bg-white border-2 border-purple-400 text-purple-900 font-bold"
                      : "bg-white border border-neutral-200 text-neutral-600 font-semibold"
                  )}
                >
                  {startLabel} – {endLabel}
                </span>

                {isActive && (
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                    Đang phát
                  </span>
                )}

                {segment.edited && (
                  <>
                    {isActive && <span className="text-neutral-300 text-xs">•</span>}
                    <span className="text-[11px] font-bold text-amber-700">Đã sửa</span>
                  </>
                )}
              </div>
            </div>

            <p
              className={cn(
                "text-xs leading-relaxed font-sans whitespace-pre-wrap break-words",
                isActive ? "text-neutral-900 font-medium" : "text-neutral-800"
              )}
            >
              {splitByKeyword(segment.text, keyword).map((part, index) =>
                part.match ? (
                  <mark key={index} className="rounded-xs bg-amber-200 text-neutral-900 px-0.5 font-semibold">
                    {part.text}
                  </mark>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
