"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { PIPELINE_STEP_LABELS, PIPELINE_STEP_ORDER } from "@/lib/pipeline";
import type { VideoPipeline } from "@/types/video.types";

interface LogLine {
  key: string;
  timestamp: number;
  stage: string;
  message: string;
  isError: boolean;
}

interface PipelineLogPanelProps {
  pipeline: VideoPipeline;
  updatedAt: number;
}

function parseTime(value: string | null): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function formatTimeOfDay(value: number): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function buildLogLines(pipeline: VideoPipeline): LogLine[] {
  const lines: LogLine[] = [];

  PIPELINE_STEP_ORDER.forEach((name) => {
    const step = pipeline.steps.find((item) => item.step === name);
    if (!step) return;

    const stage = PIPELINE_STEP_LABELS[name];
    const startedAt = parseTime(step.startedAt);
    const completedAt = parseTime(step.completedAt);

    if (startedAt !== null) {
      lines.push({ key: `${name}-start`, timestamp: startedAt, stage, message: "Bắt đầu xử lý", isError: false });
    }
    if (step.status === "completed" && completedAt !== null) {
      lines.push({ key: `${name}-done`, timestamp: completedAt, stage, message: "Hoàn tất", isError: false });
    }
    if (step.status === "failed") {
      const failedAt = completedAt ?? startedAt;
      if (failedAt !== null) {
        lines.push({
          key: `${name}-error`,
          timestamp: failedAt,
          stage,
          message: step.errorMessage ?? "Xử lý thất bại",
          isError: true,
        });
      }
    }
  });

  return lines.sort((a, b) => a.timestamp - b.timestamp);
}

export function PipelineLogPanel({ pipeline, updatedAt }: PipelineLogPanelProps) {
  const [copied, setCopied] = useState(false);
  const lines = buildLogLines(pipeline);

  const handleCopyLogs = async () => {
    if (lines.length === 0) return;
    const fullText = lines
      .map((line) => `[${formatTimeOfDay(line.timestamp)}] ${line.stage} — ${line.message}`)
      .join("\n");
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-label="Nhật ký xử lý"
      className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xs"
    >
      <div className="h-10 px-4 flex items-center justify-between bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-300">Nhật ký xử lý</span>
          {updatedAt > 0 && (
            <span className="text-xs font-mono tabular-nums text-neutral-500 hidden sm:inline">
              (Cập nhật lúc {formatTimeOfDay(updatedAt)})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopyLogs}
          disabled={lines.length === 0}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Sao chép log</span>
            </>
          )}
        </button>
      </div>
      <div role="log" className="p-4 max-h-60 overflow-y-auto font-mono text-xs leading-5 space-y-2">
        {lines.length === 0 ? (
          <p className="text-neutral-500">Chưa có nhật ký xử lý.</p>
        ) : (
          lines.map((line) => (
            <p key={line.key} className={cn("text-neutral-300", line.isError && "text-rose-400 font-medium")}>
              <span className="text-neutral-500">[{formatTimeOfDay(line.timestamp)}]</span> {line.stage} —{" "}
              {line.message}
            </p>
          ))
        )}
      </div>
    </section>
  );
}

