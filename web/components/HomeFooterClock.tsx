"use client";

import { useEffect, useState } from "react";

const CX = 245;
const CY = 245;
/** Inner radius so 204px second hand clears the ring with a small gap */
const FACE_R = 244;
const HOUR_LEN = 122;
const MIN_LEN = 188;
const SEC_LEN = 204;

type Angles = { h: number; m: number; s: number };

function londonAngles(now: Date): Angles {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    fractionalSecondDigits: 3,
    hour12: false,
  });
  const parts = dtf.formatToParts(now);
  const n = (type: Intl.DateTimeFormatPartTypes) => {
    const p = parts.find((x) => x.type === type);
    return p ? parseFloat(p.value.replace(",", ".")) : 0;
  };
  const hour24 = n("hour");
  const m = n("minute");
  const s = n("second");
  const h12 = hour24 % 12;

  // 12 o'clock up; positive degrees = clockwise (SVG transform rotate)
  const sAngle = s * 6;
  const mAngle = (m + s / 60) * 6;
  const hAngle = (h12 + m / 60 + s / 3600) * 30;

  return { h: hAngle, m: mAngle, s: sAngle };
}

const digitalFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function HomeFooterClock() {
  const [angles, setAngles] = useState<Angles>(() => londonAngles(new Date()));
  const [digitalTime, setDigitalTime] = useState<string>("");

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const now = new Date();
      setAngles(londonAngles(now));
      setDigitalTime(digitalFormatter.format(now));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const label = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());

  return (
    <div className="flex flex-col w-full">
      <svg
        width={490}
        height={490}
        viewBox="0 0 490 490"
        className="shrink-0 w-full max-w-[490px] h-auto text-black dark:text-white"
        role="img"
        aria-label={`UK time (London): ${label}`}
      >
        <circle
          cx={CX}
          cy={CY}
          r={FACE_R}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
        <g transform={`rotate(${angles.h} ${CX} ${CY})`}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - HOUR_LEN}
            stroke="currentColor"
            strokeWidth={1}
          />
        </g>
        <g transform={`rotate(${angles.m} ${CX} ${CY})`}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - MIN_LEN}
            stroke="currentColor"
            strokeWidth={1}
          />
        </g>
        <g transform={`rotate(${angles.s} ${CX} ${CY})`} opacity={0.3}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - SEC_LEN}
            stroke="currentColor"
            strokeWidth={1}
          />
        </g>
      </svg>
      
      <div className="mt-[66px] pl-[8px] flex flex-col md:flex-row items-start justify-between w-full font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[27px] tracking-[-0.25px] text-foreground">
        <div className="flex flex-col md:flex-row items-start gap-[32px] md:gap-[150px]">
          <div className="whitespace-nowrap w-[150px] shrink-0 flex gap-[8px]">
            <span>LON</span>
            <span className="tabular-nums">{digitalTime || "00:00:00"}</span>
          </div>
          <div>
            5th Floor 167-169 Great Portland Street,<br />
            England, W1W 5PF
          </div>
        </div>
        
        <div className="mt-[66px] md:mt-0 flex flex-col items-end text-right md:absolute md:bottom-[50px] md:right-[58px]">
          <div className="font-soehne font-normal text-[40px] sm:text-[70px] leading-[1] sm:leading-[65px] tracking-[-0.25px] text-black dark:text-white">
            dru.works
          </div>
          <a 
            href="mailto:carterandrew93@gmail.com" 
            className="mt-[8px] font-soehne font-normal text-[40px] sm:text-[70px] leading-[1] sm:leading-[65px] tracking-[-0.25px] text-black dark:text-white opacity-30 hover:opacity-100 transition-opacity"
          >
            contact
          </a>
        </div>
      </div>
    </div>
  );
}
