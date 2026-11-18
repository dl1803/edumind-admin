"use client";

import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { ArrowCounterClockwise, Play, SpeakerHigh, WarningCircle } from "@phosphor-icons/react";
import { toast } from "@/hooks/useToast";
import { useTranscriptDraft } from "@/hooks/useTranscriptDraft";
import { cn } from "@/lib/utils";
import {
  TRANSCRIPT_TEXT_MAX_LENGTH,
  TRANSCRIPT_TIME_ERROR,
  formatTranscriptTime,
  parseTranscriptTime,
  splitByKeyword,
} from "@/lib/transcript";
import type { TranscriptSegment } from "@/types/transcript.types";

interface SegmentEditorProps {
  segment: TranscriptSegment;
  isActive: boolean;
  keyword: string;
  canMerge: boolean;
  onSeek: (segment: TranscriptSegment) => void;
}

const ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 transition hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 cursor-pointer whitespace-nowrap shrink-0 select-none shadow-2xs";

const TIME_INPUT_CLASS =
  "w-[72px] rounded border bg-white px-1 py-0.5 text-center font-mono text-[11px] tabular-nums focus:outline-none shrink-0";

export function SegmentEditor({ segment, isActive, keyword, canMerge, onSeek }: SegmentEditorProps) {
  const error = useTranscriptDraft((state) => state.errors[segment.id]);
  const canRevert = useTranscriptDraft((state) => Boolean(state.revertableIds[segment.id]));
  const updateText = useTranscriptDraft((state) => state.updateText);
  const updateTiming = useTranscriptDraft((state) => state.updateTiming);
  const setTimeError = useTranscriptDraft((state) => state.setTimeError);
  const splitAt = useTranscriptDraft((state) => state.splitAt);
  const mergeNext = useTranscriptDraft((state) => state.mergeNext);
  const revert = useTranscriptDraft((state) => state.revert);

  const [isEditingText, setIsEditingText] = useState(false);
  const [startInput, setStartInput] = useState(() => formatTranscriptTime(segment.startMs));
  const [endInput, setEndInput] = useState(() => formatTranscriptTime(segment.endMs));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textBeforeEdit = useRef(segment.text);

  const hasTimeError = error === TRANSCRIPT_TIME_ERROR;
  const hasTextError = Boolean(error) && !hasTimeError;
  const startLabel = formatTranscriptTime(segment.startMs);

  useEffect(() => {
    setStartInput(formatTranscriptTime(segment.startMs));
    setEndInput(formatTranscriptTime(segment.endMs));
  }, [segment.startMs, segment.endMs]);

  useEffect(() => {
    if (!isEditingText) return;
    const element = textareaRef.current;
    if (!element) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }, [isEditingText]);

  const startEditingText = () => {
    textBeforeEdit.current = segment.text;
    setIsEditingText(true);
  };

  const finishEditingText = () => setIsEditingText(false);

  const cancelEditingText = () => {
    updateText(segment.id, textBeforeEdit.current);
    setIsEditingText(false);
  };

  const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelEditingText();
      return;
    }
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      finishEditingText();
    }
  };

  const handleTextBlockKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startEditingText();
    }
  };

  const handleSplit = () => {
    const cursor = textareaRef.current?.selectionStart ?? segment.text.length;
    const message = splitAt(segment.id, cursor);
    if (message) {
      toast.error(message);
      return;
    }
    setIsEditingText(false);
  };

  const handleMerge = () => {
    const message = mergeNext(segment.id);
    if (message) toast.error(message);
  };

  const handleRevert = () => {
    const original = useTranscriptDraft
      .getState()
      .baseSegments.find((item) => item.id === segment.id);
    const target = original ?? segment;
    setStartInput(formatTranscriptTime(target.startMs));
    setEndInput(formatTranscriptTime(target.endMs));
    if (canRevert) {
      revert(segment.id);
    } else if (hasTimeError) {
      setTimeError(segment.id, null);
    }
    setIsEditingText(false);
  };

  const commitTiming = () => {
    const startMs = parseTranscriptTime(startInput);
    const endMs = parseTranscriptTime(endInput);
    if (startMs === null || endMs === null) {
      setTimeError(segment.id, TRANSCRIPT_TIME_ERROR);
      return;
    }
    if (startMs === segment.startMs && endMs === segment.endMs) {
      setStartInput(formatTranscriptTime(startMs));
      setEndInput(formatTranscriptTime(endMs));
      setTimeError(segment.id, null);
      return;
    }
    updateTiming(segment.id, startMs, endMs);
  };

  const handleTimeBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    commitTiming();
  };

  const handleTimeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTiming();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setStartInput(formatTranscriptTime(segment.startMs));
      setEndInput(formatTranscriptTime(segment.endMs));
      setTimeError(segment.id, null);
    }
  };

  const timeInputClass = cn(
    TIME_INPUT_CLASS,
    hasTimeError
      ? "border-error-600 text-error-600 focus:border-error-600"
      : "border-neutral-200 text-neutral-700 focus:border-purple-500"
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
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
              onClick={() => onSeek(segment)}
              aria-label={`Tua video đến ${startLabel}`}
              className="w-6 h-6 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title="Nhảy video đến mốc này"
            >
              <Play size={10} weight="fill" />
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0" onBlur={handleTimeBlur}>
            <input
              type="text"
              value={startInput}
              onChange={(event) => setStartInput(event.target.value)}
              onKeyDown={handleTimeKeyDown}
              aria-label="Thời điểm bắt đầu"
              aria-invalid={hasTimeError}
              className={timeInputClass}
            />
            <span className="text-xs text-neutral-400">–</span>
            <input
              type="text"
              value={endInput}
              onChange={(event) => setEndInput(event.target.value)}
              onKeyDown={handleTimeKeyDown}
              aria-label="Thời điểm kết thúc"
              aria-invalid={hasTimeError}
              className={timeInputClass}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isActive && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 uppercase tracking-wide shrink-0">
                Đang phát
              </span>
            )}
            {segment.edited && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 uppercase tracking-wide shrink-0">
                Đã sửa
              </span>
            )}
          </div>
        </div>

        {!isEditingText && canMerge && (
          <button
            type="button"
            onClick={handleMerge}
            className={ACTION_BUTTON_CLASS}
            title="Gộp đoạn này với đoạn kế tiếp"
          >
            Gộp với đoạn kế
          </button>
        )}
      </div>

      {isEditingText ? (
        <div className="space-y-1.5">
          <textarea
            ref={textareaRef}
            rows={3}
            value={segment.text}
            onChange={(event) => updateText(segment.id, event.target.value)}
            onKeyDown={handleTextKeyDown}
            onBlur={finishEditingText}
            aria-label="Nội dung lời thoại"
            aria-invalid={hasTextError}
            className={cn(
              "w-full resize-y rounded-lg border-2 bg-white p-2.5 text-xs font-medium text-neutral-900 focus:outline-none",
              hasTextError
                ? "border-error-600 focus:border-error-600"
                : "border-purple-300 focus:border-purple-600"
            )}
          />
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 min-w-0">
              <span className="inline-flex items-center gap-1 shrink-0">
                <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1 py-0.2 font-mono text-[10px] text-neutral-600 shadow-2xs">
                  Esc
                </kbd>
                <span>hủy</span>
              </span>
              <span className="text-neutral-300 shrink-0">•</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1 py-0.2 font-mono text-[10px] text-neutral-600 shadow-2xs">
                  Ctrl+Enter
                </kbd>
                <span>xong</span>
              </span>
              <span className="text-neutral-300 shrink-0">•</span>
              <span className="font-mono text-neutral-400 text-[11px] tabular-nums shrink-0">
                {segment.text.length.toLocaleString("vi-VN")}/
                {TRANSCRIPT_TEXT_MAX_LENGTH.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {(canRevert || hasTimeError) && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleRevert}
                  className={ACTION_BUTTON_CLASS}
                  title="Hoàn tác thay đổi của đoạn này"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Hoàn tác</span>
                </button>
              )}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSplit}
                className={ACTION_BUTTON_CLASS}
                title="Tách đoạn tại vị trí con trỏ trong ô nội dung"
              >
                Tách tại con trỏ
              </button>
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-xs font-medium text-error-600 pt-0.5"
            >
              <WarningCircle size={14} weight="fill" className="shrink-0 text-error-600" />
              <span>{error}</span>
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={startEditingText}
            onKeyDown={handleTextBlockKeyDown}
            title="Bấm để chỉnh sửa nội dung"
            className={cn(
              "w-full cursor-text rounded-lg border px-2 py-1.5 text-left text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap break-words transition",
              hasTextError
                ? "border-error-500 bg-red-50/40 hover:bg-red-50/60"
                : "border-transparent hover:border-neutral-200 hover:bg-white/80"
            )}
          >
            {segment.text.trim() ? (
              splitByKeyword(segment.text, keyword).map((part, index) =>
                part.match ? (
                  <mark
                    key={index}
                    className="rounded-xs bg-amber-200 text-neutral-900 px-0.5 font-semibold"
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              )
            ) : (
              <span className="italic text-neutral-400">Chưa có nội dung — bấm để nhập</span>
            )}
          </div>

          {(error || canRevert) && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {error ? (
                <p
                  role="alert"
                  onClick={hasTextError ? startEditingText : undefined}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium text-error-600",
                    hasTextError && "cursor-pointer hover:underline"
                  )}
                  title={hasTextError ? "Bấm vào đây để mở ô chỉnh sửa và nhập nội dung" : undefined}
                >
                  <WarningCircle size={14} weight="fill" className="shrink-0 text-error-600" />
                  <span>{error}</span>
                </p>
              ) : (
                <div />
              )}

              {(canRevert || hasTimeError) && (
                <button
                  type="button"
                  onClick={handleRevert}
                  className={ACTION_BUTTON_CLASS}
                  title="Hoàn tác thay đổi của đoạn này"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Hoàn tác</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
