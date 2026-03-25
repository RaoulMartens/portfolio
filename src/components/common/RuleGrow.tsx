import React, { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../utils/a11y";

/**
 * Left→Right animated divider line.
 * Used on HalloBuur, Nieuwsbegrip, and PEC&nbsp;Zwolle pages.
 *
 * Pass a `classPrefix` to namespace the CSS classes per page:
 *   - `hb`  → `.hb-rule.hb-rule-anim`
 *   - `np`  → `.np-rule.np-rule-anim`
 *   - `pz`  → `.pz-rule.pz-rule-anim`
 */
const RuleGrow: React.FC<{ delayMs?: number; classPrefix?: string }> = ({
  delayMs = 0,
  classPrefix = "hb",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.classList.add("is-in");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (playedRef.current) break;
          if (!e.isIntersecting) continue;

          const ratio = e.intersectionRatio;
          const top = e.boundingClientRect.top;
          const vh = e.rootBounds?.height ?? window.innerHeight;
          const deepEnough = ratio >= 0.6 && top >= vh * 0.15;

          if (deepEnough) {
            playedRef.current = true;
            if (delayMs > 0)
              el.style.transitionDelay = `${Math.max(0, delayMs)}ms`;
            requestAnimationFrame(() => el.classList.add("is-in"));
            obs.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -25% 0px",
        threshold: [0, 0.25, 0.6, 0.9, 1],
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={`${classPrefix}-rule ${classPrefix}-rule-anim`}
      role="separator"
      aria-hidden="true"
    />
  );
};

export default RuleGrow;
