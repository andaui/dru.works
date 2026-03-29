"use client";

import { useCallback, useRef, useState } from "react";

const WHEEL_PX = 22;
const STROKE = 3.5;
const R = (WHEEL_PX - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const STROKE_PROGRESS = "rgba(149, 149, 149, 0.7)";

type HeroReelVideoProps = {
  src: string;
};

export default function HeroReelVideo({ src }: HeroReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  const syncProgress = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration || !Number.isFinite(v.duration)) return;
    setProgress(Math.min(1, Math.max(0, v.currentTime / v.duration)));
  }, []);

  return (
    <div className="relative w-full rounded-[25px] overflow-hidden bg-[#e5e5e5] dark:bg-white/[0.06]">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto block object-contain object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Reel"
        onTimeUpdate={syncProgress}
        onLoadedMetadata={syncProgress}
        onPlay={syncProgress}
      />
      <div
        className="pointer-events-none absolute z-10 size-[22px]"
        style={{
          left: "calc(var(--spacing) * 5)",
          bottom: "calc(var(--spacing) * 5)",
        }}
        aria-hidden
      >
        <svg
          width={WHEEL_PX}
          height={WHEEL_PX}
          viewBox={`0 0 ${WHEEL_PX} ${WHEEL_PX}`}
          className="block"
        >
          <circle
            cx={WHEEL_PX / 2}
            cy={WHEEL_PX / 2}
            r={R}
            fill="none"
            stroke={STROKE_PROGRESS}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform={`rotate(-90 ${WHEEL_PX / 2} ${WHEEL_PX / 2})`}
          />
        </svg>
      </div>
    </div>
  );
}
