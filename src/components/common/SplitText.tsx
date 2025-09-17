import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec = { opacity?: number; y?: number; x?: number };

export interface SplitTextProps {
  text: string;

  // animation config
  delay?: number;          // seconds between tokens
  duration?: number;       // seconds per token
  ease?: string;           // CSS timing-function or alias "power3.out"
  from?: Vec;              // starting state
  to?: Vec;                // end state
  startDelay?: number;     // extra start offset (seconds)

  // splitting
  splitType?: "words" | "chars";

  // viewport trigger
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";

  // persistence
  persistId?: string;

  // optional phrase group styling
  groupPhrase?: { tokens: string[]; className?: string };

  // fires once after the final token finishes animating
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

  // Arm transitions after initial paint to prevent jump from 'none' → animated timeline.
  const [armed, setArmed] = useState(false);

  // If persistId was played before, render directly "in view"; else wait for IO.
  const [inView, setInView] = useState<boolean>(() => (persistId && played.has(persistId)) || false);

  const completionTimer = useRef<number | null>(null);

  // prefers-reduced-motion (stateful with listener)
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  // Map alias to CSS bezier
  const cssEase = ease === "power3.out" ? "cubic-bezier(0.22, 1, 0.36, 1)" : ease;

  // Arm transitions after mount (double RAF ⇒ ensure first paint)
  useEffect(() => {
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setArmed(true));
      (setArmed as any)._id2 = id2;
    });
    return () => {
      cancelAnimationFrame(id1);
      // @ts-ignore
      if ((setArmed as any)._id2) cancelAnimationFrame((setArmed as any)._id2);
    };
  }, []);

  // IntersectionObserver; flip to inView after at least one paint
  useEffect(() => {
    if (!holderRef.current || inView || reduceMotion) return;

    const node = holderRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) {
          const run = () => {
            setInView(true);
            if (persistId) played.add(persistId);
            io.disconnect();
          };
          requestAnimationFrame(() => requestAnimationFrame(run));
        }
      },
      { threshold, root: null, rootMargin }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [inView, persistId, threshold, rootMargin, reduceMotion]);

  // --- tokenize: preserve ALL whitespace when splitting by words
  const tokens = useMemo(() => {
    if (splitType === "chars") return Array.from(text);
    return text.split(/(\s+)/); // keep whitespace segments (spaces, tabs, newlines)
  }, [text, splitType]);

  // Group set: normalize to lowercase, trim
  const groupSet = useMemo(
    () => new Set((groupPhrase?.tokens ?? []).map((t) => t.trim().toLowerCase())),
    [groupPhrase]
  );

  // Fire completion callback once when the last token would finish
  useEffect(() => {
    if (!onLetterAnimationComplete) return;
    if (!(inView || reduceMotion)) return;

    const lastStart = startDelay + Math.max(0, tokens.length - 1) * delay;
    const total = (lastStart + duration) * 1000;

    completionTimer.current = window.setTimeout(() => {
      onLetterAnimationComplete();
      if (completionTimer.current) {
        window.clearTimeout(completionTimer.current);
        completionTimer.current = null;
      }
    }, reduceMotion ? 0 : total);

    return () => {
      if (completionTimer.current) window.clearTimeout(completionTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, tokens.length, startDelay, delay, duration, onLetterAnimationComplete]);

  return (
    <span
      ref={holderRef}
      aria-label={text}
      role="text"
      // inline-block keeps a stable IO box; pre-wrap preserves line breaks & extra spaces
      style={{ display: "inline-block", textAlign, whiteSpace: "pre-wrap" }}
      className="split-parent"
    >
      {tokens.map((tok, i) => {
        const isWhitespace = /^\s+$/.test(tok);
        if (isWhitespace) {
          // render whitespace exactly as-is (no animation)
          return (
            <span key={i} aria-hidden="true">
              {tok}
            </span>
          );
        }

        // normalize token for grouping: strip spaces & punctuation, keep letters/numbers/&/-
        const normTok = tok
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}&-]+/gu, "")
          .toLowerCase();
        const isGrouped = groupSet.has(normTok);

        const baseDelay = reduceMotion ? 0 : startDelay + i * delay;
        const dur = reduceMotion ? 0 : duration;

        const tx = (inView || reduceMotion) ? (to.x ?? 0) : (from.x ?? 0);
        const ty = (inView || reduceMotion) ? (to.y ?? 0) : (from.y ?? 0);
        const op = (inView || reduceMotion) ? (to.opacity ?? 1) : (from.opacity ?? 0);

        const style: React.CSSProperties = {
          display: "inline-block",
          transform: `translate3d(${tx}px, ${ty}px, 0)`,
          opacity: op,
          transition: armed
            ? `transform ${dur}s ${cssEase} ${baseDelay}s, opacity ${dur}s ${cssEase} ${baseDelay}s`
            : "none",
          willChange: armed ? "transform, opacity" : undefined,
        };

        const className = `split-word${isGrouped ? ` ${groupPhrase?.className ?? ""}` : ""}`;

        return (
          <span key={i} style={style} className={className} aria-hidden="true">
            {tok}
          </span>
        );
      })}
    </span>
  );
};

export default SplitText;
