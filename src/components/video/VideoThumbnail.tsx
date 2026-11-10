"use client";

import { useState } from "react";
import Image from "next/image";
import { FilmStrip } from "@phosphor-icons/react";

interface VideoThumbnailProps {
  src: string | null;
  alt: string;
}

export function VideoThumbnail({ src, alt }: VideoThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = !src || failedSrc === src;

  return (
    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
      {src && !hasError ? (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400">
          <FilmStrip size={20} weight="fill" />
        </div>
      )}
    </div>
  );
}

