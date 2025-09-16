import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/HalloBuur2.tsx
import { useEffect, useRef } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
/* Respect reduced motion */
const prefersReducedMotion = typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Left→Right grow divider (same as other pages) */
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
    return _jsx("div", { ref: ref, className: "hb2-rule hb2-rule-anim", role: "separator", "aria-hidden": "true" });
};
const HalloBuur2 = () => {
    /* --- animations (match HalloBuur feel) --- */
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
    const heroImgAnim = {
        ...imageReveal,
        distance: 80,
        duration: 0.8,
        startOnMount: true,
        delay: 0.18,
    };
    const STAGGER = 0.18;
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx("main", { "aria-label": "Hallo Buur 2 case study", className: "hb2-main", children: _jsxs("section", { className: "hb2-container", children: [_jsx("div", { className: "hb2-grid", children: _jsxs("div", { className: "hb2-content", children: [_jsx("h5", { className: "hb2-title", children: _jsx(SplitText, { text: "Understanding community change", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left" }) }), _jsx("p", { className: "hb2-subtitle", children: _jsx(SplitText, { text: "Researching social connection in a shifting residential community.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left", startDelay: 0.15 }) }), _jsx("div", { className: "hb2-hero", children: _jsx(AnimatedContent, { ...heroImgAnim, children: _jsx("img", { className: "hb2-hero-img", src: "/images/hallo-buur2/hero.jpg", alt: "Hallo Buur 2 \u2014 hero", decoding: "async", loading: "eager", fetchPriority: "high" }) }) })] }) }), _jsx("div", { className: "hb2-block", children: _jsxs("div", { className: "hb2-block-grid", children: [_jsx("div", { className: "hb2-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Introduction" }) }) }), _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "After various probes and observations, I discovered that elderly people do desire more social contact but are not easily open to change. By conducting a co-creation session, I gained insight into how deeply these desires are rooted and why they are unable to take the first step themselves." }) }) })] }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { className: "hb2-image", src: "/images/hallo-buur2/wide-1.jpg", alt: "Hallo Buur 2 \u2014 board overview" }) }) }) }), _jsx("div", { className: "hb2-block", children: _jsxs("div", { className: "hb2-block-grid", children: [_jsx("div", { className: "hb2-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Context" }) }) }), _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "In a residential complex owned by Talis on Aubadestraat in Nijmegen, many elderly people live. Until recently, the complex had a 65-plus label, but this has since been removed. This means that the number of elderly residents is decreasing, and this gap is not being filled for the time being. Increasingly, young and foreign people are moving in. The older residents miss the sense of community they once had and would like to have more contact with the new residents." }) }) })] }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "hb2-block hb2-title-only", children: _jsx("div", { className: "hb2-block-grid", children: _jsx("div", { className: "hb2-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Why a Co-Creation?" }) }) }) }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-cards-right", children: [
                                    {
                                        title: "Needs and desires",
                                        body: "By actively thinking along and sharing their ideas, participants provide me, as a researcher, " +
                                            "with a better and more nuanced understanding of their actual needs, values, and desires.",
                                        iconClass: "mask-shopping-bag",
                                    },
                                    {
                                        title: "Depth",
                                        body: "Where traditional methods such as surveys or interviews are often structured and more superficial, " +
                                            "co-creation allows for open exploration and deeper conversations. This brings hidden insights and emotions to light.",
                                        iconClass: "mask-triangle",
                                    },
                                ].map((c, i) => (_jsx(AnimatedContent, { ...textReveal, delay: i * 0.06, children: _jsxs("div", { className: "hb2-card", children: [_jsx("div", { className: `hb2-card-icon ${c.iconClass}` }), _jsx("h5", { children: c.title }), _jsx("p", { children: c.body })] }) }, i))) }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "hb2-block", children: _jsxs("div", { className: "hb2-block-grid", children: [_jsx("div", { className: "hb2-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "The Co-Creation" }) }) }), _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "I started by sharing the results of a previously conducted cultural probe. It quickly became clear that the residents had already reviewed these results themselves. This demonstrates their curiosity and their willingness to occasionally cross ethical boundaries to satisfy this curiosity. After discussing the results, I asked why they think some residents don\u2019t come to the common area, and why others do. It became apparent that they believe those who don\u2019t come have a negative perception of them. The level of distrust among residents is significant." }) }) })] }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { className: "hb2-image", src: "/images/hallo-buur2/wide-2.jpg", alt: "Hallo Buur 2 \u2014 posting flow" }) }) }) }), _jsx("div", { className: "hb2-block", children: _jsx("div", { className: "hb2-block-grid", children: _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("p", { children: "Some residents aren\u2019t affected by the negativity and even suggest solutions\u2014for instance, displaying positive feedback at the building\u2019s entrance to highlight what makes the common area cozy. Still, tensions remain. One resident, who occasionally joins communal activities, recalled being handed a paintbrush with the comment, \u201CThe paint will come later,\u201D which, though humorous, felt personal. This illustrates how negative remarks still impact residents and may contribute to group divisions. To explore these dynamics further, I visited several residents to ask where they live, how they relate to neighbours, which routes they take through the building, and where they typically meet others\u2014insights that may inform the design later." }) }) }) }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { className: "hb2-image hb2-image--hairline-fix", src: "/images/hallo-buur2/wide-3.jpg", alt: "Hallo Buur 2 \u2014 sorting and filters" }) }) }) }), _jsx("div", { className: "hb2-block", children: _jsx("div", { className: "hb2-block-grid", children: _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("p", { children: "The next task was to create a discussion board. By asking the residents what they value about the complex and letting them discuss it, we managed to reduce the negative thoughts from earlier. They had a pleasant chat about previously organized activities and the experiences they had gained from them." }) }) }) }) }), _jsx("div", { className: "hb2-grid", children: _jsx("div", { className: "hb2-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { className: "hb2-image", src: "/images/hallo-buur2/wide-4.jpg", alt: "Hallo Buur 2 \u2014 responses and confirmations" }) }) }) }), _jsx("div", { className: "hb2-block", children: _jsxs("div", { className: "hb2-block-grid", children: [_jsx("div", { className: "hb2-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Result" }) }) }), _jsx("div", { className: "hb2-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "I then processed the results of this session into a neighbourhood value map. This serves as an excellent addition to one of the earlier ideas from the co-creation session, where it was suggested to hang the positive feedback at the entrance of the building. In this way, anyone entering the building can immediately see the value of the community within the complex." }) }) })] }) }), _jsx("div", { className: "hb2-grid hb2-bottom-gap", children: _jsx("div", { className: "hb2-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { className: "hb2-image", src: "/images/hallo-buur2/wide-5.jpg", alt: "Hallo Buur 2 \u2014 accessible patterns" }) }) }) })] }) }), _jsx(Footer, {})] }));
};
export default HalloBuur2;
