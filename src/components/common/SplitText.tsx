import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec = { opacity?: number; y?: number; x?: number };

export interface SplitTextProps {
  text: string;

  // animation config
  delay?: number;          // s tussen tokens
  duration?: number;       // s per token
  ease?: string;           // CSS timing-fn of alias "power3.out"
  from?: Vec;              // start
  to?: Vec;                // eind
  startDelay?: number;     // extra startoffset (s)

  // splitting
  splitType?: "words" | "chars";

  // viewport trigger
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";

  // persistence
  persistId?: string;

  // optionele phrase-groepstijl
  groupPhrase?: { tokens: string[]; className?: string };

  // firet één keer na de laatste token-animatie
  onLetterAnimationComplete?: () => void;
}

const played = new Set<string>();

const defaultFrom: Vec = { opacity: 0, y: 28 };
const defaultTo: Vec = { opacity: 1, y: 0 };

// ---- helpers -------------------------------------------------------
const isValidRootMargin = (s: unknown) => {
  if (typeof s !== "string") return false;
  const parts = s.trim().split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return false;
  return parts.every((p) => /^-?\d+(\.\d+)?(px|%)$/.test(p));
};

const clamp01 = (n: unknown, fb = 0.1) => {
  const x = Number(n);
  return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : fb;
};
// -------------------------------------------------------------------

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
  rootMargin = "0px 0px -15% 0px",
  textAlign = "left",
  persistId,
  groupPhrase,
  onLetterAnimationComplete,
}) => {
  const holderRef = useRef<HTMLSpanElement | null>(null);

  // Transition pas na eerste paint armen
  const [armed, setArmed] = useState(false);
  const raf1 = useRef<number | null>(null);
  const raf2 = useRef<number | null>(null);

  // Persist: als eerder gespeeld, direct zichtbaar
  const [inView, setInView] = useState<boolean>(
    () => (persistId && played.has(persistId)) || false
  );

  const completionTimer = useRef<number | null>(null);

  // prefers-reduced-motion
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(!!mq?.matches);
    apply();
    // oude en nieuwe API’s
    mq?.addEventListener?.("change", apply);
    // @ts-ignore
    mq?.addListener?.(apply);
    return () => {
      mq?.removeEventListener?.("change", apply);
      // @ts-ignore
      mq?.removeListener?.(apply);
    };
  }, []);

  // Alias → CSS bezier
  const cssEase = ease === "power3.out" ? "cubic-bezier(0.22, 1, 0.36, 1)" : ease;

  // Arm transitions na dubbele RAF
  useEffect(() => {
    raf1.current = requestAnimationFrame(() => {
      raf2.current = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      if (raf1.current) cancelAnimationFrame(raf1.current);
      if (raf2.current) cancelAnimationFrame(raf2.current);
    };
  }, []);

  // IntersectionObserver met gesaneerde config
  useEffect(() => {
    if (!holderRef.current || inView || reduceMotion) return;

    if (
      typeof window === "undefined" ||
      typeof (window as any).IntersectionObserver === "undefined"
    ) {
      setInView(true);
      return;
    }

    const node = holderRef.current;
    const safeRootMargin = isValidRootMargin(rootMargin)
      ? rootMargin
      : "0px 0px -15% 0px";
    const safeThreshold = clamp01(threshold, 0.1);

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          if (hit) {
            // zeker weten dat 'from'-styles 1x gepaint zijn
            const run = () => {
              setInView(true);
              if (persistId) played.add(persistId);
              io?.disconnect();
            };
            requestAnimationFrame(() => requestAnimationFrame(run));
          }
        },
        { threshold: safeThreshold, root: null, rootMargin: safeRootMargin }
      );
      io.observe(node);
    } catch (err) {
      console.warn("[SplitText] IO failed; reveal immediately", {
        safeRootMargin,
        safeThreshold,
        err,
      });
      setInView(true);
    }

    return () => {
      io?.disconnect();
      io = null;
    };
  }, [inView, persistId, threshold, rootMargin, reduceMotion]);

  // Tokenize: behoud ALLE whitespace bij words
  const tokens = useMemo(() => {
    if (splitType === "chars") return Array.from(text);
    return text.split(/(\s+)/);
  }, [text, splitType]);

  // Group normalisatie
  const groupSet = useMemo(
    () => new Set((groupPhrase?.tokens ?? []).map((t) => t.trim().toLowerCase())),
    [groupPhrase]
  );

  // Fire completion callback exact één keer
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
    // onLetterAnimationComplete is bewust niet in deps opgenomen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, tokens.length, startDelay, delay, duration]);

  // ---- build group indices for synchronized gradient ----
  // Count non-whitespace grouped tokens and assign sequential indices
  // so each word can offset its background-position within a shared gradient.
  const groupIndices = useMemo(() => {
    if (groupSet.size === 0) return new Map<number, number>();
    const indices = new Map<number, number>();
    let idx = 0;
    tokens.forEach((tok, i) => {
      if (/^\s+$/.test(tok)) return;
      const norm = tok.replace(/\s+/g, "").replace(/[^\p{L}\p{N}&-]+/gu, "").toLowerCase();
      if (groupSet.has(norm)) {
        indices.set(i, idx);
        idx++;
      }
    });
    return indices;
  }, [tokens, groupSet]);

  const groupTotal = groupIndices.size;

  return (
    <span
      ref={holderRef}
      aria-label={text}
      style={{ display: "inline-block", textAlign, whiteSpace: "pre-wrap" }}
      className="split-parent"
    >
      {tokens.map((tok, i) => {
        const isWhitespace = /^\s+$/.test(tok);
        if (isWhitespace) {
          return (
            <span key={i} aria-hidden="true">
              {tok}
            </span>
          );
        }

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

        // For grouped words, set CSS vars for synchronized gradient
        if (isGrouped && groupTotal > 1) {
          const gi = groupIndices.get(i) ?? 0;
          (style as any)["--gi"] = gi;
          (style as any)["--gt"] = groupTotal;
        }

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
