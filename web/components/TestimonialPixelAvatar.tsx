"use client";

/**
 * Canvas pixelation from Codrops ImagePixelLoading (content.js).
 * @see https://github.com/codrops/ImagePixelLoading
 *
 * Codrops uses full-viewport images; `pxFactor * 0.01` on a ~57px box yields
 * subpixel draws (invisible). We keep the same two-pass drawImage technique but
 * derive `size` so each step has a meaningful minimum draw size on small avatars.
 */

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const STEP_COUNT = 5;

/** Step timings (Codrops used 300 / 80; tuned for snappy hover feedback) */
const PIXEL_MS_LONG = 75;
const PIXEL_MS_SHORT = 24;

/** Minimum downscaled draw dimension (px in w/h space) per step before upscale */
function sizeForStep(stepIndex: number, w: number, h: number): number {
  const maxDim = Math.max(w, h);
  const targets = [10, 16, 26, 40, maxDim];
  const t = targets[Math.min(stepIndex, STEP_COUNT - 1)];
  return Math.min(1, t / maxDim);
}

type TestimonialPixelAvatarProps = {
  src: string;
  alt: string;
  hovered: boolean;
};

export default function TestimonialPixelAvatar({
  src,
  alt,
  hovered,
}: TestimonialPixelAvatarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgRatioRef = useRef(1);
  const pxIndexRef = useRef(0);
  const timeoutIdsRef = useRef<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [useFallbackImg, setUseFallbackImg] = useState(false);

  const clearTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const setCanvasSize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const cw = wrap.offsetWidth;
    const ch = wrap.offsetHeight;
    if (cw === 0 || ch === 0) return;
    canvas.width = cw;
    canvas.height = ch;
  }, []);

  const render = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const imgEl = imgRef.current;
    if (!wrap || !canvas || !imgEl || !loaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offsetWidth = wrap.offsetWidth;
    const offsetHeight = wrap.offsetHeight;
    if (offsetWidth === 0 || offsetHeight === 0) return;

    const w = offsetWidth + offsetWidth * 0.05;
    const h = offsetHeight + offsetHeight * 0.05;
    const imgRatio = imgRatioRef.current;

    let newWidth = w;
    let newHeight = h;
    let newX = 0;
    let newY = 0;

    if (newWidth / newHeight > imgRatio) {
      newHeight = Math.round(w / imgRatio);
    } else {
      newWidth = Math.round(h * imgRatio);
      newX = (w - newWidth) / 2;
    }

    const step = Math.min(pxIndexRef.current, STEP_COUNT - 1);
    const size = sizeForStep(step, w, h);
    const sharp = size >= 0.999;

    const c = ctx as CanvasRenderingContext2D & {
      mozImageSmoothingEnabled?: boolean;
      webkitImageSmoothingEnabled?: boolean;
    };
    c.mozImageSmoothingEnabled = sharp;
    c.webkitImageSmoothingEnabled = sharp;
    c.imageSmoothingEnabled = sharp;

    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(imgEl, 0, 0, w * size, h * size);
    c.drawImage(
      canvas,
      0,
      0,
      w * size,
      h * size,
      newX,
      newY,
      newWidth,
      newHeight,
    );
  }, [loaded]);

  const animatePixels = useCallback(() => {
    clearTimeouts();
    const step = () => {
      if (pxIndexRef.current >= STEP_COUNT) {
        pxIndexRef.current = STEP_COUNT - 1;
        return;
      }
      const delay =
        pxIndexRef.current === 0 ? PIXEL_MS_LONG : PIXEL_MS_SHORT;
      const id = window.setTimeout(() => {
        render();
        pxIndexRef.current++;
        step();
      }, delay);
      timeoutIdsRef.current.push(id);
    };
    step();
  }, [clearTimeouts, render]);

  /**
   * Step down to max pixelation (0) — same long/short pattern as forward, reversed.
   */
  const animatePixelsReverse = useCallback(() => {
    clearTimeouts();
    const stepDown = () => {
      if (pxIndexRef.current <= 0) {
        pxIndexRef.current = 0;
        render();
        return;
      }
      const i = pxIndexRef.current;
      const delay =
        i === STEP_COUNT - 1 || i === 1 ? PIXEL_MS_LONG : PIXEL_MS_SHORT;
      const id = window.setTimeout(() => {
        pxIndexRef.current--;
        render();
        stepDown();
      }, delay);
      timeoutIdsRef.current.push(id);
    };
    stepDown();
  }, [clearTimeouts, render]);

  useEffect(() => {
    setLoaded(false);
    setUseFallbackImg(false);
    clearTimeouts();
    pxIndexRef.current = 0;
    imgRef.current = null;

    const tryLoad = (withCors: boolean) => {
      const img = new window.Image();
      if (withCors) img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        if (iw <= 0 || ih <= 0) return;
        imgRatioRef.current = iw / ih;
        imgRef.current = img;
        setLoaded(true);
      };
      img.onerror = () => {
        if (withCors) {
          tryLoad(false);
        } else {
          imgRef.current = null;
          setLoaded(false);
          setUseFallbackImg(true);
        }
      };
      img.src = src;
    };

    tryLoad(true);

    return () => {
      clearTimeouts();
      imgRef.current = null;
    };
  }, [src, clearTimeouts]);

  useLayoutEffect(() => {
    if (!loaded || !imgRef.current) return;
    setCanvasSize();
    pxIndexRef.current = 0;
    render();
  }, [loaded, setCanvasSize, render]);

  useEffect(() => {
    const onResize = () => {
      if (!loaded || !imgRef.current) return;
      setCanvasSize();
      render();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loaded, setCanvasSize, render]);

  useEffect(() => {
    if (!loaded || !imgRef.current) return;
    if (hovered) {
      clearTimeouts();
      pxIndexRef.current = 0;
      render();
      animatePixels();
    } else {
      clearTimeouts();
      animatePixelsReverse();
    }
  }, [hovered, loaded, clearTimeouts, render, animatePixels, animatePixelsReverse]);

  if (useFallbackImg) {
    return (
      <div className="relative shrink-0 size-[57px] rounded-sm overflow-hidden bg-border dark:bg-white/10">
        <Image
          src={src}
          alt={alt}
          width={57}
          height={57}
          className="object-cover size-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0 size-[57px] rounded-sm overflow-hidden bg-border dark:bg-white/10"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block size-full object-cover pointer-events-none"
        aria-hidden
      />
      <span className="sr-only">{alt}</span>
    </div>
  );
}
