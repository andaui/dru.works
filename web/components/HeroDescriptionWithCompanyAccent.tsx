import type { ReactNode } from "react";

/** Matches pricing / spotlight accent — company names inside `[...]` use this. */
const ACCENT = "#DE2475";

/**
 * Renders plain-text hero descriptions. Segments wrapped in `[` `]` are treated as a
 * comma-separated company list: each name uses the accent colour; a trailing
 * `Name and others` keeps “ and others” in the default body colour.
 *
 * Example CMS: `teams at [Google, Revolut, BlackRock, Intercom, Bumble and others]`
 * Brackets render in the default body colour; company names inside use the accent.
 */
function formatBracketList(inner: string): ReactNode {
  const segments = inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return segments.map((seg, i) => {
    const prefix = i > 0 ? ", " : null;
    const others = seg.match(/^(.+)\s+and\s+others$/i);
    const body = others ? (
      <>
        <span style={{ color: ACCENT }}>{others[1].trim()}</span>
        {" and others"}
      </>
    ) : (
      <span style={{ color: ACCENT }}>{seg}</span>
    );
    return (
      <span key={i}>
        {prefix}
        {body}
      </span>
    );
  });
}

type HeroDescriptionWithCompanyAccentProps = {
  text: string;
  className?: string;
};

export default function HeroDescriptionWithCompanyAccent({
  text,
  className,
}: HeroDescriptionWithCompanyAccentProps) {
  const pieces = text.split(/(\[[^\]]+\])/g);

  return (
    <p className={className}>
      {pieces.map((piece, i) => {
        if (piece.startsWith("[") && piece.endsWith("]")) {
          return (
            <span key={i}>
              {"["}
              {formatBracketList(piece.slice(1, -1))}
              {"]"}
            </span>
          );
        }
        return <span key={i}>{piece}</span>;
      })}
    </p>
  );
}
