import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';
const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 10, wrapperClassName = '', innerClassName = '', ...props }) => {
    const magnetRef = useRef(null);
    const [{ x, y }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        config: { tension: 280, friction: 12, mass: 1.2 },
    }));
    useEffect(() => {
        if (disabled) {
            api.start({ x: 0, y: 0 });
            return;
        }
        const handleMouseMove = (e) => {
            if (!magnetRef.current)
                return;
            const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
            const cx = left + width / 2;
            const cy = top + height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            if (Math.abs(dx) < width / 2 + padding && Math.abs(dy) < height / 2 + padding) {
                api.start({ x: dx / magnetStrength, y: dy / magnetStrength });
            }
            else {
                api.start({ x: 0, y: 0 });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [padding, disabled, magnetStrength, api]);
    return (_jsx("div", { ref: magnetRef, className: wrapperClassName, style: { position: 'relative', display: 'inline-block' }, ...props, children: _jsx(animated.div, { className: innerClassName, style: {
                transform: to([x, y], (xv, yv) => `translate3d(${xv}px, ${yv}px, 0)`),
                willChange: 'transform',
            }, children: children }) }));
};
function useBreakpoint() {
    const [bp, setBp] = useState(null);
    useEffect(() => {
        const calc = () => {
            const w = window.innerWidth;
            setBp(w < 768 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop');
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, []);
    return bp;
}
/* ----------------------------- */
/* Hero                          */
/* ----------------------------- */
const Hero = () => {
    const bp = useBreakpoint();
    const [viewportHeight, setViewportHeight] = useState('100vh');
    useLayoutEffect(() => {
        const calculateHeight = () => {
            const nav = document.querySelector('.navbar');
            const offset = nav?.offsetHeight || 0;
            setViewportHeight(`calc(100vh - ${offset}px)`);
        };
        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);
    const handleAnimationComplete = () => { };
    // Play-like image animation
    const heroImgAnim = {
        distance: 80,
        direction: 'vertical',
        duration: 0.8,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
        initialOpacity: 0,
        animateOpacity: true,
        startOnMount: true,
        rootMarginBottomPct: 14,
        delay: 0.18,
    };
    // The phrase we want to highlight across all breakpoints
    const heroGroupPhrase = {
        tokens: ['ux', '&', 'product', 'designer'],
        className: 'gradient-group',
    };
    if (!bp)
        return null;
    return (_jsx("header", { id: "top", className: "site-header", style: { minHeight: viewportHeight }, children: _jsxs("div", { className: "grid-container hero-center-wrap", children: [bp === 'desktop' && (_jsx("div", { className: "hero-desktop-layout", children: _jsx("div", { className: "hero-grid", children: _jsx("div", { className: "hero-title-row", children: _jsxs("div", { className: "hero-title-wrapper", children: [_jsxs("div", { className: "hero-desktop-title-container", children: [_jsx("div", { className: "page-title hero-title", children: _jsx(SplitText, { text: "I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people.", delay: 50, duration: 0.8, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 }, threshold: 0.1, rootMargin: "-100px", textAlign: "left", onLetterAnimationComplete: handleAnimationComplete, groupPhrase: heroGroupPhrase }) }), _jsxs("div", { className: "subtitle-row", children: [_jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.1, children: _jsx("img", { src: "/images/map-pin.svg", alt: "Location pin", width: 24, height: 24 }) }), _jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.3, children: _jsx("div", { className: "subtitle-text", children: _jsx(SplitText, { text: "Currently designing at HAN University", delay: 80, duration: 0.6, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-100px", textAlign: "left" }) }) })] })] }), _jsx(AnimatedContent, { ...heroImgAnim, children: _jsx(Magnet, { padding: 50, magnetStrength: 9, children: _jsx("img", { src: "/images/hero-image.jpg", alt: "Hero image", className: "hero-image hero-image--desktop" }) }) })] }) }) }) })), bp === 'tablet' && (_jsxs("div", { className: "hero-tablet-layout", children: [_jsx(AnimatedContent, { ...heroImgAnim, children: _jsx(Magnet, { padding: 50, magnetStrength: 9, children: _jsx("img", { src: "/images/hero-image.jpg", alt: "Hero image", className: "hero-image hero-image--tablet" }) }) }), _jsxs("div", { className: "text-container", style: { width: '100%' }, children: [_jsx("div", { className: "page-title hero-title hero-title--tablet", children: _jsx(SplitText, { text: "I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people.", delay: 50, duration: 0.8, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 }, threshold: 0.1, rootMargin: "-100px", textAlign: "center", onLetterAnimationComplete: handleAnimationComplete, groupPhrase: heroGroupPhrase }) }), _jsxs("div", { className: "subtitle-row", children: [_jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.1, children: _jsx("img", { src: "/images/map-pin.svg", alt: "Location pin", width: 24, height: 24 }) }), _jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.3, children: _jsx("div", { className: "subtitle-text", children: _jsx(SplitText, { text: "Currently designing at HAN University", delay: 80, duration: 0.6, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-100px", textAlign: "center" }) }) })] })] })] })), bp === 'mobile' && (_jsxs("div", { className: "hero-mobile-layout", children: [_jsx(AnimatedContent, { ...heroImgAnim, children: _jsx(Magnet, { padding: 50, magnetStrength: 9, children: _jsx("img", { src: "/images/hero-image.jpg", alt: "Young man wearing a light cap and blue shirt, smiling while sitting at an outdoor caf\u00E9.", className: "hero-image hero-image--mobile" }) }) }), _jsxs("div", { className: "text-container", style: { width: '100%' }, children: [_jsx("div", { className: "page-title hero-title hero-title--mobile", children: _jsx(SplitText, { text: "I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people.", delay: 50, duration: 0.8, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 }, threshold: 0.1, rootMargin: "-100px", textAlign: "center", onLetterAnimationComplete: handleAnimationComplete, groupPhrase: heroGroupPhrase }) }), _jsxs("div", { className: "subtitle-row", children: [_jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.1, children: _jsx("img", { src: "/images/map-pin.svg", alt: "Location pin", width: 16, height: 16, style: { display: 'block', verticalAlign: 'middle' } }) }), _jsx(AnimatedContent, { distance: 50, direction: "vertical", duration: 1, ease: "power3.out", initialOpacity: 0, animateOpacity: true, scale: 1, threshold: 0.1, delay: 1.3, children: _jsx("div", { className: "subtitle-text", children: _jsx(SplitText, { text: "Currently designing at HAN University", delay: 80, duration: 0.6, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-100px", textAlign: "center" }) }) })] })] })] }))] }) }));
};
export default Hero;
