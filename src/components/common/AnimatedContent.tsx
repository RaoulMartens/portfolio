// src/components/common/AnimatedContent.tsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hasPlayed, markPlayed } from "../../utils/animationMemory";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  /** Legacy convenience (0..1). If provided and rootMarginBottomPct isn't, converts to bottom % */
  threshold?: number;
  /** Earlier trigger = smaller number. We apply as rootMargin: `0 0 -X% 0` */
  rootMarginBottomPct?: number;
  delay?: number;
  onComplete?: () => void;
  /** Animate immediately on mount (ignore scroll) */
  startOnMount?: boolean;
  /** Persist key: when set, once played this animation won't play again this session */
  persistId?: string;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 80,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold,
  rootMarginBottomPct,
  delay = 0,
  onComplete,
  startOnMount = false,
  persistId,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;

    // If already played in this session, render final state immediately and bail.
    if (hasPlayed(persistId)) {
      gsap.set(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        clearProps: "willChange",
      });
      return;
    }

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      willChange: "transform, opacity",
    });

    if (startOnMount) {
      gsap.to(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
        delay,
        onComplete: () => {
          markPlayed(persistId);
          onComplete?.();
        },
      });
      return () => {
        gsap.killTweensOf(el);
      };
    }

    const bottomPct =
      typeof rootMarginBottomPct === "number"
        ? Math.max(0, Math.min(95, rootMarginBottomPct))
        : typeof threshold === "number"
        ? Math.max(0, Math.min(95, Math.round(threshold * 100)))
        : 20;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.to(el, {
            [axis]: 0,
            scale: 1,
            opacity: 1,
            duration,
            ease,
            delay,
            onComplete: () => {
              markPlayed(persistId);
              onComplete?.();
            },
          });
          observer.unobserve(el);
        });
      },
      {
        root: null,
        rootMargin: `0px 0px -${bottomPct}% 0px`,
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(el);
    };
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    rootMarginBottomPct,
    delay,
    onComplete,
    startOnMount,
    persistId,
  ]);

  return <div ref={ref}>{children}</div>;
};

export default AnimatedContent;
