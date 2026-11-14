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
