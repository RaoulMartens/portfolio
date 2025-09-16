import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
/* ----------------------------- */
/* In-view title hook            */
/* ----------------------------- */
function useInViewTitle(options) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        if (inView)
            return;
        let obs = null;
        let rafId = 0;
        const arm = () => {
            if (obs)
                return;
            const { rootMargin = "0px 0px -35% 0px", thresholds = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1], minRatio = 0.6, minTopRatio = 0.2, } = options || {};
            obs = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting)
                        continue;
                    const vh = entry.rootBounds?.height ?? window.innerHeight;
                    const top = entry.boundingClientRect.top;
                    const ratio = entry.intersectionRatio;
                    const deepEnough = ratio >= minRatio && top >= vh * minTopRatio;
                    if (deepEnough) {
                        setInView(true);
                        obs?.disconnect();
                        obs = null;
                        break;
                    }
                }
            }, { rootMargin, threshold: thresholds });
            rafId = requestAnimationFrame(() => {
                if (ref.current)
                    obs?.observe(ref.current);
            });
        };
        const afterFonts = () => arm();
        if ("fonts" in document && document.fonts?.ready) {
            document.fonts.ready.then(afterFonts).catch(afterFonts);
        }
        else {
            afterFonts();
        }
        return () => {
            if (rafId)
                cancelAnimationFrame(rafId);
            obs?.disconnect();
            obs = null;
        };
    }, [inView, options]);
    return { ref, inView };
}
const Me = () => {
    // Scroll-triggered titles (match ProjectCard behavior)
    const approach = useInViewTitle({
        rootMargin: "0px 0px -35% 0px",
        thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
        minRatio: 0.6,
        minTopRatio: 0.2,
    });
    const favorites = useInViewTitle({
        rootMargin: "0px 0px -35% 0px",
        thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
        minRatio: 0.6,
        minTopRatio: 0.2,
    });
    // Reuse the exact hero image animation config
    const heroImgAnim = {
        distance: 80,
        direction: "vertical",
        duration: 0.8,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        initialOpacity: 0,
        animateOpacity: true,
        startOnMount: true,
        rootMarginBottomPct: 14,
        delay: 0.18,
    };
    // Paragraph should appear a bit later than the image
    const heroBodyAnim = {
        ...heroImgAnim,
        delay: 0.35,
    };
    // Card reveal (identical to HalloBuur2.tsx textReveal)
    const cardReveal = {
        distance: 80,
        direction: "vertical",
        duration: 0.8,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        initialOpacity: 0,
        animateOpacity: true,
        rootMarginBottomPct: 14,
    };
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx("main", { "aria-label": "Me page", className: "me-main", children: _jsxs("div", { className: "grid-container me-grid", children: [_jsx("div", { className: "me-title-col", children: _jsx("h1", { className: "page-title me-title", children: _jsx(SplitText, { text: "My design journey kicked off with late night sessions making football posters. That spark soon branched into digital products.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, rootMargin: "-100px", textAlign: "left", groupPhrase: { tokens: ["digital", "products"], className: "gradient-group" } }) }) }), _jsx("div", { className: "me-image-col", children: _jsx(AnimatedContent, { ...heroImgAnim, children: _jsx("img", { className: "me-image", src: "/images/me/me.jpg", alt: "Raoul Martens" }) }) }), _jsx("div", { className: "me-body-col", children: _jsx(AnimatedContent, { ...heroBodyAnim, children: _jsx("p", { className: "me-body", children: "Since then I\u2019ve centred my practice on design thinking: observing, reframing, prototyping and testing until the problem is unmistakably clear. I begin every project by listening: mapping behaviours, emotions instead of jumping straight to pixels. From there I iterate fast\u2014sketch, wireframe, clickable proof. Because ideas earn their keep only when real users respond to them." }) }) }), _jsx("div", { className: "me-approach-title-col", children: _jsx("div", { ref: approach.ref, children: _jsx("h2", { className: "me-approach-title", children: approach.inView ? (_jsx(SplitText, { text: "My approach, from first spark to live product", splitType: "words", delay: 100, duration: 0.8, ease: "power3.out", from: { opacity: 0, y: 32 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-5% 0px -25% 0px", textAlign: "left", startDelay: 0 })) : (_jsx("span", { className: "invisible-placeholder", children: "My approach, from first spark to live product" })) }) }) }), _jsx("div", { className: "me-cards-wrap", "aria-label": "Design process steps (grid on tablet & stacked on mobile)", children: [
                                { idx: 1, title: "Empathize", body: "Real insight saves weeks of nice looking but useless UI.", iconClass: "mask-empathize" },
                                { idx: 2, title: "Define", body: "Focus keeps scope tight and decisions easy to defend.", iconClass: "mask-define" },
                                { idx: 3, title: "Ideate", body: "Quantity early, so quality can surface later.", iconClass: "mask-ideate" },
                                { idx: 4, title: "Prototype", body: "Making it tangible turns opinions into evidence.", iconClass: "mask-prototype" },
                                { idx: 5, title: "Iterate", body: "Each loop nudges the product closer to effortless.", iconClass: "mask-iterate" },
                            ].map((c, i) => (_jsx(AnimatedContent, { ...cardReveal, delay: i * 0.06, children: _jsxs("div", { className: "me-card", children: [_jsx("div", { className: `me-card-icon ${c.iconClass}` }), _jsx("h5", { children: c.title }), _jsx("p", { children: c.body })] }) }, c.idx))) }), _jsx("div", { className: "me-favorites-title-col", children: _jsx("div", { ref: favorites.ref, children: _jsx("h2", { className: "me-favorites-title", children: favorites.inView ? (_jsx(SplitText, { text: "A few things I live for", splitType: "words", delay: 100, duration: 0.8, ease: "power3.out", from: { opacity: 0, y: 32 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-5% 0px -25% 0px", textAlign: "right", startDelay: 0 })) : (_jsx("span", { className: "invisible-placeholder", children: "A few things I live for" })) }) }) }), _jsx("div", { className: "me-favorites-cards", children: [
                                {
                                    title: "Football’s rhythm",
                                    body: "I grew up with a ball at my feet, and the sport still resets my head. Strategy, teamwork, split-second decisions, exactly the muscles I use in product design, just covered in grass stains and echoing with last-minute cheers.",
                                    iconClass: "mask-football",
                                },
                                {
                                    title: "Curious making",
                                    body: "Give me a blank canvas, Figma frame, Blender scene and I’ll fill it. I love turning half formed ideas into visuals people can react to, whether that’s a micro interaction in an app or a poster that lives on a bedroom wall.",
                                    iconClass: "mask-hammer",
                                },
                                {
                                    title: "Stories on screen",
                                    body: "Films and narrative driven games fascinate me. I pause, rewind, dissect pacing, colour and sound design the way some people study code. It keeps my sense of storytelling sharp.",
                                    iconClass: "mask-macbook",
                                },
                                {
                                    title: "Analogue moments",
                                    body: "I shoot 35 mm photos to slow down. Waiting for a roll to develop reminds me that not everything should be instant, and that patience often rewards with richer results.",
                                    iconClass: "mask-camera",
                                },
                            ].map((f, i) => (_jsx(AnimatedContent, { ...cardReveal, delay: i * 0.06, children: _jsxs("div", { className: "me-card me-fav-card", children: [_jsx("div", { className: `me-card-icon ${f.iconClass}` }), _jsx("h5", { children: f.title }), _jsx("p", { children: f.body })] }) }, i))) })] }) }), _jsx(Footer, {})] }));
};
export default Me;
