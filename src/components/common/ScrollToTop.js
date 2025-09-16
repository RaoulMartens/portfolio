import { useEffect } from "react";
import { useLocation } from "react-router-dom";
/**
 * Global scroll manager:
 * - Scrolls to the top on every route change
 * - EXCEPT when navigating to the "Work" section on Home
 *   (hash === "#work" or location.state?.scrollTo === "work").
 */
const ScrollToTop = () => {
    // If you use RRv6, `useLocation`'s state is unknown — narrow it here.
    const { pathname, hash, state } = useLocation();
    useEffect(() => {
        const goingToWork = hash === "#work" || state?.scrollTo === "work";
        if (goingToWork)
            return;
        // Scroll after the new route paints.
        const raf = requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
        return () => cancelAnimationFrame(raf);
    }, [pathname, hash, state]);
    return null;
};
export default ScrollToTop;
