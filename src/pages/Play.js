import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import AnimatedContent from "../components/common/AnimatedContent";
import SplitText from "../components/common/SplitText";
const GALLERY_MAIN = [
    { src: "/images/play/football-psg.jpg", alt: "Creative scene with players" },
    { src: "/images/play/football-euros.jpg", alt: "Retro sports composite" },
    { src: "/images/play/football-messi.jpg", alt: "Trophies portrait" },
    { src: "/images/play/football-haaland.jpg", alt: "Sails and atmosphere" },
    { src: "/images/play/football-mbappe.jpg", alt: "Tower and sky vortex" },
    { src: "/images/play/football-championsleague.jpg", alt: "Golden trophy composition" },
    { src: "/images/play/football-liverpool.jpg", alt: "Juventus match moment" },
    { src: "/images/play/football-messi-space.png", alt: "Barcelona celebration" },
    { src: "/images/play/football-italy.jpg", alt: "Real Madrid intensity" },
];
const GALLERY_WIDE = [
    { src: "/images/play/collabassa-ver.jpg", alt: "Dutch orange crowd" },
    { src: "/images/play/utrecht-gebouw.jpg", alt: "Italy team spirit" },
];
const GALLERY_SQUARE = [
    { src: "/images/play/kerk-plafond.jpg", alt: "Square image 1" },
    { src: "/images/play/poemba.jpg", alt: "Square image 2" },
    { src: "/images/play/boom-closeup.jpg", alt: "Square image 3" },
    { src: "/images/play/toverland-paard.jpg", alt: "Square image 4" },
];
const GALLERY_MIX = {
    horizontal: { src: "/images/play/venlo-station.jpg", alt: "Mixed row horizontal" },
    vertical: { src: "/images/play/italie-bruggen.jpg", alt: "Mixed row vertical" },
};
const GALLERY_VERTICALS = [
    { src: "/images/play/antwerpen-tram.jpg", alt: "Vertical image 1" },
    { src: "/images/play/italie-uitzicht.jpg", alt: "Vertical image 2" },
    { src: "/images/play/breda-cathedraal.jpg", alt: "Vertical image 3" },
];
const GALLERY_SQ_WIDE = {
    square: { src: "/images/play/nina-sissy.jpg", alt: "Row square image" },
    horizontal: { src: "/images/play/rund-in-bos.jpg", alt: "Row horizontal image" },
};
const GALLERY_WIDE_2 = [
    { src: "/images/play/antwerpen-werk.jpg", alt: "Extra horizontal image 1" },
    { src: "/images/play/friet-scootmobiel.jpg", alt: "Extra horizontal image 2" },
];
/** Returns 1/2/3 columns to match CSS (<=767:1, 768–1024:2, >=1025:3) */
function getCols() {
    if (typeof window === "undefined")
        return 1;
    if (window.matchMedia("(min-width: 1025px)").matches)
        return 3;
    if (window.matchMedia("(min-width: 768px)").matches)
        return 2;
    return 1;
}
const Play = () => {
    const imgAnim = {
        distance: 80,
        direction: "vertical",
        duration: 0.8,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        initialOpacity: 0,
        animateOpacity: true,
    };
    const STAGGER_COL = 0.22;
    const LATE = new Set([3, 4, 5]);
    const VERY_LATE = new Set([6, 7, 8]);
    // compute once per render (fine for progressive delays)
    const colsMain = getCols();
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsxs("main", { "aria-label": "Play page", className: "play-main", children: [_jsx("section", { className: "play-container", children: _jsx("div", { className: "title-grid", children: _jsx("div", { className: "title-col", children: _jsx("h1", { className: "play-title", children: _jsx(SplitText, { text: "Made with nothing but curiosity. Browse, enjoy, and see where creativity runs free.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, rootMargin: "-100px", textAlign: "left", groupPhrase: { tokens: ["curiosity"], className: "gradient-group" } }) }) }) }) }), _jsx("section", { className: "play-container gallery-container", "aria-label": "Image gallery", children: _jsx("div", { className: "gallery", children: GALLERY_MAIN.map(({ src, alt }, i) => {
                                const isFirstRow = i < colsMain;
                                const perRowIndex = i % colsMain;
                                const delay = perRowIndex * STAGGER_COL;
                                const rootMarginBottomPct = isFirstRow
                                    ? undefined
                                    : VERY_LATE.has(i)
                                        ? 6
                                        : LATE.has(i)
                                            ? 10
                                            : 16;
                                return (_jsx("div", { className: "tile", children: _jsx(AnimatedContent, { ...imgAnim, startOnMount: isFirstRow, rootMarginBottomPct: rootMarginBottomPct, delay: delay, children: _jsx("img", { className: "tile-media", src: src, alt: alt, loading: "lazy" }) }) }, i));
                            }) }) }), _jsx("section", { className: "play-container gallery-wide", "aria-label": "Wide image gallery", children: GALLERY_WIDE.map(({ src, alt }, i) => (_jsx("div", { className: "tile-wide", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: (i % 2) * STAGGER_COL, children: _jsx("img", { className: "tile-media-wide", src: src, alt: alt, loading: "lazy" }) }) }, i))) }), _jsx("section", { className: "play-container gallery-square", "aria-label": "Square image gallery", children: GALLERY_SQUARE.map(({ src, alt }, i) => (_jsx("div", { className: "tile-square", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: i * 0.18, children: _jsx("img", { className: "tile-media-square", src: src, alt: alt, loading: "lazy" }) }) }, i))) }), _jsxs("section", { className: "play-container gallery-mix", "aria-label": "Mixed image row", children: [_jsx("div", { className: "mix-empty" }), _jsx("div", { className: "tile-mix mix-horizontal", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, children: _jsx("img", { src: GALLERY_MIX.horizontal.src, alt: GALLERY_MIX.horizontal.alt, loading: "lazy" }) }) }), _jsx("div", { className: "tile-mix mix-vertical", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: STAGGER_COL, children: _jsx("img", { src: GALLERY_MIX.vertical.src, alt: GALLERY_MIX.vertical.alt, loading: "lazy" }) }) })] }), _jsxs("section", { className: "play-container gallery-verticals", "aria-label": "Vertical image gallery", children: [GALLERY_VERTICALS.map(({ src, alt }, i) => (_jsx("div", { className: "tile-vertical", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: i * 0.18, children: _jsx("img", { className: "tile-media-vertical", src: src, alt: alt, loading: "lazy" }) }) }, i))), _jsx("div", { className: "tile-vertical mix-vertical", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: 3 * 0.18, children: _jsx("img", { className: "tile-media-vertical", src: GALLERY_MIX.vertical.src, alt: GALLERY_MIX.vertical.alt, loading: "lazy" }) }) })] }), _jsxs("section", { className: "play-container gallery-sq-wide", "aria-label": "Square + Horizontal row", children: [_jsx("div", { className: "tile-sqw sqw-square", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, children: _jsx("img", { className: "tile-media-sqw-square", src: GALLERY_SQ_WIDE.square.src, alt: GALLERY_SQ_WIDE.square.alt, loading: "lazy" }) }) }), _jsx("div", { className: "sqw-empty" }), _jsx("div", { className: "tile-sqw sqw-horizontal", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: STAGGER_COL, children: _jsx("img", { className: "tile-media-sqw-horizontal", src: GALLERY_SQ_WIDE.horizontal.src, alt: GALLERY_SQ_WIDE.horizontal.alt, loading: "lazy" }) }) })] }), _jsx("section", { className: "play-container gallery-wide-2", "aria-label": "Extra wide image gallery", children: GALLERY_WIDE_2.map(({ src, alt }, i) => (_jsx("div", { className: "tile-wide-2", children: _jsx(AnimatedContent, { ...imgAnim, rootMarginBottomPct: 14, delay: i * 0.22, children: _jsx("img", { className: "tile-media-wide-2", src: src, alt: alt, loading: "lazy" }) }) }, i))) })] }), _jsx(Footer, {})] }));
};
export default Play;
