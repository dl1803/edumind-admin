"use client";

import { ClockCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDateTime } from "@/lib/utils";
import type { TranscriptVersion } from "@/types/transcript.types";

interface VersionPanelProps {
  versions: TranscriptVersion[];
  currentVersion: number;
  selectedVersion: number;
  isLoading?: boolean;
  disabledReason?: string;
  onSelect: (version: number) => void;
  onRestore: (version: number) => void;
}

export function VersionPanel({
  versions,
  currentVersion,
  selectedVersion,
  isLoading = false,
  disabledReason,
  onSelect,
  onRestore,
}: VersionPanelProps) {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const isViewingOldVersion = selectedVersion !== currentVersion;
  const isDisabled = Boolean(disabledReason);

  return (
    <section
      aria-label="Lịch sử phiên bản"
      className="p-4 bg-white rounded-2xl border border-purple-100 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
          <ClockCounterClockwise size={14} weight="bold" className="text-purple-600" />
          <span>Lịch sử phiên bản</span>
        </h3>
        <span className="text-[11px] text-neutral-500">{versions.length} phiên bản</span>
      </div>

      {isLoading ? (
        <div role="status" aria-busy="true" className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <span className="sr-only">Đang tải lịch sử phiên bản...</span>
        </div>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {sortedVersions.map((item) => {
            const isSelected = item.version === selectedVersion;
            const isCurrent = item.version === currentVersion;
            return (
              <li key={item.version}>
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(item.version)}
                  className={cn(
                    "w-full rounded-xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/70 cursor-pointer"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      Phiên bản {item.version}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-emerald-700">Hiện tại</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {item.createdBy} · {formatDateTime(item.createdAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {disabledReason && <p className="text-[11px] text-neutral-500">{disabledReason}</p>}

      {isViewingOldVersion && !isDisabled && (
        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Button variant="outlined" size="sm" onClick={() => onSelect(currentVersion)}>
            Xem bản hiện tại
          </Button>
          <Button size="sm" onClick={() => onRestore(selectedVersion)}>
            Khôi phục phiên bản này
          </Button>
        </div>
      )}
    </section>
  );
}
