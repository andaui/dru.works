/** Badge pill overlaid on a project cover (Figma 2244:2). */
export default function HomeBadgePill({ label }: { label: string }) {
  return (
    <div className="absolute top-[16px] right-[14px] z-10 flex items-center justify-center rounded-full px-[13px] py-[7px] bg-[#606060]/40 backdrop-blur-sm">
      <span className="font-plex text-[12px] leading-[14.6px] tracking-[0.3px] text-center text-white/90">
        {label}
      </span>
    </div>
  );
}
