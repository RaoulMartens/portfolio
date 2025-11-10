import React, { useEffect, useRef, useState } from "react";

type Direction = "vertical" | "horizontal";

export interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: Direction;
  duration?: number;     // seconds
  ease?: string;         // accepts CSS timing fn OR "power3.out"
  delay?: number;        // seconds
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  reverse?: boolean;

  startOnMount?: boolean;
  /** Negative bottom rootMargin expressed as percentage of viewport height */
  rootMarginBottomPct?: number;
  threshold?: number;
  /** If provided, play only once per session for this id */
  persistId?: string;

  className?: string;
}

const played = new Set<string>();

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !("matchMedia" in window)) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 60,
  direction = "vertical",
  duration = 0.7,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
  delay = 0,
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  reverse = false,
  startOnMount = false,
  rootMarginBottomPct = 14,
  threshold = 0.1,
  persistId,
  className,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Map GSAP-like alias to CSS timing function
  const cssEase =
    ease === "power3.out" ? "cubic-bezier(0.22, 1, 0.36, 1)" : ease;

  // Respect reduced motion immediately to avoid any first-frame jump
  const prefersReduced = getPrefersReducedMotion();

  // Only enable transitions after initial paint to ensure we see the "from" state.
  const [armed, setArmed] = useState(false);

  // Initial visibility:
  // - reduced motion -> true
  // - persisted id that already played -> true
  // - otherwise false (until IO/startOnMount flips it)
  const [inView, setInView] = useState<boolean>(() =>
    prefersReduced || (persistId && played.has(persistId)) ? true : false
  );

  // Arm transitions on the next frame
  useEffect(() => {
    if (prefersReduced) return; // nothing to arm if we don't animate
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setArmed(true));
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, [prefersReduced]);

  // If startOnMount, flip to inView AFTER first paint so it animates
  useEffect(() => {
    if (prefersReduced) return; // already visible
    if (!startOnMount || inView) return;
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        setInView(true);
        if (persistId) played.add(persistId); // mark as played when started on mount
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, [startOnMount, inView, persistId, prefersReduced]);

  // IntersectionObserver (only if not already inView/persisted and not reduced motion and not startOnMount)
  useEffect(() => {
    if (prefersReduced) return;
    if (!ref.current || inView || startOnMount) return;

    const rootMargin = `0px 0px -${Math.max(0, rootMarginBottomPct)}% 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) {
          // Defer to next frame so initial "from" styles have painted
          requestAnimationFrame(() => {
            setInView(true);
            if (persistId) played.add(persistId);
            io.disconnect();
          });
        }
      },
      { root: null, rootMargin, threshold }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView, persistId, rootMarginBottomPct, threshold, startOnMount, prefersReduced]);

  const dur = prefersReduced ? 0 : duration;

  const axis = direction === "horizontal" ? "X" : "Y";
  const signed = reverse ? -Math.abs(distance) : Math.abs(distance);

  const fromTransform = `translate${axis}(${signed}px) scale(${scale})`;
  const toTransform = `translate${axis}(0px) scale(1)`;

  // Build transition string only for properties we actually animate
  const transitions: string[] = [`transform ${dur}s ${cssEase} ${delay}s`];
  if (animateOpacity) {
    transitions.push(`opacity ${dur}s ${cssEase} ${delay}s`);
  }

  const style: React.CSSProperties = prefersReduced
    ? {
      transform: toTransform,
      opacity: 1,
      transition: "none",
    }
    : {
      transform: inView ? toTransform : fromTransform,
      opacity: animateOpacity ? (inView ? 1 : initialOpacity) : undefined,
      transition: armed ? transitions.join(", ") : "none",
      willChange: armed ? "transform, opacity" : undefined,
    };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default AnimatedContent;
