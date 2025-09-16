import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec = { opacity?: number; y?: number; x?: number };

export interface SplitTextProps {
  text: string;

  // animation config
  delay?: number;        // seconds between tokens
  duration?: number;     // seconds per token
  ease?: string;         // CSS timing-function or alias "power3.out"
  from?: Vec;            // starting state
  to?: Vec;              // end state
  startDelay?: number;   // extra start offset (seconds)

  // splitting
  splitType?: "words" | "chars"; // default "words"

  // viewport trigger
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";

  // persistence
  persistId?: string;

  // optional phrase group styling
  groupPhrase?: { tokens: string[]; className?: string };

  // NEW: fires once after the final token finishes animating
  onLetterAnimationComplete?: () => void;
}

const played = new Set<string>();

const defaultFrom: Vec = { opacity: 0, y: 28 };
const defaultTo: Vec = { opacity: 1, y: 0 };

const SplitText: React.FC<SplitTextProps> = ({
  text,
  delay = 0.06,
  duration = 0.7,
  ease = "power3.out",
  from = defaultFrom,
  to = defaultTo,
  startDelay = 0,
  splitType = "words",
  threshold = 0.1,
  rootMargin = "0px 0px -10% 0px",
  textAlign = "left",
  persistId,
  groupPhrase,
  onLetterAnimationComplete,
}) => {
  const holderRef = useRef<HTMLSpanElement | null>(null);
  const [inView, setInView] = useState<boolean>(() => (persistId && played.has(persistId)) || false);
  const completionTimer = useRef<number | null>(null);

  // Map common alias to CSS bezier
  const cssEase = ease === "power3.out" ? "cubic-bezier(0.22, 1, 0.36, 1)" : ease;

  useEffect(() => {
    if (!holderRef.current || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) {
          setInView(true);
          if (persistId) played.add(persistId);
          io.disconnect();
        }
      },
      { threshold, root: null, rootMargin }
    );
    io.observe(holderRef.current);
    return () => io.disconnect();
  }, [inView, persistId, threshold, rootMargin]);

  const tokens = useMemo(() => {
    if (splitType === "chars") return [...text];
    const arr: string[] = [];
    text.split(" ").forEach((w, i, all) => {
      arr.push(w);
      if (i < all.length - 1) arr.push(" ");
    });
    return arr;
  }, [text, splitType]);

  const groupSet = useMemo(() => new Set(groupPhrase?.tokens ?? []), [groupPhrase]);

  // Fire completion callback once when the last token would finish
  useEffect(() => {
    if (!inView || !onLetterAnimationComplete) return;
    // last token start = startDelay + (tokens.length-1) * delay
    const lastStart = startDelay + Math.max(0, tokens.length - 1) * delay;
    const total = (lastStart + duration) * 1000;
    completionTimer.current = window.setTimeout(() => {
      onLetterAnimationComplete();
      completionTimer.current && window.clearTimeout(completionTimer.current);
      completionTimer.current = null;
    }, total);
    return () => {
      if (completionTimer.current) window.clearTimeout(completionTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, tokens.length, startDelay, delay, duration, onLetterAnimationComplete]);

  return (
    <span
      ref={holderRef}
      aria-label={text}
      style={{ display: "inline", textAlign: textAlign as any }}
      className="split-parent"
    >
      {tokens.map((tok, i) => {
        const isSpace = tok === " ";
        const isGrouped = groupSet.has(tok.replace(/\s+/g, ""));
        const baseDelay = startDelay + i * delay;

        const style: React.CSSProperties = isSpace
          ? { whiteSpace: "pre" }
          : {
              display: "inline-block",
              transform: `translate3d(${inView ? (to.x ?? 0) : (from.x ?? 0)}px, ${
                inView ? (to.y ?? 0) : (from.y ?? 0)
              }px, 0)`,
              opacity: inView ? (to.opacity ?? 1) : (from.opacity ?? 0),
              transition: `transform ${duration}s ${cssEase} ${baseDelay}s, opacity ${duration}s ${cssEase} ${baseDelay}s`,
              willChange: "transform, opacity",
            };

        const className = `split-word${isGrouped ? ` ${groupPhrase?.className ?? ""}` : ""}`;

        return isSpace ? (
          <span key={i} style={style}>
            {tok}
          </span>
        ) : (
          <span key={i} style={style} className={className}>
            {tok}
          </span>
        );
      })}
    </span>
  );
};

export default SplitText;
