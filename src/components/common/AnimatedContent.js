import { jsx as _jsx } from "react/jsx-runtime";
// src/components/common/AnimatedContent.tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hasPlayed, markPlayed } from "../../utils/animationMemory";
const AnimatedContent = ({ children, distance = 80, direction = "vertical", reverse = false, duration = 0.8, ease = "power3.out", initialOpacity = 0, animateOpacity = true, scale = 1, threshold, rootMarginBottomPct, delay = 0, onComplete, startOnMount = false, persistId, }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
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
        const bottomPct = typeof rootMarginBottomPct === "number"
            ? Math.max(0, Math.min(95, rootMarginBottomPct))
            : typeof threshold === "number"
                ? Math.max(0, Math.min(95, Math.round(threshold * 100)))
                : 20;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting)
                    return;
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
        }, {
            root: null,
            rootMargin: `0px 0px -${bottomPct}% 0px`,
            threshold: 0.01,
        });
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
    return _jsx("div", { ref: ref, children: children });
};
export default AnimatedContent;
