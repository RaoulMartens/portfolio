import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, animate, useMotionValue, } from 'framer-motion';
import { useSpring as useSpringRS, animated, to } from '@react-spring/web';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 10, wrapperClassName = '', innerClassName = '', ...props }) => {
    const magnetRef = useRef(null);
    const [{ x, y }, api] = useSpringRS(() => ({
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
    return (_jsx("div", { ref: magnetRef, className: `magnet ${wrapperClassName}`, ...props, children: _jsx(animated.div, { className: innerClassName, style: {
                transform: to([x, y], (xv, yv) => `translate3d(${xv}px, ${yv}px, 0)`),
                willChange: 'transform',
            }, children: children }) }));
};
/* ---------- Animation helpers ---------- */
const springTransition = { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 };
const panelEnterVariants = {
    expandingRight: { opacity: 1, scaleX: 1, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeOut' } },
    expandingDown: { opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeOut' } },
    open: { opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left',
        transition: { duration: 0.1, when: 'beforeChildren', staggerChildren: 0.15, delayChildren: 0.2 } },
};
const panelExitVariants = {
    itemsOut: { opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left',
        transition: { when: 'afterChildren', staggerChildren: 0.1, staggerDirection: -1 } },
    collapsingUp: { opacity: 1, scaleX: 1, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeIn' } },
    collapsingLeft: { opacity: 0, scaleX: 0, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeIn' } },
};
const itemVariants = {
    collapsed: { opacity: 0, x: -20, transition: { x: springTransition, opacity: { duration: 0.2 } } },
    open: (i = 0) => ({ opacity: 1, x: 0, transition: { x: springTransition, opacity: { duration: 0.2 }, delay: 0.06 * i } }),
    exit: (i = 0) => ({ opacity: 0, x: -20, transition: { x: springTransition, opacity: { duration: 0.15 }, delay: 0.02 * i } }),
};
const mobileBgVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 460, damping: 42, mass: 0.9 } },
    exit: { x: '-100%', transition: { duration: 0.25, ease: 'easeIn' } },
};
const mobilePanelVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 420, damping: 38, mass: 0.8, delay: 0.02 } },
    exit: { x: '-100%', transition: { duration: 0.25, ease: 'easeIn' } },
};
/* ---------- Theme refs ---------- */
const MENU_BG = 'var(--surface-action, #0080FF)';
const MENU_TEXT = 'var(--text-on-action, #FFF)';
/* ---------- Hook: mobile breakpoint ---------- */
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile('matches' in e ? e.matches : e.matches);
        handler(mql);
        mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
        return () => mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler);
    }, [breakpoint]);
    return isMobile;
}
/* =================================================================
   Navigation
=================================================================== */
const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [enterStage, setEnterStage] = useState('expandingRight');
    const [exitStage, setExitStage] = useState('itemsOut');
    const [isExiting, setIsExiting] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [bgReady, setBgReady] = useState(false);
    const bgDelayRef = useRef(null);
    const [isClosingIcon, setIsClosingIcon] = useState(false);
    const { isDark, toggleDarkMode } = useDarkMode();
    const isMobile = useIsMobile(768);
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutsRef = useRef([]);
    const isHoveringRef = useRef(false);
    const clearAllTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(t => clearTimeout(t));
        timeoutsRef.current = [];
    }, []);
    const addTimeout = useCallback((fn, delay) => {
        const id = window.setTimeout(() => {
            timeoutsRef.current = timeoutsRef.current.filter(t => t !== id);
            fn();
        }, delay);
        timeoutsRef.current.push(id);
    }, []);
    const clearBgDelay = useCallback(() => {
        if (bgDelayRef.current) {
            clearTimeout(bgDelayRef.current);
            bgDelayRef.current = null;
        }
    }, []);
    /* Listen for section changes from Home */
    const [section, setSection] = useState(() => window.__section ?? "home");
    useEffect(() => {
        const handler = (e) => {
            const detail = e.detail;
            if (detail?.section)
                setSection(detail.section);
        };
        window.addEventListener("sectionchange", handler);
        setSection(window.__section ?? "home");
        return () => window.removeEventListener("sectionchange", handler);
    }, []);
    /* Route-aware label/active states */
    const { pathname } = location;
    const onHome = pathname === "/";
    const onPlay = pathname === "/play";
    const onMe = pathname === "/me";
    const onHallo = pathname === "/hallo-buur";
    const onHallo2 = pathname === "/hallo-buur-2";
    const onNieuws = pathname === "/nieuwsbegrip";
    const onPEC = pathname === "/pec-zwolle";
    /* Forced mobile on project pages */
    const forceMobile = onHallo || onHallo2 || onNieuws || onPEC;
    const mobileMode = isMobile || forceMobile;
    const backMode = forceMobile;
    const menuButtonLabel = onPlay ? "Play" :
        onMe ? "Me" :
            (onHallo || onHallo2 || onNieuws || onPEC) ? "Work" :
                onHome ? (section === "work" ? "Work" : "Home") :
                    "Home";
    const menuItems = [
        { href: '/', icon: '/images/home.svg', label: 'Home', active: onHome && section === 'home' },
        { href: '#work', icon: '/images/work.svg', label: 'Work', active: (onHome && section === 'work') || onHallo || onHallo2 || onNieuws || onPEC },
        { href: '/play', icon: '/images/playground.svg', label: 'Play', active: onPlay },
        { href: '/me', icon: '/images/emoji.svg', label: 'Me', active: onMe },
    ];
    const socialBaseIndex = menuItems.length;
    const socialLinks = [
        { href: 'https://www.behance.net/Raoulgraphics', icon: '/images/behance.svg', alt: 'Behance', label: 'Behance' },
        { href: 'https://www.instagram.com/raoulgraphics/', icon: '/images/instagram.svg', alt: 'Instagram', label: 'Instagram' },
        { href: 'https://www.youtube.com/@RaoulGraphics', icon: '/images/youtube.svg', alt: 'YouTube', label: 'YouTube' },
        { href: 'https://www.tiktok.com/@raoulgraphics', icon: '/images/tiktok.svg', alt: 'TikTok', label: 'TikTok' },
    ];
    const handleBack = () => {
        if (window.history.length > 1)
            navigate(-1);
        else
            navigate('/', { replace: true });
    };
    const closeMobileMenu = () => {
        setIsClosingIcon(true);
        addTimeout(() => {
            setIsMenuOpen(false);
            setBgReady(false);
            setIsClosingIcon(false);
        }, 280);
    };
    const smoothScrollToId = (id) => {
        const target = document.getElementById(id);
        const navH = document.querySelector('.navbar')?.offsetHeight ?? 0;
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };
    const scrollTopSmooth = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const onMenuItemClick = (item, e) => {
        if (item.label === 'Work') {
            e?.preventDefault();
            if (!onHome) {
                navigate('/', { state: { scrollTo: 'work' } });
            }
            else {
                smoothScrollToId('work');
                setSection('work');
            }
            if (mobileMode)
                closeMobileMenu();
            return;
        }
        if (item.label === 'Home') {
            e?.preventDefault();
            if (onHome) {
                scrollTopSmooth();
                setSection('home');
            }
            else
                navigate('/', { state: { scrollToTop: true } });
            if (mobileMode)
                closeMobileMenu();
            return;
        }
        if (item.label === 'Play') {
            e?.preventDefault();
            if (onPlay)
                scrollTopSmooth();
            else
                navigate('/play', { state: { scrollToTop: true } });
            if (mobileMode)
                closeMobileMenu();
            return;
        }
        if (item.label === 'Me') {
            e?.preventDefault();
            if (onMe)
                scrollTopSmooth();
            else
                navigate('/me', { state: { scrollToTop: true } });
            if (mobileMode)
                closeMobileMenu();
            return;
        }
        if (item.href.startsWith('/')) {
            e?.preventDefault();
            navigate(item.href, { state: { scrollToTop: true } });
            if (mobileMode)
                closeMobileMenu();
            return;
        }
        if (item.href.startsWith('#') && !onHome) {
            e?.preventDefault();
            navigate('/', { state: { scrollToTop: true } });
        }
    };
    /* Desktop hover open/close */
    const handleMenuEnter = useCallback(() => {
        if (mobileMode)
            return;
        if (isMenuOpen && enterStage === 'open')
            return;
        isHoveringRef.current = true;
        clearAllTimeouts();
        setIsExiting(false);
        setIsMenuOpen(true);
        setEnterStage('expandingRight');
        addTimeout(() => isHoveringRef.current && setEnterStage('expandingDown'), 200);
        addTimeout(() => isHoveringRef.current && setEnterStage('open'), 400);
    }, [mobileMode, isMenuOpen, enterStage, addTimeout, clearAllTimeouts]);
    const handleMenuLeave = useCallback(() => {
        if (mobileMode || !isMenuOpen)
            return;
        isHoveringRef.current = false;
        clearAllTimeouts();
        setIsExiting(true);
        addTimeout(() => !isHoveringRef.current && setExitStage('collapsingUp'), 300);
        addTimeout(() => !isHoveringRef.current && setExitStage('collapsingLeft'), 500);
        addTimeout(() => {
            if (!isHoveringRef.current) {
                setIsMenuOpen(false);
                setIsExiting(false);
                setEnterStage('expandingRight');
                setExitStage('itemsOut');
            }
        }, 700);
    }, [mobileMode, isMenuOpen, addTimeout, clearAllTimeouts]);
    /* Mobile click toggle */
    const toggleMenu = () => {
        if (!mobileMode)
            return;
        if (!isMenuOpen) {
            setIsMenuOpen(true);
            setBgReady(false);
            setIsClosingIcon(false);
            clearBgDelay();
        }
        else {
            setIsClosingIcon(true);
            addTimeout(() => {
                setIsMenuOpen(false);
                setBgReady(false);
                setIsClosingIcon(false);
                clearBgDelay();
            }, 280);
        }
    };
    const onMenuButtonClick = () => (backMode ? handleBack() : toggleMenu());
    /* Scroll nudge */
    useEffect(() => {
        let ticking = false;
        const SHOW_AT = 8, HIDE_BELOW = 4;
        const onScroll = () => {
            if (ticking)
                return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.pageYOffset || document.documentElement.scrollTop || 0;
                setIsScrolled(prev => (prev ? y > HIDE_BELOW : y > SHOW_AT));
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const [shiftPx, setShiftPx] = useState(16);
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const compute = () => {
            const px = parseFloat(getComputedStyle(document.documentElement).fontSize);
            setShiftPx(Number.isFinite(px) ? px : 16);
        };
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);
    const dist = useSpring(0, { stiffness: 320, damping: 32, mass: 0.6 });
    useEffect(() => { dist.set(isScrolled ? shiftPx : 0); }, [isScrolled, shiftPx, dist]);
    const menuX = dist;
    const menuY = dist;
    const toggleX = useTransform(dist, v => -v);
    const toggleY = dist;
    /* Logo parallax */
    const { scrollY } = useScroll();
    const logoYRaw = useTransform(scrollY, [0, 160], [0, -80]);
    const logoScaleRaw = useTransform(scrollY, [0, 120], [1, 0.97]);
    const logoY = useSpring(logoYRaw, { stiffness: 140, damping: 22, mass: 0.4 });
    const logoScale = useSpring(logoScaleRaw, { stiffness: 140, damping: 22, mass: 0.4 });
    const logoSrc = isDark ? '/images/logo-dark.svg' : '/images/logo.svg';
    const hoverDotSrcDesktop = isDark ? '/images/hover-dot-dark.svg' : '/images/hover-dot.svg';
    const activeDotSrc = isDark ? '/images/active-dot-dark.svg' : '/images/active-dot.svg';
    const hoverDotSrcMobile = isDark ? '/images/hover-dot-dark.svg' : '/images/hover-dot.svg';
    /* Sizes */
    const MOBILE_WH = 40, TARGET_H = 40;
    const desktopClosedW = Math.round(7.5625 * 16);
    const desktopOpenW = Math.round(11.0625 * 16);
    // Shell width matches state; visual fills shell (prevents wrapper stretch)
    const menuShellW = (mobileMode ? MOBILE_WH : (isMenuOpen ? desktopOpenW : desktopClosedW));
    const menuShellH = TARGET_H;
    const menuVisualW = '100%';
    /* Toggle sizes */
    const SWITCH_MOBILE_WH = 40;
    const SWITCH_DESKTOP_W = Math.round(5.5 * 16); // 88px
    const SWITCH_DESKTOP_H = Math.round(2.5 * 16); // 40px
    const switchShellW = mobileMode ? SWITCH_MOBILE_WH : SWITCH_DESKTOP_W;
    const switchShellH = mobileMode ? SWITCH_MOBILE_WH : SWITCH_DESKTOP_H;
    const switchVisualW = switchShellW;
    /* Body lock on mobile menu */
    useEffect(() => {
        if (!(mobileMode && isMenuOpen))
            return;
        const { style } = document.documentElement;
        const prevOverflow = style.overflow;
        style.overflow = 'hidden';
        return () => { style.overflow = prevOverflow; };
    }, [mobileMode, isMenuOpen]);
    /* Reset on mode change */
    useEffect(() => {
        clearAllTimeouts();
        clearBgDelay();
        isHoveringRef.current = false;
        setIsMenuOpen(false);
        setIsExiting(false);
        setEnterStage('expandingRight');
        setExitStage('itemsOut');
        setHoveredItem(null);
        setBgReady(false);
        setIsClosingIcon(false);
    }, [mobileMode, clearAllTimeouts, clearBgDelay]);
    /* Cleanup */
    useEffect(() => () => { clearAllTimeouts(); clearBgDelay(); }, [clearAllTimeouts, clearBgDelay]);
    /* Toggle progress & icon flip */
    const progress = useMotionValue(isDark ? 1 : 0);
    useEffect(() => {
        animate(progress, isDark ? 1 : 0, { duration: 0.42, ease: [0.22, 1, 0.36, 1] });
    }, [isDark, progress]);
    const fillLeftPx = useTransform(progress, (p) => `${-2 + p * 44}px`);
    const rotateY = useTransform(progress, [0, 1], [180, 0]);
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: `navbar ${backMode ? 'is-project' : ''}`, children: _jsx("div", { className: "grid-container", children: _jsxs("div", { className: "navbar-grid", children: [_jsxs(motion.div, { className: "menu-anchor", style: { x: menuX, y: menuY }, onMouseEnter: !mobileMode ? handleMenuEnter : undefined, onMouseLeave: !mobileMode ? handleMenuLeave : undefined, children: [_jsx(motion.div, { role: "button", className: "menu-shell", "aria-label": backMode ? 'Go back' : 'Open menu', onClick: onMenuButtonClick, animate: { width: menuShellW, height: menuShellH }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, children: _jsxs(motion.div, { className: "menu-visual", animate: { width: menuVisualW }, initial: false, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }, children: [!mobileMode && _jsx(motion.span, { className: "menu-label", initial: false, children: menuButtonLabel }), _jsx("div", { className: `menu-icon-box ${mobileMode ? 'is-mobile' : ''}`, children: backMode ? (_jsx("img", { src: "/images/chevron-left.svg", alt: "", className: "menu-icon-img" })) : (_jsxs(_Fragment, { children: [_jsx(motion.img, { src: "/images/menu.svg", alt: "", className: "menu-icon-img", initial: false, animate: isMenuOpen ? { opacity: 0, rotate: 90, scale: 0 } : { opacity: 1, rotate: 0, scale: 1 }, transition: { duration: 0.25, ease: 'easeInOut', opacity: { duration: 0.15 } } }), _jsx(motion.img, { src: "/images/menu-open.svg", alt: "", className: "menu-icon-img", initial: false, animate: isMenuOpen ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: 90, scale: 0 }, transition: { duration: 0.25, ease: 'easeInOut', opacity: { duration: 0.15, delay: mobileMode && isMenuOpen && !isClosingIcon ? 0.1 : 0 } } })] })) })] }, `menu-visual-${mobileMode ? 'm' : 'd'}`) }), !mobileMode && !backMode && isMenuOpen && (_jsx(motion.div, { className: "menu-panel", variants: isExiting ? panelExitVariants : panelEnterVariants, animate: isExiting ? exitStage : enterStage, initial: "expandingRight", children: _jsx("nav", { children: _jsx("ul", { className: "menu-list", children: menuItems.map((item, index) => {
                                                    const showHoverDot = hoveredItem === item.label && !item.active;
                                                    return (_jsx(motion.li, { className: "menu-item", variants: itemVariants, animate: isExiting ? 'exit' : enterStage === 'open' ? 'open' : 'collapsed', custom: index, children: _jsxs("a", { href: item.href, className: "menu-link", onClick: (e) => onMenuItemClick(item, e), onMouseEnter: () => setHoveredItem(item.label), onMouseLeave: () => setHoveredItem(null), "aria-current": item.active ? 'page' : undefined, children: [_jsxs(motion.div, { className: "menu-dot-wrap", initial: false, animate: { width: item.active || showHoverDot ? 24 : 0, marginRight: item.active || showHoverDot ? '0.75rem' : 0 }, transition: springTransition, children: [_jsx(motion.img, { src: hoverDotSrcDesktop, alt: "", className: "menu-dot", initial: false, animate: { x: showHoverDot ? 0 : -24, opacity: showHoverDot ? 1 : 0 }, transition: springTransition }), _jsx(motion.img, { src: activeDotSrc, alt: "", className: "menu-dot", initial: false, animate: { x: 0, opacity: item.active ? 1 : 0 }, transition: springTransition })] }), _jsxs(motion.span, { className: "menu-text", initial: false, children: [_jsx("img", { src: item.icon, alt: "" }), " ", item.label] })] }) }, item.label));
                                                }) }) }) }))] }, `menu-anchor-${mobileMode ? 'm' : 'd'}`), _jsx(motion.a, { href: "/", className: "nav-logo", children: _jsx(motion.img, { src: logoSrc, alt: "Raoul Martens logo", style: { y: logoY, scale: logoScale, willChange: 'transform' }, initial: { opacity: 0.9 }, animate: { opacity: 1 }, transition: { duration: 0.2, ease: 'easeOut' } }, isDark ? 'logo-dark' : 'logo-light') }), _jsx(motion.div, { className: "toggle-anchor", style: { x: toggleX, y: toggleY, display: mobileMode && isMenuOpen ? 'none' : 'flex' }, children: _jsx(motion.div, { role: "button", "aria-label": "Toggle dark mode", className: `switch-shell ${mobileMode ? 'is-mobile' : ''}`, onClick: toggleDarkMode, animate: { width: switchShellW, height: switchShellH }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, children: _jsx(motion.div, { className: "switch-visual", animate: { width: switchVisualW }, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }, children: mobileMode ? (_jsx("div", { className: "switch-mobile-face", children: _jsx("div", { className: "switch-flip-24", children: _jsxs(motion.div, { initial: false, animate: { rotateY: isDark ? 0 : 180 }, transition: { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] }, className: "flip-3d", children: [_jsx("img", { src: "/images/moon.svg", alt: "", className: "flip-face front" }), _jsx("img", { src: "/images/sun.svg", alt: "", className: "flip-face back" })] }) }) })) : (_jsxs("div", { className: "switch-track", children: [_jsx(motion.div, { className: "switch-fill", style: { left: fillLeftPx }, children: _jsx("div", { className: "switch-fill-center", children: _jsxs(motion.div, { initial: false, className: "flip-3d", style: { rotateY }, transition: { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] }, children: [_jsx("img", { src: "/images/moon.svg", alt: "", className: "flip-face front" }), _jsx("img", { src: "/images/sun.svg", alt: "", className: "flip-face back" })] }) }) }), _jsx("span", { className: "option option-light" }), _jsx("span", { className: "option option-dark" })] })) }) }) })] }) }) }), mobileMode && !backMode &&
                createPortal(_jsx(AnimatePresence, { children: isMenuOpen && (_jsxs("div", { className: "mobile-menu-root", role: "dialog", "aria-modal": "true", children: [_jsx(motion.div, { className: "mobile-menu-bg", variants: mobileBgVariants, initial: "hidden", animate: "visible", exit: "exit", onAnimationComplete: (state) => {
                                    if (state === 'visible') {
                                        clearBgDelay();
                                        bgDelayRef.current = window.setTimeout(() => setBgReady(true), 120);
                                    }
                                } }, "mobile-bg"), _jsx(motion.button, { "aria-label": "Close menu", className: "mobile-close", onClick: () => { setIsClosingIcon(true); addTimeout(() => { setIsMenuOpen(false); setBgReady(false); setIsClosingIcon(false); }, 280); }, children: _jsxs(motion.div, { className: "mobile-close-anim", style: { x: menuX, y: menuY }, children: [_jsx(motion.img, { src: "/images/menu.svg", alt: "", className: "mobile-close-img", initial: { opacity: 1, rotate: 0, scale: 1 }, animate: { opacity: isClosingIcon ? 1 : 0, rotate: isClosingIcon ? 0 : 90, scale: isClosingIcon ? 1 : 0 }, transition: { duration: 0.28, ease: 'easeInOut', opacity: { duration: 0.18 } } }), _jsx(motion.img, { src: "/images/close.svg", alt: "", className: "mobile-close-img", initial: { opacity: 0, rotate: -90, scale: 0.95 }, animate: { opacity: isClosingIcon ? 0 : 1, rotate: isClosingIcon ? -90 : 0, scale: isClosingIcon ? 0.95 : 1 }, transition: { duration: 0.28, ease: 'easeInOut', opacity: { duration: 0.18, delay: isClosingIcon ? 0 : 0.05 } } })] }) }), _jsx(motion.div, { className: "mobile-panel", variants: mobilePanelVariants, initial: "hidden", animate: "visible", exit: "exit", children: _jsxs("div", { className: "grid-container mobile-panel-inner", children: [_jsx("div", { className: "grid-x mobile-panel-scroll", children: _jsx("div", { className: "cell small-12", children: _jsx("nav", { className: "mobile-panel-nav", children: _jsx("ul", { className: "mobile-list", children: menuItems.map((item, index) => {
                                                            const showHoverDot = hoveredItem === item.label && !item.active;
                                                            return (_jsx(motion.li, { variants: itemVariants, initial: "collapsed", animate: bgReady ? 'open' : 'collapsed', exit: "exit", custom: index, className: "mobile-item", children: _jsxs("a", { href: item.href, className: "mobile-link", onClick: (e) => onMenuItemClick(item, e), onMouseEnter: () => setHoveredItem(item.label), onMouseLeave: () => setHoveredItem(null), "aria-current": item.active ? 'page' : undefined, children: [_jsx("img", { src: item.icon, alt: "", className: "mobile-icon" }), _jsx("h3", { className: "mobile-label", children: item.label }), _jsxs("span", { className: "mobile-dot-wrap", children: [_jsx(motion.img, { src: hoverDotSrcMobile, alt: "", className: "mobile-dot", initial: false, animate: { opacity: showHoverDot ? 1 : 0 }, transition: { duration: 0 } }), _jsx(motion.img, { src: activeDotSrc, alt: "", className: "mobile-dot", initial: false, animate: { opacity: item.active ? 1 : 0, rotate: item.active ? 0 : -90, scale: item.active ? 1 : 0.95 }, transition: { duration: 0.2, ease: 'easeOut' } })] })] }) }, item.label));
                                                        }) }) }) }) }), _jsx(motion.div, { variants: itemVariants, initial: "collapsed", animate: bgReady ? 'open' : 'collapsed', exit: "exit", custom: socialBaseIndex, className: "mobile-divider" }), _jsx("ul", { className: "mobile-socials", children: socialLinks.map((link, index) => (_jsx(motion.li, { variants: itemVariants, initial: "collapsed", animate: bgReady ? 'open' : 'collapsed', exit: "exit", custom: socialBaseIndex + 1 + index, className: "mobile-social", children: _jsx(Magnet, { padding: 20, magnetStrength: 10, children: _jsx("a", { href: link.href, "aria-label": link.label, target: "_blank", rel: "noopener noreferrer", className: "mobile-social-btn", children: _jsx("img", { src: link.icon, alt: link.alt, className: "mobile-social-img" }) }) }) }, link.label))) })] }) }, "mobile-panel")] }, "mobile-root")) }), document.body)] }));
};
export default Navigation;
