"use client";

import { useRouter } from "next/navigation";

/** Bottom project actions: muted by default, accent on hover (shell Close stays accent in nav). */
const actionClass =
  "relative shrink-0 z-50 pointer-events-auto transition-colors text-[14px] leading-[19px] not-italic font-inter text-black/50 dark:text-white/50 hover:text-accent bg-transparent border-0 p-0 m-0 cursor-pointer";

export default function ProjectDetailFooterActions() {
  const router = useRouter();

  const close = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const backToTop = () => {
    document.getElementById("project-detail-top")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex w-full justify-center items-center gap-[46px]">
      <button type="button" onClick={close} className={actionClass}>
        Close
      </button>
      <button type="button" onClick={backToTop} className={actionClass}>
        Back to top
      </button>
    </div>
  );
}
