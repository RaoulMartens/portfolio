import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Nieuwsbegrip.tsx
import { useEffect, useRef } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
/* Respect reduced motion */
const prefersReducedMotion = typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Left→Right grow divider (same logic as HalloBuur) */
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
    return _jsx("div", { ref: ref, className: "np-rule np-rule-anim", role: "separator", "aria-hidden": "true" });
};
const Nieuwsbegrip = () => {
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
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx("main", { "aria-label": "Nieuwsbegrip case study", className: "np-main", children: _jsxs("section", { className: "np-container", children: [_jsx("div", { className: "np-grid", children: _jsxs("div", { className: "np-content", children: [_jsx("h5", { className: "np-title", children: _jsx(SplitText, { text: "Nieuwsbegrip", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left" }) }), _jsx("p", { className: "np-subtitle", children: _jsx(SplitText, { text: "A fresh take on the news-based reading comprehension method.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left", startDelay: 0.15 }) })] }) }), _jsx("div", { className: "np-grid np-divider-wrap", children: _jsx("div", { className: "np-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "np-block", children: _jsxs("div", { className: "np-block-grid", children: [_jsx("div", { className: "np-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Introduction" }) }) }), _jsx("div", { className: "np-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "How can we make teaching easier in an already demanding classroom environment? That was the question my team and I set out to answer when we were challenged to redesign Nieuwsbegrip. A widely used platform that helps teachers improve students\u2019 reading comprehension through weekly news-based lessons. Working in a multidisciplinary team of five, we applied the IDEO design thinking process to develop a renewed concept specifically tailored to teachers. Through multiple iterations, co-creative sessions, and user testing with educators, we created a more intuitive and efficient experience that helps teachers focus on what they do best: teaching." }) }) })] }) }), _jsx("div", { className: "np-grid", children: _jsx("div", { className: "np-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "np-block", children: _jsxs("div", { className: "np-block-grid", children: [_jsx("div", { className: "np-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Context" }) }) }), _jsx("div", { className: "np-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "While the platform is rich in content, many teachers experience friction when using it\u2014citing difficulty navigating, a cluttered interface, and a lack of clarity when preparing lessons. Our redesign aimed to reduce this friction by simplifying the teacher\u2019s journey: from logging in and selecting appropriate texts to planning and assigning lessons, streamlining the process to better support their daily workflow." }) }) })] }) }), _jsx("div", { className: "np-grid", children: _jsx("div", { className: "np-images", children: [1, 2, 3, 4, 5, 6].map((num) => (_jsx(AnimatedContent, { ...imageReveal, delay: num * 0.1, children: _jsx("figure", { className: "np-image", children: _jsx("img", { src: `/images/nieuwsbegrip/image-${num}.jpg`, alt: `Project image ${num}`, loading: "lazy", decoding: "async" }) }) }, num))) }) })] }) }), _jsx(Footer, {})] }));
};
export default Nieuwsbegrip;
