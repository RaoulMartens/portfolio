import { useState, useEffect, useLayoutEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const getBP = (): Breakpoint => {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w <= 1024 ? "tablet" : "desktop";
};

/**
 * SSR-safe breakpoint hook.
 * Returns current breakpoint and updates on resize.
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBP);

  // Correct immediately on first paint to avoid flash
  useLayoutEffect(() => {
    setBp(getBP());
  }, []);

  useEffect(() => {
    const onResize = () => setBp(getBP());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}
