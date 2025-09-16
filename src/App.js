import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
// Home page pieces (local components)
import Navigation from "./components/common/Navigation";
import Hero from "./components/sections/Hero";
import ProjectCard from "./components/sections/ProjectCard";
import Footer from "./components/common/Footer";
// Standalone pages
import Play from "./pages/Play";
import Me from "./pages/Me";
import HalloBuur from "./pages/HalloBuur";
import HalloBuur2 from "./pages/HalloBuur2";
import Nieuwsbegrip from "./pages/Nieuwsbegrip";
import PECZwolle from "./pages/PECZwolle";
// Scroll restore
import ScrollToTop from "./components/common/ScrollToTop";
/* ---- sample project data for Home ---- */
const projects = [
    {
        title: "Community building through a digital bulletin board.",
        meta: "Hallo Buur, 2025",
        link: "/hallo-buur",
        media: {
            webm: "/videos/hallo-buur.webm",
            mp4: "/videos/hallo-buur.mp4",
            poster: "/images/hallo-buur-cover.jpg",
            alt: "Hallo Buur app interface with central logo and two example posts: one about organizing a board game afternoon and another about asking neighbors for pasta ingredients.",
        },
        isVideo: true,
    },
    {
        title: "A fresh take on the news-based reading comprehension method.",
        meta: "Nieuwsbegrip, 2024",
        link: "/nieuwsbegrip",
        media: { src: "/images/nieuwsbegrip-cover.jpg", alt: "Illustration of a laptop displaying the Nieuwsbegrip dashboard interface, showing quick access tiles and workflows on a clean, modern layout." },
        isVideo: false,
    },
    {
        title: "Bringing an Eredivisie club's matches and campaigns to life.",
        meta: "PEC Zwolle, 2023 - 2024",
        link: "/pec-zwolle",
        media: { src: "/images/peczwolle-cover.jpg", alt: "Bus stop advertisement for PEC Zwolle showing a supporter with his arm around a child in a PEC Zwolle shirt, both looking into a glowing box filled with season memories and fan moments." },
        isVideo: false,
    },
    {
        title: "Researching social connection in a shifting residential community.",
        meta: "Hallo Buur, 2025",
        link: "/hallo-buur-2",
        media: { src: "/images/hallo-buur2-cover.jpg", alt: "Poster on a hallway wall titled ‘De Aubade Waardeplaat’ with colorful icons and text bubbles showing community values such as activities, social contact, amenities, celebrations, and the surrounding environment." },
        isVideo: false,
    },
];
function emitSection(section) {
    window.__section = section;
    window.dispatchEvent(new CustomEvent("sectionchange", { detail: { section } }));
}
/* ------------ utilities ------------ */
function getNavHeight() {
    const el = document.querySelector(".navbar");
    return el?.offsetHeight ?? 0;
}
function scrollToY(y, behavior = "smooth") {
    window.scrollTo({ top: y, behavior });
}
/* Keep a CSS variable in sync so we can use scroll-margin-top in pure CSS */
function updateNavHeightVar() {
    const h = getNavHeight() || 80;
    document.documentElement.style.setProperty("--nav-height", `${h}px`);
}
/* ------------ Home page ------------ */
const Home = () => {
    const location = useLocation();
    const workRef = useRef(null);
    const lastSectionRef = useRef("home");
    const computeWorkTop = () => {
        const el = workRef.current || document.getElementById("work");
        if (!el)
            return 0;
        const rectTop = el.getBoundingClientRect().top + window.scrollY;
        return Math.max(rectTop - getNavHeight(), 0);
    };
    /* keep --nav-height in sync */
    useEffect(() => {
        updateNavHeightVar();
        const onResize = () => updateNavHeightVar();
        window.addEventListener("resize", onResize);
        // run once after first paint too
        requestAnimationFrame(updateNavHeightVar);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    /* initial hash/state handling and section emit */
    useEffect(() => {
        if (location.pathname !== "/")
            return;
        const locState = (location.state ?? null);
        const wantsWork = location.hash === "#work" || locState?.scrollTo === "work";
        const wantsTop = locState?.scrollToTop === true;
        if (wantsTop) {
            scrollToY(0, "smooth");
            lastSectionRef.current = "home";
            emitSection("home");
            if (location.hash) {
                const urlNoHash = window.location.pathname + window.location.search;
                window.history.replaceState({}, "", urlNoHash);
            }
            return;
        }
        if (!wantsWork) {
            lastSectionRef.current = "home";
            emitSection("home");
            let tries = 0;
            const maxTries = 24;
            const settle = () => {
                tries += 1;
                const y = computeWorkTop();
                if (y > 0) {
                    const inWork = window.scrollY >= y - 1;
                    const next = inWork ? "work" : "home";
                    if (next !== lastSectionRef.current) {
                        lastSectionRef.current = next;
                        emitSection(next);
                    }
                    return;
                }
                if (tries < maxTries)
                    requestAnimationFrame(settle);
            };
            requestAnimationFrame(settle);
            return;
        }
        let tries = 0;
        const maxTries = 24;
        const tick = () => {
            tries += 1;
            const y = computeWorkTop();
            if (y > 0 || tries >= maxTries) {
                scrollToY(y, "smooth");
                lastSectionRef.current = "work";
                emitSection("work");
                if (location.hash === "#work") {
                    const urlNoHash = window.location.pathname + window.location.search;
                    window.history.replaceState({}, "", urlNoHash);
                }
            }
            else {
                requestAnimationFrame(tick);
            }
        };
        requestAnimationFrame(tick);
    }, [location.pathname, location.hash, location.state]);
    /* emit section on scroll/resize */
    useEffect(() => {
        if (location.pathname !== "/")
            return;
        let raf = 0;
        const onScroll = () => {
            if (raf)
                return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const y = computeWorkTop();
                if (y <= 0) {
                    if (lastSectionRef.current !== "home") {
                        lastSectionRef.current = "home";
                        emitSection("home");
                    }
                    return;
                }
                const inWork = window.scrollY >= y - 1;
                const next = inWork ? "work" : "home";
                if (next !== lastSectionRef.current) {
                    lastSectionRef.current = next;
                    emitSection(next);
                }
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf)
                cancelAnimationFrame(raf);
        };
    }, [location.pathname]);
    const cards = useMemo(() => projects.map((p, i) => {
        const imageMedia = p.isVideo
            ? { src: p.media.poster, alt: p.media.alt }
            : p.media;
        return (_jsx(ProjectCard, { title: p.title, meta: p.meta, link: p.link, media: imageMedia, isVideo: p.isVideo }, i));
    }), []);
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx(Hero, {}), _jsx("div", { id: "work", ref: workRef, className: "work-anchor" }), cards, _jsx(Footer, {})] }));
};
/* ------------ Router ------------ */
const App = () => {
    return (_jsxs(BrowserRouter, { children: [_jsx(ScrollToTop, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/play", element: _jsx(Play, {}) }), _jsx(Route, { path: "/me", element: _jsx(Me, {}) }), _jsx(Route, { path: "/hallo-buur", element: _jsx(HalloBuur, {}) }), _jsx(Route, { path: "/hallo-buur-2", element: _jsx(HalloBuur2, {}) }), _jsx(Route, { path: "/nieuwsbegrip", element: _jsx(Nieuwsbegrip, {}) }), _jsx(Route, { path: "/pec-zwolle", element: _jsx(PECZwolle, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }));
};
export default App;
