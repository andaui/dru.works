"use client";

import { useEffect, useRef } from "react";

/**
 * Autoplaying muted loop video that reliably starts on mobile:
 * sets `muted` via the DOM property (React attribute alone is sometimes ignored)
 * and calls play() on mount and again once the media can play.
 */
export default function AutoVideo({
  src,
  className,
  alt,
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const attempt = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    attempt();
    v.addEventListener("canplay", attempt);
    return () => v.removeEventListener("canplay", attempt);
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
    />
  );
}
