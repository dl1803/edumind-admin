import { useEffect } from "react";
import { create } from "zustand";
import {
  collectSegmentErrors,
  isSegmentChanged,
  isTranscriptDirty,
  mergeWithNext,
  splitSegmentAt,
  validateSegmentTiming,
} from "@/lib/transcript";
import type { SegmentOperationResult } from "@/lib/transcript";
import type { TranscriptSegment } from "@/types/transcript.types";

type FlagMap = Record<string, true>;

interface DraftDerived {
  dirty: boolean;
  errors: Record<string, string>;
  revertableIds: FlagMap;
  structuralIds: FlagMap;
}

interface TranscriptDraftState extends DraftDerived {
  key: string | null;
  baseSegments: TranscriptSegment[];
  segments: TranscriptSegment[];
  timeErrors: Record<string, string>;
  init: (key: string, segments: TranscriptSegment[]) => void;
  reset: () => void;
  updateText: (segmentId: string, text: string) => void;
  updateTiming: (segmentId: string, startMs: number, endMs: number) => string | null;
  setTimeError: (segmentId: string, message: string | null) => void;
  splitAt: (segmentId: string, cursor: number) => string | null;
  mergeNext: (segmentId: string) => string | null;
  revert: (segmentId: string) => void;
  revertAll: () => void;
}

const EMPTY_DERIVED: DraftDerived = {
  dirty: false,
  errors: {},
  revertableIds: {},
  structuralIds: {},
};

let newSegmentCounter = 0;

function cloneSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  return segments.map((item) => ({ ...item }));
}

function withEditedFlag(segment: TranscriptSegment, base?: TranscriptSegment): TranscriptSegment {
  if (!base) return { ...segment, edited: true };
  return { ...segment, edited: isSegmentChanged(base, segment) ? true : base.edited };
}

function derive(
  base: TranscriptSegment[],
  segments: TranscriptSegment[],
  structuralIds: FlagMap,
  timeErrors: Record<string, string>
): DraftDerived {
  const dirty = isTranscriptDirty(base, segments) || Object.keys(timeErrors).length > 0;
  const keptStructural = dirty ? structuralIds : {};
  const baseById = new Map(base.map((item) => [item.id, item]));
  const revertableIds: FlagMap = {};
  segments.forEach((item) => {
    const original = baseById.get(item.id);
    if (
      original &&
      !keptStructural[item.id] &&
      (isSegmentChanged(original, item) || Boolean(timeErrors[item.id]))
    ) {
      revertableIds[item.id] = true;
    }
  });
  return {
    dirty,
    errors: { ...collectSegmentErrors(segments), ...timeErrors },
    revertableIds,
    structuralIds: keptStructural,
  };
}

function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

export const useTranscriptDraft = create<TranscriptDraftState>((set, get) => {
  const apply = (
    segments: TranscriptSegment[],
    structuralIds: FlagMap,
    timeErrors: Record<string, string>
  ) => {
    set({
      segments,
      timeErrors,
      ...derive(get().baseSegments, segments, structuralIds, timeErrors),
    });
  };

  const applyOperation = (result: SegmentOperationResult): string | null => {
    if (result.error) return result.error;
    const state = get();
    const structuralIds = { ...state.structuralIds };
    const timeErrors = { ...state.timeErrors };
    result.touchedIds.forEach((id) => {
      structuralIds[id] = true;
      delete timeErrors[id];
    });
    const presentIds = new Set(result.segments.map((item) => item.id));
    Object.keys(timeErrors).forEach((id) => {
      if (!presentIds.has(id)) delete timeErrors[id];
    });
    const baseById = new Map(state.baseSegments.map((item) => [item.id, item]));
    const normalizedSegments = result.segments.map((item) =>
      withEditedFlag(item, baseById.get(item.id))
    );
    apply(normalizedSegments, structuralIds, timeErrors);
    return null;
  };

  return {
    ...EMPTY_DERIVED,
    key: null,
    baseSegments: [],
    segments: [],
    timeErrors: {},

    init: (key, segments) => {
      const base = cloneSegments(segments);
      set({
        key,
        baseSegments: base,
        segments: cloneSegments(segments),
        timeErrors: {},
        ...derive(base, base, {}, {}),
      });
    },

    reset: () => {
      set({ key: null, baseSegments: [], segments: [], timeErrors: {}, ...EMPTY_DERIVED });
    },

    updateText: (segmentId, text) => {
      const state = get();
      const baseById = new Map(state.baseSegments.map((item) => [item.id, item]));
      const segments = state.segments.map((item) =>
        item.id === segmentId ? withEditedFlag({ ...item, text }, baseById.get(item.id)) : item
      );
      apply(segments, state.structuralIds, state.timeErrors);
    },

    updateTiming: (segmentId, startMs, endMs) => {
      const state = get();
      const error = validateSegmentTiming(state.segments, segmentId, startMs, endMs);
      if (error) {
        apply(state.segments, state.structuralIds, { ...state.timeErrors, [segmentId]: error });
        return error;
      }
      const baseById = new Map(state.baseSegments.map((item) => [item.id, item]));
      const segments = state.segments.map((item) =>
        item.id === segmentId
          ? withEditedFlag({ ...item, startMs, endMs }, baseById.get(item.id))
          : item
      );
      apply(segments, state.structuralIds, omitKey(state.timeErrors, segmentId));
      return null;
    },

    setTimeError: (segmentId, message) => {
      const state = get();
      const timeErrors = message
        ? { ...state.timeErrors, [segmentId]: message }
        : omitKey(state.timeErrors, segmentId);
      apply(state.segments, state.structuralIds, timeErrors);
    },

    splitAt: (segmentId, cursor) => {
      newSegmentCounter += 1;
      return applyOperation(
        splitSegmentAt(get().segments, segmentId, cursor, `seg-new-${newSegmentCounter}`)
      );
    },

    mergeNext: (segmentId) => applyOperation(mergeWithNext(get().segments, segmentId)),

    revert: (segmentId) => {
      const state = get();
      if (!state.revertableIds[segmentId] && !state.timeErrors[segmentId]) return;
      const original = state.baseSegments.find((item) => item.id === segmentId);
      if (!original) return;
      const segments = state.segments.map((item) =>
        item.id === segmentId ? { ...original } : item
      );
      apply(segments, state.structuralIds, omitKey(state.timeErrors, segmentId));
    },

    revertAll: () => {
      const state = get();
      apply(cloneSegments(state.baseSegments), {}, {});
    },
  };
});

export function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Có thay đổi chưa lưu";
      return "Có thay đổi chưa lưu";
    };
    window.addEventListener("beforeunload", handler);
    window.onbeforeunload = handler;
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.onbeforeunload = null;
    };
  }, [active]);
}
