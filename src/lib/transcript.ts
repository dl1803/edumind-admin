import type { TranscriptSegment } from "@/types/transcript.types";

export interface HighlightPart {
  text: string;
  match: boolean;
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFC").toLowerCase();
}

export function formatTranscriptTime(ms: number, forceHours = false): string {
  const safeMs = Number.isFinite(ms) && ms > 0 ? Math.floor(ms) : 0;
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1000);
  const millis = safeMs % 1000;
  const pad = (value: number, length: number) => String(value).padStart(length, "0");

  if (hours > 0 || forceHours) {
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
  }
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
}

export function findActiveSegmentId(
  segments: TranscriptSegment[],
  currentMs: number
): string | null {
  const active = segments.find((item) => currentMs >= item.startMs && currentMs < item.endMs);
  return active ? active.id : null;
}

export function filterSegmentsByKeyword(
  segments: TranscriptSegment[],
  keyword: string
): TranscriptSegment[] {
  const needle = normalizeForSearch(keyword.trim());
  if (!needle) return segments;
  return segments.filter((item) => normalizeForSearch(item.text).includes(needle));
}

export function splitByKeyword(text: string, keyword: string): HighlightPart[] {
  const source = text.normalize("NFC");
  const needle = normalizeForSearch(keyword.trim());
  if (!needle) return [{ text: source, match: false }];

  const haystack = source.toLowerCase();
  const parts: HighlightPart[] = [];
  let cursor = 0;
  let index = haystack.indexOf(needle, cursor);

  while (index !== -1) {
    if (index > cursor) parts.push({ text: source.slice(cursor, index), match: false });
    parts.push({ text: source.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }
  if (cursor < source.length) parts.push({ text: source.slice(cursor), match: false });
  return parts;
}

const HLS_URL_PATTERN = /\.m3u8(?:$|[?#])/i;

export function isHlsUrl(url: string): boolean {
  return HLS_URL_PATTERN.test(url);
}

export const TRANSCRIPT_TEXT_MAX_LENGTH = 1000;
export const TRANSCRIPT_TIME_ERROR = "Mốc thời gian không hợp lệ hoặc bị đè lên mốc khác";
export const TRANSCRIPT_TEXT_EMPTY_ERROR = "Nội dung lời thoại không được để trống";
export const TRANSCRIPT_TEXT_TOO_LONG_ERROR = "Nội dung lời thoại tối đa 1.000 ký tự";
export const TRANSCRIPT_SPLIT_CURSOR_ERROR = "Đặt con trỏ vào giữa nội dung để tách đoạn";
export const TRANSCRIPT_SPLIT_TOO_SHORT_ERROR = "Đoạn quá ngắn để tách";
export const TRANSCRIPT_MERGE_LAST_ERROR = "Không có đoạn kế tiếp để gộp";
export const TRANSCRIPT_SEGMENT_NOT_FOUND_ERROR = "Không tìm thấy đoạn phụ đề";

const TIME_PATTERN = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\.(\d{3})$/;

export function parseTranscriptTime(value: string): number | null {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const millis = Number(match[4]);
  if (minutes > 59 || seconds > 59) return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

export function normalizeTranscriptText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function validateSegmentText(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return TRANSCRIPT_TEXT_EMPTY_ERROR;
  if (trimmed.length > TRANSCRIPT_TEXT_MAX_LENGTH) return TRANSCRIPT_TEXT_TOO_LONG_ERROR;
  return null;
}

export function validateSegmentTiming(
  segments: TranscriptSegment[],
  segmentId: string,
  startMs: number,
  endMs: number
): string | null {
  if (!Number.isInteger(startMs) || !Number.isInteger(endMs)) return TRANSCRIPT_TIME_ERROR;
  if (startMs < 0 || startMs >= endMs) return TRANSCRIPT_TIME_ERROR;
  const index = segments.findIndex((item) => item.id === segmentId);
  if (index === -1) return TRANSCRIPT_TIME_ERROR;
  const previous = segments[index - 1];
  const next = segments[index + 1];
  if (previous && startMs < previous.endMs) return TRANSCRIPT_TIME_ERROR;
  if (next && endMs > next.startMs) return TRANSCRIPT_TIME_ERROR;
  return null;
}

export function collectSegmentErrors(segments: TranscriptSegment[]): Record<string, string> {
  const errors: Record<string, string> = {};
  segments.forEach((segment) => {
    const error =
      validateSegmentText(segment.text) ??
      validateSegmentTiming(segments, segment.id, segment.startMs, segment.endMs);
    if (error) errors[segment.id] = error;
  });
  return errors;
}

export function isSegmentChanged(base: TranscriptSegment, current: TranscriptSegment): boolean {
  return (
    base.startMs !== current.startMs ||
    base.endMs !== current.endMs ||
    base.text.trim() !== current.text.trim()
  );
}

export function isTranscriptDirty(
  base: TranscriptSegment[],
  working: TranscriptSegment[]
): boolean {
  if (base.length !== working.length) return true;
  return working.some(
    (item, index) => item.id !== base[index].id || isSegmentChanged(base[index], item)
  );
}

export function hasTranscriptTextChanged(
  base: TranscriptSegment[],
  working: TranscriptSegment[]
): boolean {
  if (base.length !== working.length) return true;
  const join = (items: TranscriptSegment[]) =>
    items.map((item) => normalizeTranscriptText(item.text)).join(" ");
  return join(base) !== join(working);
}

export interface SegmentOperationResult {
  segments: TranscriptSegment[];
  touchedIds: string[];
  error: string | null;
}

function failed(segments: TranscriptSegment[], error: string): SegmentOperationResult {
  return { segments, touchedIds: [], error };
}

export function splitSegmentAt(
  segments: TranscriptSegment[],
  segmentId: string,
  cursor: number,
  newId: string
): SegmentOperationResult {
  const index = segments.findIndex((item) => item.id === segmentId);
  if (index === -1) return failed(segments, TRANSCRIPT_SEGMENT_NOT_FOUND_ERROR);

  const original = segments[index];
  const position = Math.min(Math.max(cursor, 0), original.text.length);
  const leftText = original.text.slice(0, position).trim();
  const rightText = original.text.slice(position).trim();
  if (!leftText || !rightText) return failed(segments, TRANSCRIPT_SPLIT_CURSOR_ERROR);

  const textError = validateSegmentText(leftText) ?? validateSegmentText(rightText);
  if (textError) return failed(segments, textError);

  const duration = original.endMs - original.startMs;
  if (duration < 2) return failed(segments, TRANSCRIPT_SPLIT_TOO_SHORT_ERROR);

  const rawSplitMs = original.startMs + Math.round((duration * position) / original.text.length);
  const splitMs = Math.min(Math.max(rawSplitMs, original.startMs + 1), original.endMs - 1);

  const first: TranscriptSegment = { ...original, text: leftText, endMs: splitMs, edited: true };
  const second: TranscriptSegment = {
    id: newId,
    startMs: splitMs,
    endMs: original.endMs,
    text: rightText,
    edited: true,
  };
  return {
    segments: [...segments.slice(0, index), first, second, ...segments.slice(index + 1)],
    touchedIds: [original.id, newId],
    error: null,
  };
}

export function mergeWithNext(
  segments: TranscriptSegment[],
  segmentId: string
): SegmentOperationResult {
  const index = segments.findIndex((item) => item.id === segmentId);
  if (index === -1) return failed(segments, TRANSCRIPT_SEGMENT_NOT_FOUND_ERROR);

  const current = segments[index];
  const next = segments[index + 1];
  if (!next) return failed(segments, TRANSCRIPT_MERGE_LAST_ERROR);

  const text = `${current.text.trim()} ${next.text.trim()}`.trim();
  const textError = validateSegmentText(text);
  if (textError) return failed(segments, textError);

  const merged: TranscriptSegment = { ...current, text, endMs: next.endMs, edited: true };
  return {
    segments: [...segments.slice(0, index), merged, ...segments.slice(index + 2)],
    touchedIds: [current.id],
    error: null,
  };
}

export class TranscriptConflictError extends Error {
  constructor(message = "Transcript đã được cập nhật bởi phiên bản mới hơn.") {
    super(message);
    this.name = "TranscriptConflictError";
    Object.setPrototypeOf(this, TranscriptConflictError.prototype);
  }
}


