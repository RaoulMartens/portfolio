import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/PECZwolle.tsx
import { useEffect, useRef } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
/* Respect reduced motion */
const prefersReducedMotion = typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Left→Right grow divider */
const RuleGrow = ({ delayMs = 0 }) => {
    const ref = useRef(null);
    const playedRef = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (prefersReducedMotion) {
            el.classList.add("is-in");
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (playedRef.current)
                    break;
                if (!e.isIntersecting)
                    continue;
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
        }, { root: null, rootMargin: "0px 0px -25% 0px", threshold: [0, 0.25, 0.6, 0.9, 1] });
        obs.observe(el);
        return () => obs.disconnect();
    }, [delayMs]);
    return _jsx("div", { ref: ref, className: "pz-rule pz-rule-anim", role: "separator", "aria-hidden": "true" });
};
const PECZwolle = () => {
    // animations (same feel as other project pages)
    const textReveal = {
        distance: 80,
        direction: "vertical",
        duration: 0.8,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        initialOpacity: 0,
        animateOpacity: true,
        rootMarginBottomPct: 14,
    };
    const imageReveal = {
        distance: 60,
        direction: "vertical",
        duration: 0.7,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        initialOpacity: 0,
        animateOpacity: true,
        rootMarginBottomPct: 28,
    };
    const STAGGER = 0.18;
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx("main", { "aria-label": "PEC Zwolle case study", className: "pz-main", children: _jsxs("section", { className: "pz-container", children: [_jsx("div", { className: "pz-grid", children: _jsxs("div", { className: "pz-content", children: [_jsx("h5", { className: "pz-title", children: _jsx(SplitText, { text: "PEC Zwolle", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left" }) }), _jsx("p", { className: "pz-subtitle", children: _jsx(SplitText, { text: "Bringing an Eredivisie club\u2019s matches and campaigns to life.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left", startDelay: 0.15 }) })] }) }), _jsx("div", { className: "pz-grid pz-divider-wrap", children: _jsx("div", { className: "pz-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "pz-block", children: _jsxs("div", { className: "pz-block-grid", children: [_jsx("div", { className: "pz-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Matchdays" }) }) }), _jsx("div", { className: "pz-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "I've proudly collaborated with PEC Zwolle, creating posters for various matches. Each design was crafted using a combination of Photoshop and Blender, showcasing a dynamic blend of 2D and 3D elements." }) }) })] }) }), _jsx("div", { className: "pz-grid", children: _jsx("div", { className: "pz-images-2x2", children: _jsx("div", { className: "pz-2x2", children: [1, 2, 3, 4].map((n) => (_jsx(AnimatedContent, { ...imageReveal, delay: n * 0.08, children: _jsx("figure", { className: "pz-img-vert", "aria-label": `Portrait ${n}`, children: _jsx("img", { src: `/images/pec-zwolle/vert-${n}.jpg`, alt: `PEC Zwolle portrait ${n}`, loading: "lazy", decoding: "async" }) }) }, n))) }) }) }), _jsx("div", { className: "pz-grid", children: _jsx("div", { className: "pz-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "pz-block", children: _jsxs("div", { className: "pz-block-grid", children: [_jsx("div", { className: "pz-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Ticket Campaign" }) }) }), _jsx("div", { className: "pz-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "PEC Zwolle asked me to design a special poster for the 2023/24 season ticket campaign. Of course, I couldn't say no to this opportunity." }) }) })] }) }), _jsx("div", { className: "pz-grid", children: _jsx("div", { className: "pz-mosaic", children: _jsxs("div", { className: "pz-mosaic-grid", children: [_jsx(AnimatedContent, { ...imageReveal, children: _jsx("figure", { className: "pz-mosaic-left", "aria-label": "Tall portrait", children: _jsx("img", { src: "/images/pec-zwolle/vert-5.jpg", alt: "PEC Zwolle portrait", loading: "lazy", decoding: "async" }) }) }), _jsx("div", { className: "pz-mosaic-right", children: [1, 2].map((i) => (_jsx(AnimatedContent, { ...imageReveal, delay: i * 0.08, children: _jsx("figure", { className: "pz-img-horz", "aria-label": `Horizontal ${i}`, children: _jsx("img", { src: `/images/pec-zwolle/horz-${i}.jpg`, alt: `PEC Zwolle horizontal ${i}`, loading: "lazy", decoding: "async" }) }) }, i))) })] }) }) }), _jsx("div", { className: "pz-grid", children: _jsx("div", { className: "pz-wide", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("figure", { className: "pz-wide-figure", "aria-label": "Full width horizontal", children: _jsx("img", { src: "/images/pec-zwolle/wide-1.jpg", alt: "PEC Zwolle full-width visual", loading: "lazy", decoding: "async" }) }) }) }) })] }) }), _jsx(Footer, {})] }));
};
export default PECZwolle;
