// src/components/common/SplitText.tsx
import React, { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { hasPlayed, markPlayed } from "../../utils/animationMemory";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

/* ----------------------------- Types ----------------------------- */
type SplitType = "chars" | "words" | "lines";
type TextAlign = "left" | "center" | "right" | "justify";

interface AnimationState {
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  [key: string]: any;
}

/** Group a specific phrase into one wrapper (so a single gradient spans the whole phrase). */
type GroupPhrase = {
  /** e.g. ['ux','&','product','designer'] (case-insensitive, punctuation ignored) */
  tokens: string[];
  className?: string; // e.g. "gradient-group"
};

export interface SplitTextProps {
  text: string;
  className?: string;

  /** per-item stagger in ms */
  delay?: number;
  duration?: number;
  ease?: string;

  splitType?: SplitType;
  from?: AnimationState;
  to?: AnimationState;

  /** 0..1 — how much of the element must enter viewport */
  threshold?: number;

  /** legacy/no-op; kept for API parity */
  rootMargin?: string;

  textAlign?: TextAlign;
  lineHeight?: number | string;
  /** adds a tiny gap between words for nicer wrapping when splitType="words" */
  wordGap?: boolean;

  onLetterAnimationComplete?: () => void;

  /** Render tag (h1, h2, p, span, etc.) */
  as?: ElementType;

  /** wait this long (seconds) before starting the WHOLE animation */
  startDelay?: number;

  /** Persist key: once played this animation won't play again this session */
  persistId?: string;

  /** Merge a sequence of words into one span so gradient spans the whole phrase */
  groupPhrase?: GroupPhrase;
}

/* ----------------------------- Helpers ----------------------------- */

const cleanToken = (s: string) => (s || "").replace(/[^\w&-]/g, "").toLowerCase();

const findPhraseStart = (tokens: string[], seq: string[]) => {
  for (let i = 0; i <= tokens.length - seq.length; i++) {
    let ok = true;
    for (let k = 0; k < seq.length; k++) {
      if (tokens[i + k] !== seq[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
};

/* ----------------------------- Component ----------------------------- */

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.6,
  rootMargin, // not used, kept for API parity
  textAlign = "left",
  lineHeight,
  wordGap = false,
  onLetterAnimationComplete,
  as: Component = "span",
  startDelay = 0,
  persistId,
  groupPhrase,
}) => {
  const ref = useRef<HTMLElement>(null);
  const alreadyPlayed = hasPlayed(persistId);

  useEffect(() => {
    const el = ref.current;
    if (typeof window === "undefined" || !el || !text) return;

    const absoluteLines = splitType === "lines";
    if (absoluteLines) el.style.position = "relative";

    let splitter: GSAPSplitText | null = null;
    let tl: gsap.core.Timeline | null = null;

    try {
      splitter = new GSAPSplitText(el, {
        type: splitType,
        absolute: absoluteLines,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        wordDelimiter: " ",
      });
    } catch {
      return;
    }

    let targets: Element[] =
      splitType === "lines"
        ? splitter.lines ?? []
        : splitType === "words"
        ? splitter.words ?? []
        : splitter.chars ?? [];

    if (!targets.length) {
      splitter.revert();
      return;
    }

    // Optional cosmetic spacing when splitting by words
    if (splitType === "words" && wordGap) {
      (targets as HTMLElement[]).forEach((t, i) => {
        t.style.display = "inline-block";
        t.style.marginRight = i === targets.length - 1 ? "0" : "0.1em";
      });
    }

    // Group a phrase into a single span so a single gradient can span it
    if (splitType === "words" && groupPhrase?.tokens?.length && splitter.words?.length) {
      const words = splitter.words as HTMLElement[];
      const tokens = words.map((w) => cleanToken(w.textContent || ""));
      const seq = groupPhrase.tokens.map((t) => t.toLowerCase());
      const start = findPhraseStart(tokens, seq);

      if (start !== -1) {
        const end = start + seq.length - 1;

        // Create wrapper with the combined phrase text (preserves spaces visually)
        const phraseText = words.slice(start, end + 1).map((w) => w.textContent || "").join(" ");
        const wrapper = document.createElement("span");
        wrapper.className = groupPhrase.className || "";
        wrapper.style.display = "inline-block";
        // prevent descender clipping on g/j/p/q/y
        wrapper.style.paddingBottom = "0.12em";
        wrapper.style.marginBottom = "-0.12em";
        wrapper.textContent = phraseText;

        const parent = words[start].parentElement!;
        parent.insertBefore(wrapper, words[start]);
        for (let i = start; i <= end; i++) parent.removeChild(words[i]);

        // Replace targets range with the wrapper so the animation treats it as one item
        const newTargets = targets.slice();
        newTargets.splice(start, seq.length, wrapper);
        targets = newTargets;
      }
    }

    // If it already played in this session, immediately set final state
    if (hasPlayed(persistId)) {
      gsap.set(targets, { ...to, clearProps: "willChange", force3D: true });
      gsap.set(el, { visibility: "visible" });
      splitter.revert();
      return;
    }

    // Prepare initial state
    gsap.set(targets, { ...from, force3D: true, willChange: "transform, opacity" });

    // Timeline
    tl = gsap.timeline({
      delay: startDelay,
      scrollTrigger: {
        trigger: el,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
        toggleActions: "play none none none",
      },
      smoothChildTiming: true,
      onStart: () => {
        // ensure we return void (fixes the TS error)
        gsap.set(el, { visibility: "visible" });
      },
      onComplete: () => {
        gsap.set(targets, { ...to, clearProps: "willChange", immediateRender: true });
        markPlayed(persistId);
        onLetterAnimationComplete?.();
      },
    });

    tl.to(targets, { ...to, duration, ease, stagger: delay / 1000, force3D: true });

    return () => {
      tl?.kill();
      (tl?.scrollTrigger as ScrollTrigger | null)?.kill?.();
      gsap.killTweensOf(targets);
      splitter?.revert();
    };
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    wordGap,
    onLetterAnimationComplete,
    startDelay,
    persistId,
    groupPhrase,
  ]);

  const style: React.CSSProperties = {
    margin: 0,
    textAlign,
    overflow: "visible",
    display: "block",
    whiteSpace: "normal",
    wordWrap: "break-word",
    visibility: alreadyPlayed ? "visible" : "hidden",
    ...(lineHeight !== undefined ? { lineHeight } : {}),
  };

  return (
    <Component ref={ref} className={`split-parent ${className}`} style={style}>
      {text}
    </Component>
  );
};

export default SplitText;
