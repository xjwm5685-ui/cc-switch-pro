import { memo } from "react";
import { cn } from "@/lib/utils";
import { highlightSearchMatches } from "@/utils/providerSearch";

interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
  markClassName?: string;
}

/** Renders text with case-insensitive query highlights. */
export const HighlightText = memo(function HighlightText({
  text,
  query,
  className,
  markClassName,
}: HighlightTextProps) {
  if (!query?.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = highlightSearchMatches(text, query);
  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.match ? (
          <mark
            key={`${index}-${part.text}`}
            className={cn(
              "rounded-sm bg-amber-400/35 px-0.5 text-inherit dark:bg-amber-300/30",
              markClassName,
            )}
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${index}-${part.text}`}>{part.text}</span>
        ),
      )}
    </span>
  );
});
