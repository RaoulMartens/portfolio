import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';
import { hasPlayed } from '../../utils/animationMemory';
/* ---------- dotLottie web component wrapper ---------- */
const DotlottiePlayer = React.forwardRef((props, ref) => React.createElement('dotlottie-player', { ...props, ref }));
DotlottiePlayer.displayName = 'DotlottiePlayer';
/* ---------- Small Lottie wrapper ---------- */
const LottieAnim = ({ src, loop = true, autoplay = true, className }) => {
    const [ready, setReady] = useState(false);
    const [shouldAutoplay, setShouldAutoplay] = useState(autoplay);
    const playerRef = useRef(null);
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches)
            setShouldAutoplay(false);
    }, [autoplay]);
    useEffect(() => {
        if (typeof window === 'undefined' || !('customElements' in window)) {
            setReady(true);
            return;
        }
        if (customElements.get('dotlottie-player')) {
            setReady(true);
            return;
        }
        customElements.whenDefined('dotlottie-player')
            .then(() => setReady(true))
            .catch(() => setReady(true));
    }, []);
    // Force svg cover behavior once shadow DOM exists
    useEffect(() => {
        if (!ready || !playerRef.current)
            return;
        let raf = 0;
        const apply = () => {
            const root = playerRef.current.shadowRoot;
            const svg = root?.querySelector?.('svg');
            if (!svg) {
                raf = requestAnimationFrame(apply);
                return;
            }
            svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            svg.style.width = '100%';
            svg.style.height = '100%';
        };
        apply();
        return () => { if (raf)
            cancelAnimationFrame(raf); };
    }, [ready]);
    return (_jsx("div", { className: `lottie-player-container ${className ?? ''}`, children: ready && (_jsx(DotlottiePlayer, { ref: playerRef, src: src, autoplay: shouldAutoplay, loop: loop, background: "transparent", renderer: "svg" })) }));
};
/* ---------- Theme sync (DOM class watch) ---------- */
function useIsDarkFromDOM() {
    const getIsDark = () => document.documentElement.classList.contains('dark') ||
        document.documentElement.classList.contains('mapped--dark') ||
        document.body.classList.contains('dark') ||
        document.body.classList.contains('mapped--dark');
    const [isDark, setIsDark] = useState(() => {
        if (typeof document === 'undefined')
            return false;
        return getIsDark();
    });
    useEffect(() => {
        const update = () => setIsDark(getIsDark());
        const htmlObs = new MutationObserver(update);
        const bodyObs = new MutationObserver(update);
        htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        const onStorage = (e) => { if (e.key === 'theme')
            update(); };
        window.addEventListener('storage', onStorage);
        update();
        return () => {
            htmlObs.disconnect();
            bodyObs.disconnect();
            window.removeEventListener('storage', onStorage);
        };
    }, []);
    return isDark;
}
/* ---------- Link ---------- */
const LinkWithHover = ({ link, className }) => {
    const isDark = useIsDarkFromDOM();
    const chevronSrc = useMemo(() => (isDark ? '/images/chevron-right-dark.svg' : '/images/chevron-right.svg'), [isDark]);
    return (_jsxs("a", { href: link, className: `project-link ${className ?? ''}`, "aria-label": "Read story", children: [_jsx("span", { children: "Read story" }), _jsx("img", { className: "active-icon", src: chevronSrc, alt: "" })] }));
};
/* ---------- Project header ---------- */
const ProjectInfo = memo(({ title, meta, link }) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        if (hasPlayed(`${link}::title`) || hasPlayed(`${link}::meta`) || hasPlayed(`${link}::cta`)) {
            setInView(true);
        }
    }, [link]);
    useEffect(() => {
        if (inView)
            return;
        const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                    break;
                }
            }
        }, {
            rootMargin: '0px 0px -25% 0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.5],
        });
        if (ref.current)
            obs.observe(ref.current);
        return () => obs.disconnect();
    }, [inView]);
    return (_jsxs("div", { className: "project-header", ref: ref, children: [_jsxs("div", { className: "project-info", children: [_jsx("h2", { className: "project-title", children: inView ? (_jsx(SplitText, { text: title, delay: 100, duration: 0.8, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 32 }, to: { opacity: 1, y: 0 }, threshold: 0.9, rootMargin: "-5% 0px -25% 0px", textAlign: "left", persistId: `${link}::title` })) : (_jsx("span", { className: "invisible", children: title })) }), _jsx("p", { className: "project-meta body-sm-medium", children: inView ? (_jsx(SplitText, { text: meta, delay: 100, duration: 0.6, ease: "power3.out", splitType: "words", from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, threshold: 0.95, rootMargin: "-5% 0px -20% 0px", textAlign: "left", persistId: `${link}::meta` })) : (_jsx("span", { className: "invisible", children: meta })) })] }), _jsx("div", { className: "project-link-desktop", children: inView && (_jsx(AnimatedContent, { distance: 50, direction: "horizontal", reverse: true, duration: 0.8, ease: "power3.out", delay: 1, animateOpacity: true, initialOpacity: 0, persistId: `${link}::cta`, children: _jsx(LinkWithHover, { link: link }) })) })] }));
});
ProjectInfo.displayName = 'ProjectInfo';
/* ---------- Project card ---------- */
const ProjectCard = ({ title, meta, link, media, isVideo = false, }) => {
    const lottieSrc = '/videos/hallo-buur.lottie';
    return (_jsx("section", { className: "project-background", children: _jsx("div", { className: "grid-container", children: _jsx("div", { className: "grid-x project-background-row", children: _jsxs("section", { className: "project-card cell small-12 medium-10 medium-offset-1 large-8 large-offset-2", children: [_jsx(ProjectInfo, { title: title, meta: meta, link: link }), _jsx("div", { className: "project-image-wrapper", children: _jsx("a", { href: link, "aria-label": `Open ${title}`, className: "media-link", children: _jsx("div", { className: "media-inner", children: isVideo ? (_jsx(LottieAnim, { src: lottieSrc, loop: true, autoplay: true })) : (_jsx("img", { src: media.src, alt: media.alt, className: "project-image" })) }) }) }), _jsx("div", { className: "project-link-mobile", children: _jsx(AnimatedContent, { persistId: `${link}::cta`, children: _jsx(LinkWithHover, { link: link }) }) })] }) }) }) }));
};
export default ProjectCard;
