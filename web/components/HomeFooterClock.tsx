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

const ZONES: { code: string; timeZone: string }[] = [
  { code: "LON", timeZone: "Europe/London" },
  { code: "TOK", timeZone: "Asia/Tokyo" },
  { code: "SF", timeZone: "America/Los_Angeles" },
];

function anglesFor(now: Date, timeZone: string): Angles {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
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
  return {
    s: s * 6,
    m: (m + s / 60) * 6,
    h: (h12 + m / 60 + s / 3600) * 30,
  };
}

function makeDigitalFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function DialFace({ angles, dim }: { angles: Angles; dim?: boolean }) {
  return (
    <svg
      width={490}
      height={490}
      viewBox="0 0 490 490"
      className={`shrink-0 w-full h-auto text-black dark:text-white${dim ? " opacity-0" : ""}`}
      role="img"
      aria-hidden="true"
    >
      <circle cx={CX} cy={CY} r={FACE_R} fill="none" stroke="currentColor" strokeWidth={1} />
      <g transform={`rotate(${angles.h} ${CX} ${CY})`}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - HOUR_LEN} stroke="currentColor" strokeWidth={1} />
      </g>
      <g transform={`rotate(${angles.m} ${CX} ${CY})`}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - MIN_LEN} stroke="currentColor" strokeWidth={1} />
      </g>
      <g transform={`rotate(${angles.s} ${CX} ${CY})`} opacity={0.3}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - SEC_LEN} stroke="currentColor" strokeWidth={1} />
      </g>
    </svg>
  );
}

export default function HomeFooterClock() {
  const [mounted, setMounted] = useState(false);
  const [angles, setAngles] = useState<Angles[]>(ZONES.map(() => ({ h: 0, m: 0, s: 0 })));
  const [times, setTimes] = useState<string[]>(ZONES.map(() => "00:00:00"));

  useEffect(() => {
    setMounted(true);
    const formatters = ZONES.map((z) => makeDigitalFormatter(z.timeZone));
    let id = 0;
    const tick = () => {
      const now = new Date();
      setAngles(ZONES.map((z) => anglesFor(now, z.timeZone)));
      setTimes(formatters.map((f) => f.format(now)));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Three world-clock dials */}
      <div className="grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-[1300px]">
        {ZONES.map((z, i) => (
          <div key={z.code} className="flex flex-col items-start gap-4 sm:gap-6">
            <div className="w-full max-w-[436px]">
              <DialFace angles={angles[i]} dim={!mounted} />
            </div>
            <p className="font-plex-mono text-[13.7px] leading-[18px] tracking-[-0.17px] text-foreground tabular-nums whitespace-nowrap">
              {z.code} {times[i]}
            </p>
          </div>
        ))}
      </div>

      {/* Address + sign-off */}
      <div className="mt-[80px] flex flex-col md:flex-row items-start justify-between gap-10 w-full font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[27px] tracking-[-0.25px] text-foreground">
        <div className="max-w-[360px]">
          5th Floor 167-169 Great Portland Street,
          <br />
          England, W1W 5PF
        </div>
        <div className="flex flex-col items-start md:items-end text-left md:text-right">
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
