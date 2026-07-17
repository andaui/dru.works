"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export type ProjectWorkShellMode = "overlay" | "page";

type ProjectWorkShellProps = {
  mode: ProjectWorkShellMode;
  children: ReactNode;
};

/**
 * Single chrome for /work/[slug]: centered Close (Header nav typography).
 * - overlay: full-screen layer + body scroll lock (intercepted client nav)
 * - page: document flow (direct visit / refresh — same UI as modal)
 */
export default function ProjectWorkShell({ mode, children }: ProjectWorkShellProps) {
  const router = useRouter();
  const isOverlay = mode === "overlay";

  useEffect(() => {
    if (!isOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOverlay]);

  const close = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Simple Close, top-left, aligned with the top of the featured hero (no nav bar).
  const closeButton = (
    <button
      type="button"
      onClick={close}
      className="absolute top-[22px] left-6 z-[60] font-plex text-[14px] leading-[19px] text-foreground hover:opacity-70 transition-opacity bg-transparent border-0 p-0 m-0 cursor-pointer pointer-events-auto"
    >
      Close
    </button>
  );

  const content = (
    <div className="relative w-full min-h-full pt-[22px] pb-[50px] px-6">
      {closeButton}
      {children}
    </div>
  );

  const inner = isOverlay ? (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-auto">
      {content}
    </div>
  ) : (
    <div className="flex-1 w-full min-h-0">{content}</div>
  );

  if (isOverlay) {
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
        aria-label="Project"
      >
        {inner}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">{inner}</div>
  );
}
