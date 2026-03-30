"use client";

import ThemeLabelToggle from "@/components/ThemeLabelToggle";
import Link from "next/link";
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

  const navItemClass =
    "relative shrink-0 z-50 pointer-events-auto transition-opacity text-[14px] leading-[19px] not-italic font-inter";
  const navMutedClass = "text-[#989898] dark:text-muted hover:text-foreground";

  const nav = (
    <nav
      className="w-full px-[2.5%] sm:px-6 pt-[22px] pb-[24px] relative border-b border-transparent"
      aria-label={isOverlay ? "Project dialog" : "Project"}
    >
      <div className="flex w-full items-center justify-between gap-4 pl-2 relative">
        <div className="flex items-center gap-[15px] min-w-0">
          <button
            type="button"
            onClick={close}
            className={`${navItemClass} ${navMutedClass} bg-transparent border-0 p-0 m-0 cursor-pointer`}
          >
            Index
          </button>
          <Link href="/about" className={`${navItemClass} ${navMutedClass}`}>
            About
          </Link>
          <Link href="/services" className={`${navItemClass} ${navMutedClass}`}>
            Services
          </Link>
        </div>

        {/* True page-centered close (independent of side widths) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full flex items-center pointer-events-none">
          <button
            type="button"
            onClick={close}
            className={`${navItemClass} text-accent hover:opacity-70 opacity-100 bg-transparent border-0 cursor-pointer p-0 m-0 pointer-events-auto`}
          >
            Close
          </button>
        </div>

        <ThemeLabelToggle />
      </div>
    </nav>
  );

  const scrollAreaClass = isOverlay
    ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
    : "flex-1 w-full min-h-0";

  const inner = (
    <>
      {nav}
      <div className={scrollAreaClass}>
        <div className="relative w-full min-h-full pb-[40px] lg:pb-[200px] px-6">
          {children}
        </div>
      </div>
    </>
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
