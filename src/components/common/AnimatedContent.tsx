import React, { useEffect, useRef, useState } from "react";

type Direction = "vertical" | "horizontal";

export interface AnimatedContentProps {
  children: React.ReactNode;

  // motion
  distance?: number;              // px to translate from (positive number)
  direction?: Direction;          // "vertical" | "horizontal"
  duration?: number;              // seconds
  ease?: string;                  // CSS cubic-bezier or keyword
  delay?: number;                 // seconds
  initialOpacity?: number;        // 0..1
  animateOpacity?: boolean;

  // NEW: start scale value (animates to 1)
  scale?: number;

  // NEW: reverse the translation direction (e.g. from right/above instead of left/below)
  reverse?: boolean;

  // trigger behavior
  startOnMount?: boolean;         // play immediately on mount
  rootMarginBottomPct?: number;   // % bottom root-margin (for later triggering)
  threshold?: number;             // IO threshold (default 0.1)
  persistId?: string;             // (optional) key for “already played” memory

  className?: string;
}

/** Tiny in-memory "already played" registry (per session). */
const played = new Set<string>();

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 60,
  direction = "vertical",
  duration = 0.7,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
  delay = 0,
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,                // NEW
  reverse = false,          // NEW
  startOnMount = false,
  rootMarginBottomPct = 14,
  threshold = 0.1,
  persistId,
  className,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState<boolean>(() => {
    if (persistId && played.has(persistId)) return true;
    return startOnMount;
  });

  useEffect(() => {
    if (!ref.current || inView) return;

    const rootMargin = `0px 0px -${Math.max(0, rootMarginBottomPct)}% 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) {
          setInView(true);
          if (persistId) played.add(persistId);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView, persistId, rootMarginBottomPct, threshold]);

  const axis = direction === "horizontal" ? "X" : "Y";
  const signed = reverse ? -Math.abs(distance) : Math.abs(distance);
  const fromTranslate = `translate${axis}(${signed}px)`;
  const toTranslate = `translate${axis}(0px)`;

  const fromScale = `scale(${scale})`;
  const toScale = `scale(1)`;

  const fromTransform =
    direction === "horizontal"
      ? `${fromTranslate} ${fromScale}`
      : `${fromTranslate} ${fromScale}`;

  const toTransform =
    direction === "horizontal"
      ? `${toTranslate} ${toScale}`
      : `${toTranslate} ${toScale}`;

  const style: React.CSSProperties = {
    transform: inView ? toTransform : fromTransform,
    opacity: animateOpacity ? (inView ? 1 : initialOpacity) : undefined,
    transition: `transform ${duration}s ${ease} ${delay}s, opacity ${duration}s ${ease} ${delay}s`,
    willChange: "transform, opacity",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default AnimatedContent;
