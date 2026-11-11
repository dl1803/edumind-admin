"use client";

import { useState } from "react";
import Image from "next/image";
import { FilmStrip, Play, Spinner, WarningCircle } from "@phosphor-icons/react";
import { cn, formatDuration } from "@/lib/utils";
import type { VideoOverallStatus } from "@/types/video.types";

interface VideoThumbnailProps {
  src: string | null;
  alt: string;
  durationSec?: number | null;
  status?: VideoOverallStatus;
  className?: string;
}

export function VideoThumbnail({
  src,
  alt,
  durationSec,
  status = "completed",
  className,
}: VideoThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = !src || failedSrc === src;

  return (
    <div
      className={cn(
        "relative w-16 h-10 rounded-md shrink-0 overflow-hidden flex items-center justify-center border border-purple-200/50 shadow-2xs",
        status === "completed" && "bg-gradient-to-br from-indigo-900 to-purple-800",
        status === "processing" && "bg-gradient-to-br from-amber-900 to-orange-800",
        status === "failed" && "bg-gradient-to-br from-red-950 to-neutral-900",
        (status === "uploaded" || status === "uploading") && "bg-neutral-100",
        className
      )}
    >
      {src && !hasError && (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="64px"
          className="object-cover opacity-80"
          unoptimized
          onError={() => setFailedSrc(src)}
        />
      )}

      <div className="relative z-10 pointer-events-none">
        {status === "completed" && <Play size={12} weight="fill" className="text-white/80" />}
        {status === "processing" && <Spinner size={14} className="animate-spin text-amber-300" />}
        {status === "failed" && <WarningCircle size={14} weight="fill" className="text-red-400" />}
        {(status === "uploaded" || status === "uploading") && (
          <FilmStrip size={14} className="text-neutral-400" />
        )}
      </div>

      {durationSec != null && durationSec > 0 && (
        <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/70 text-white text-[8px] font-mono tabular-nums leading-tight z-20 pointer-events-none">
          {formatDuration(durationSec)}
        </span>
      )}
    </div>
  );
}
