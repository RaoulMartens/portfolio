import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
/* =========================================================
   LottieBox v5 — unified .json/.lottie player
   ========================================================= */
let dotlottieReadyPromise = null;
function ensureDotLottieDefined() {
    if (typeof window === "undefined")
        return Promise.resolve();
    if (customElements.get("dotlottie-player"))
        return Promise.resolve();
    if (!dotlottieReadyPromise) {
        dotlottieReadyPromise = new Promise((resolve) => {
            const s = document.createElement("script");
            s.type = "module";
            s.src =
                "https://unpkg.com/@dotlottie/player-component/dist/dotlottie-player.mjs";
            s.onload = () => customElements.whenDefined("dotlottie-player").then(() => resolve());
            s.onerror = () => resolve();
            document.head.appendChild(s);
        });
    }
    return dotlottieReadyPromise;
}
const jsonWarmCache = new Set();
let lottieModule = null;
const runIdle = (fn) => {
    // @ts-ignore
    if (typeof requestIdleCallback === "function")
        requestIdleCallback(fn, { timeout: 1200 });
    else
        setTimeout(fn, 120);
};
const deviceMemory = (() => {
    const dm = navigator.deviceMemory;
    return typeof dm === "number" ? dm : 8;
})();
const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const LottieBox = ({ src, loop = true, className = "", poster }) => {
    const isDot = /\.lottie(\?|#|$)/i.test(src);
    const holderRef = useRef(null);
    const instRef = useRef(null);
    const createdOnceRef = useRef(false);
    const [preloaded, setPreloaded] = useState(false);
    const [readyToShow, setReadyToShow] = useState(prefersReducedMotion);
    const renderer = useMemo(() => {
        if (typeof window === "undefined")
            return "svg";
        const smallScreen = window.matchMedia("(max-width: 1024px)").matches;
        const lowMem = deviceMemory < 6;
        return smallScreen || lowMem ? "canvas" : "svg";
    }, []);
    useEffect(() => {
        const el = holderRef.current;
        if (!el)
            return;
        let mounted = true;
        let warmObs = null;
        let createObs = null;
        let playObs = null;
        if (prefersReducedMotion) {
            setPreloaded(true);
            return () => { };
        }
        const warm = async () => {
            try {
                if (!jsonWarmCache.has(src)) {
                    await fetch(src, { cache: "force-cache" }).catch(() => { });
                    jsonWarmCache.add(src);
                }
                if (isDot) {
                    await ensureDotLottieDefined();
                }
                else if (!lottieModule) {
                    const mod = await import("lottie-web/build/player/lottie_light");
                    lottieModule = mod.default ?? mod;
                    if (deviceMemory <= 2)
                        lottieModule.setQuality("low");
                    else if (deviceMemory <= 4)
                        lottieModule.setQuality("medium");
                    else
                        lottieModule.setQuality("high");
                }
                if (mounted)
                    setPreloaded(true);
            }
            catch { }
        };
        warmObs = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                warmObs?.disconnect();
                runIdle(warm);
            }
        }, { root: null, rootMargin: "1200px 0px", threshold: 0 });
        warmObs.observe(el);
        createObs = new IntersectionObserver(async (entries) => {
            const entry = entries.find((e) => e.isIntersecting);
            if (!entry || !holderRef.current)
                return;
            if (createdOnceRef.current) {
                createObs?.disconnect();
                return;
            }
            createdOnceRef.current = true;
            createObs?.disconnect();
            if (isDot) {
                await ensureDotLottieDefined();
                if (!mounted || !holderRef.current)
                    return;
                const player = document.createElement("dotlottie-player");
                player.setAttribute("src", src);
                player.setAttribute("loop", loop ? "true" : "false");
                player.setAttribute("autoplay", "false");
                player.setAttribute("background", "transparent");
                player.setAttribute("renderer", renderer);
                player.className = "hb-lottie-el";
                holderRef.current.appendChild(player);
                const onReady = () => {
                    setReadyToShow(true);
                    player.removeEventListener?.("ready", onReady);
                };
                player.addEventListener?.("ready", onReady);
                instRef.current = player;
            }
            else {
                if (!lottieModule) {
                    const mod = await import("lottie-web/build/player/lottie_light");
                    lottieModule = mod.default ?? mod;
                    if (deviceMemory <= 2)
                        lottieModule.setQuality("low");
                    else if (deviceMemory <= 4)
                        lottieModule.setQuality("medium");
                    else
                        lottieModule.setQuality("high");
                }
                if (!mounted || !holderRef.current)
                    return;
                if (instRef.current) {
                    instRef.current.destroy?.();
                    instRef.current = null;
                }
                instRef.current = lottieModule.loadAnimation({
                    container: holderRef.current,
                    renderer,
                    loop,
                    autoplay: false,
                    path: src,
                    rendererSettings: {
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        preserveAspectRatio: "xMidYMid meet",
                        clearCanvas: true,
                    },
                });
                const onDomLoaded = () => {
                    setReadyToShow(true);
                    instRef.current?.removeEventListener?.("DOMLoaded", onDomLoaded);
                };
                instRef.current?.addEventListener?.("DOMLoaded", onDomLoaded);
            }
            playObs = new IntersectionObserver((es) => {
                const me = es.find((e) => e.target === holderRef.current);
                if (!me || !instRef.current)
                    return;
                const vh = me.rootBounds?.height ?? window.innerHeight;
                const fullyInView = me.intersectionRatio >= 0.999 &&
                    me.boundingClientRect.top >= 0 &&
                    me.boundingClientRect.bottom <= vh;
                if (fullyInView) {
                    if (isDot)
                        instRef.current.play?.();
                    else if (instRef.current.isPaused)
                        instRef.current.play();
                }
                else {
                    if (isDot)
                        instRef.current.pause?.();
                    else if (!instRef.current.isPaused)
                        instRef.current.pause();
                }
            }, { root: null, rootMargin: "0px", threshold: [0, 0.2, 0.5, 0.95, 0.99, 1] });
            if (holderRef.current)
                playObs.observe(holderRef.current);
        }, { root: null, rootMargin: "400px 0px", threshold: [0] });
        createObs.observe(el);
        return () => {
            warmObs?.disconnect();
            createObs?.disconnect();
            playObs?.disconnect();
            if (instRef.current) {
                if (isDot) {
                    try {
                        holderRef.current?.removeChild?.(instRef.current);
                    }
                    catch { }
                }
                else {
                    instRef.current.destroy?.();
                }
                instRef.current = null;
            }
        };
    }, [src, renderer, loop]);
    return (_jsx("div", { ref: holderRef, className: `hb-lottie-holder ${readyToShow ? "is-ready" : ""} ${prefersReducedMotion ? "is-rm" : ""} ${className}`, "aria-busy": !preloaded && !prefersReducedMotion, children: poster && (!readyToShow || prefersReducedMotion) && (_jsx("img", { src: poster, alt: "", className: "hb-poster", decoding: "async", loading: "lazy", fetchPriority: "low" })) }));
};
/* ------------ Left→Right grow divider ------------ */
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
                        el.style.setProperty("--hb-rule-delay", `${Math.max(0, delayMs)}ms`);
                    requestAnimationFrame(() => el.classList.add("is-in"));
                    obs.disconnect();
                    break;
                }
            }
        }, { root: null, rootMargin: "0px 0px -25% 0px", threshold: [0, 0.25, 0.6, 0.9, 1] });
        obs.observe(el);
        return () => obs.disconnect();
    }, [delayMs]);
    return _jsx("div", { ref: ref, className: "hb-rule hb-rule-anim", role: "separator", "aria-hidden": "true" });
};
const HalloBuur = () => {
    /* --- unified animations (match Nieuwsbegrip / PECZwolle / HalloBuur2) --- */
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
    return (_jsxs("div", { className: "viewport-wrapper", children: [_jsx(Navigation, {}), _jsx("main", { className: "hb-main", "aria-label": "Hallo Buur case study", children: _jsxs("section", { className: "hb-container", children: [_jsx("div", { className: "hb-grid cv-auto", children: _jsxs("div", { className: "hb-content", children: [_jsx("h5", { className: "hb-title", children: _jsx(SplitText, { text: "Hallo Buur", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left" }) }), _jsx("p", { className: "hb-subtitle", children: _jsx(SplitText, { text: "Community building through a digital bulletin board.", splitType: "words", delay: 60, duration: 0.7, ease: "power3.out", from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, threshold: 0.1, textAlign: "left", startDelay: 0.15 }) }), _jsx("div", { className: "hb-hero", children: _jsx(AnimatedContent, { ...heroImgAnim, children: _jsx("img", { src: "/images/hallo-buur/preview.jpg", alt: "Hallo Buur \u2014 hero", decoding: "async", loading: "eager", fetchPriority: "high", className: "hb-hero-img" }) }) })] }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Introduction" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "In a residential complex where the elderly used to make up the majority, the population is now shifting. Young people and newcomers are moving in. This transition has led to a social disconnect. Older residents often feel ignored, while newer ones feel unwelcome. These assumptions feed into a spiral of misunderstanding, preventing natural contact." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-media", children: _jsx("div", { className: "hb-followup", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("img", { src: "/images/hallo-buur/problem.jpg", alt: "Hallo Buur \u2014 follow up visual", decoding: "async", loading: "lazy", fetchPriority: "low", className: "hb-followup-img" }) }) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Problem" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "While both groups express a need for contact, neither feels comfortable taking the first step. The building lacks a low threshold system to spark interactions or create visibility around shared interests." }) }) })] }) }), _jsx("div", { className: "hb-grid", children: _jsx("div", { className: "hb-divider", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Research" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "Getting residents to open up about their social struggles wasn\u2019t easy. In the early phase of the project, I conducted a cultural probe study and a co-creation session to uncover the underlying reasons behind the lack of social interaction in the building." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-auto", children: _jsx("div", { className: "hb-cards", children: [
                                    {
                                        title: "Conversation anxiety",
                                        body: "Residents often avoid initiating contact out of fear of being judged or rejected. This makes casual conversations feel risky instead of natural.",
                                        iconClass: "mask-ghost",
                                    },
                                    {
                                        title: "Silent assumptions",
                                        body: "Older residents assume newcomers aren’t interested in them, while newer residents feel like outsiders. These silent assumptions fuel a cycle of avoidance.",
                                        iconClass: "mask-barrier",
                                    },
                                    {
                                        title: "Dormant spaces",
                                        body: "Although there are shared areas, interactions rarely happen spontaneously. Without a clear invitation or reason to connect, most residents stick to their routines.",
                                        iconClass: "mask-suitcase",
                                    },
                                ].map((c, i) => (_jsx(AnimatedContent, { ...textReveal, delay: i * 0.06, children: _jsxs("div", { className: "hb-card", children: [_jsx("div", { className: `hb-card-icon ${c.iconClass}` }), _jsx("h5", { children: c.title }), _jsx("p", { children: c.body })] }) }, i))) }) }), _jsx("div", { className: "hb-grid", children: _jsx("div", { className: "hb-divider-2", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Solution" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "The Digital Bulletin Board lowers the threshold for initiating contact between residents. It provides a simple and approachable way to express needs, share activities, and offer help\u2014making the first step toward connection easier. While the interaction starts digitally, the goal is to encourage real-life encounters and build a stronger sense of community within the complex." }) }) })] }) }), _jsx("div", { className: "hb-grid", children: _jsx("div", { className: "hb-divider-3", children: _jsx(RuleGrow, {}) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Create an Account" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "Residents can quickly set up a profile by entering their name, house number, and language preference. This simple onboarding step ensures that each post or response comes from a real person in the building, building trust without oversharing." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-media", children: _jsx("div", { className: "hb-lottie", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("div", { className: "hb-lottie-wrap", "aria-label": "Create an account animation", children: _jsx(LottieBox, { src: "/videos/hallo-buur/create-an-account.lottie", poster: "/images/hallo-buur/posters/create-an-account.jpg" }) }) }) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Post an Activity" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "Residents can add events, questions, or small favours in the form of digital post-its. These are instantly placed on the shared board, making it easy for others to see and engage." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-media", children: _jsx("div", { className: "hb-lottie hb-lottie-2", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("div", { className: "hb-lottie-wrap", "aria-label": "Post a note animation", children: _jsx(LottieBox, { src: "/videos/hallo-buur/post-an-activity.lottie", poster: "/images/hallo-buur/posters/post-an-activity.jpg" }) }) }) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Responding to a Request" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "The sort button helps residents quickly find something that suits them. By separating questions from activities, the board becomes easier to navigate and respond to. When someone replies to a request, the original poster receives a notification\u2014making real-life contact possible." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-media", children: _jsx("div", { className: "hb-lottie hb-lottie-3", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("div", { className: "hb-lottie-wrap", "aria-label": "Join an activity animation", children: _jsx(LottieBox, { src: "/videos/hallo-buur/responding-to-a-request.lottie", poster: "/images/hallo-buur/posters/responding-to-a-request.jpg" }) }) }) }) }), _jsx("div", { className: "hb-block cv-auto", children: _jsxs("div", { className: "hb-block-grid", children: [_jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Manage Profile Settings" }) }) }), _jsx("div", { className: "hb-block-text", children: _jsx(AnimatedContent, { ...textReveal, delay: STAGGER, children: _jsx("p", { children: "In a community where people come from different backgrounds, it's important that residents feel in control of how they present themselves. The settings allow them to adjust their avatar, language, and more accessibility features, helping them feel safe, respected, and more confident when taking the first step toward connection." }) }) })] }) }), _jsx("div", { className: "hb-grid cv-media", children: _jsx("div", { className: "hb-lottie hb-lottie-4", children: _jsx(AnimatedContent, { ...imageReveal, children: _jsx("div", { className: "hb-lottie-wrap", "aria-label": "Ongoing connection animation", children: _jsx(LottieBox, { src: "/videos/hallo-buur/manage-profile-settings.lottie", poster: "/images/hallo-buur/posters/manage-profile-settings.jpg" }) }) }) }) }), _jsx("div", { className: "hb-block hb-title-only", children: _jsx("div", { className: "hb-block-grid", children: _jsx("div", { className: "hb-block-title", children: _jsx(AnimatedContent, { ...textReveal, children: _jsx("h5", { children: "Learnings" }) }) }) }) }), _jsx("div", { className: "hb-grid", children: _jsx("div", { className: "hb-cards-2", "aria-label": "Learnings", children: [
                                    { title: "Assumption barriers", body: "Co-creation helped uncover hidden beliefs between residents.", iconClass: "mask-hidden" },
                                    { title: "Contact, not connection", body: "Real interaction happens offline, the app just opens the door.", iconClass: "mask-door" },
                                    { title: "Small barriers matter", body: "Even tiny obstacles can prevent people from connecting. Simplicity makes a difference.", iconClass: "mask-barrier" },
                                    { title: "Accessibility is key", body: "Simple flows and a Help Centre made the app usable for everyone.", iconClass: "mask-access" },
                                    { title: "People want control", body: "Balancing visibility and privacy builds trust.", iconClass: "mask-joystick" },
                                ].map((c, i) => (_jsx(AnimatedContent, { ...textReveal, delay: i * 0.06, children: _jsxs("div", { className: "hb-card", children: [_jsx("div", { className: `hb-card-icon ${c.iconClass}` }), _jsx("h5", { children: c.title }), _jsx("p", { children: c.body })] }) }, i))) }) })] }) }), _jsx(Footer, {})] }));
};
export default HalloBuur;
