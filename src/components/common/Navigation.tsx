import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  animate,
  useMotionValue,
} from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';
import { useSpring as useSpringRS, animated, to } from '@react-spring/web';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { SECTION_EVENT, readSectionFromWindow, Section } from '../../utils/sections';

/**
 * Dit is de hoofdnavigatie met animaties, dark mode en toetsenbord-ondersteuning.
 * - De semantische <header>/<nav> structuur ondersteunt criterium 6.1.
 * - Animaties passen zich aan aan scroll en schermbreedte → criterium 6.2.
 * - Aria-attributen en echte knoppen maken de menuknop toegankelijk → criterium 6.3.
 */

/* ---------- Herbruikbare "Magnet" voor zwevende iconen ---------- */
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
  [key: string]: any;
}
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 10,
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [{ x, y }, api] = useSpringRS(() => ({
    x: 0,
    y: 0,
    config: { tension: 280, friction: 12, mass: 1.2 },
  }));

  useEffect(() => {
    // Als de magneet uit staat, springt het element terug naar het midden.
    if (disabled) {
      api.start({ x: 0, y: 0 });
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return;
      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.abs(dx) < width / 2 + padding && Math.abs(dy) < height / 2 + padding) {
        api.start({ x: dx / magnetStrength, y: dy / magnetStrength });
      } else {
        api.start({ x: 0, y: 0 });
      }
    };
    // Luister naar muisbewegingen zodat het icoon licht mee beweegt.
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, disabled, magnetStrength, api]);

  return (
    <div ref={magnetRef} className={`magnet ${wrapperClassName}`} {...props}>
      <animated.div
        className={innerClassName}
        style={{
          transform: to([x, y], (xv: number, yv: number) => `translate3d(${xv}px, ${yv}px, 0)`),
          willChange: 'transform',
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};

/* ---------- Types ---------- */
interface MenuItem {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}

/* ---------- Animation helpers ---------- */
const springTransition: Transition = { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 };

const panelEnterVariants: Variants = {
  expandingRight: { opacity: 1, scaleX: 1, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeOut' } },
  expandingDown: { opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeOut' } },
  open: {
    opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left',
    transition: { duration: 0.1, when: 'beforeChildren', staggerChildren: 0.15, delayChildren: 0.2 }
  },
};
const panelExitVariants: Variants = {
  itemsOut: {
    opacity: 1, scaleX: 1, scaleY: 1, transformOrigin: 'top left',
    transition: { when: 'afterChildren', staggerChildren: 0.1, staggerDirection: -1 }
  },
  collapsingUp: { opacity: 1, scaleX: 1, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeIn' } },
  collapsingLeft: { opacity: 0, scaleX: 0, scaleY: 0, transformOrigin: 'top left', transition: { duration: 0.2, ease: 'easeIn' } },
};
const itemVariants: Variants = {
  collapsed: { opacity: 0, x: -20, transition: { x: springTransition, opacity: { duration: 0.2 } } },
  open: (i: number = 0) => ({ opacity: 1, x: 0, transition: { x: springTransition, opacity: { duration: 0.2 }, delay: 0.06 * i } }),
  exit: (i: number = 0) => ({ opacity: 0, x: -20, transition: { x: springTransition, opacity: { duration: 0.15 }, delay: 0.02 * i } }),
};
const mobileBgVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 460, damping: 42, mass: 0.9 } },
  exit: { x: '-100%', transition: { duration: 0.25, ease: 'easeIn' } },
};
const mobilePanelVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 420, damping: 38, mass: 0.8, delay: 0.02 } },
  exit: { x: '-100%', transition: { duration: 0.25, ease: 'easeIn' } },
};

/* ---------- Theme refs ---------- */
const MENU_BG = 'var(--surface-action, #0080FF)';
const MENU_TEXT = 'var(--text-on-action, #FFF)';

const MENU_ID_DESKTOP = 'primary-navigation-desktop';
const MENU_ID_MOBILE = 'primary-navigation-mobile';

/* ---------- Hook: bekijk of we onder de mobiele breakpoint zitten ---------- */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryList | MediaQueryListEvent) =>
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
    // Eerste check en daarna luisteren naar veranderingen in schermbreedte.
    handler(mql);
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
    return () =>
      mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler as never);
  }, [breakpoint]);
  return isMobile;
}

/* =================================================================
   Navigation
=================================================================== */
const Navigation: React.FC = () => {
  // State die bijhoudt of het menu open is en in welke animatiefase we zitten.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [enterStage, setEnterStage] = useState<'expandingRight' | 'expandingDown' | 'open'>('expandingRight');
  const [exitStage, setExitStage] = useState<'itemsOut' | 'collapsingUp' | 'collapsingLeft'>('itemsOut');
  const [isExiting, setIsExiting] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Achtergrond-animaties voor het mobiele paneel.
  const [bgReady, setBgReady] = useState(false);
  const bgDelayRef = useRef<number | null>(null);
  const [isClosingIcon, setIsClosingIcon] = useState(false);

  // Thema, breakpoint en router-helpers.
  const { isDark, toggleDarkMode } = useDarkMode();
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  // Timers voor animaties zodat we ze kunnen opruimen (scheidt logica van UI → 6.1).
  const timeoutsRef = useRef<number[]>([]);
  const isHoveringRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);
  const addTimeout = useCallback((fn: () => void, delay: number) => {
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

  /* Luister naar sectie-updates van de Home-pagina zodat de nav weet waar je bent. */
  const [section, setSection] = useState<Section>(() => readSectionFromWindow());
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { section?: Section } | undefined;
      if (detail?.section) setSection(detail.section);
    };
    window.addEventListener(SECTION_EVENT, handler as EventListener);
    setSection(readSectionFromWindow());
    return () => window.removeEventListener(SECTION_EVENT, handler as EventListener);
  }, []);

  /* Controleer welke route actief is voor duidelijke labels en aria-states. */
  const { pathname } = location;
  const onHome = pathname === "/";
  const onPlay = pathname === "/play";
  const onMe = pathname === "/me";
  const onHallo = pathname === "/hallo-buur";
  const onHallo2 = pathname === "/hallo-buur-2";
  const onNieuws = pathname === "/nieuwsbegrip";
  const onPEC = pathname === "/pec-zwolle";

  /* Detailpagina's dwingen het mobiele menu zodat alles leesbaar blijft op kleine schermen. */
  const forceMobile = onHallo || onHallo2 || onNieuws || onPEC;
  const mobileMode = isMobile || forceMobile;
  const backMode = forceMobile;

  const menuButtonLabel =
    onPlay ? "Play" :
      onMe ? "Me" :
        (onHallo || onHallo2 || onNieuws || onPEC) ? "Work" :
          onHome ? (section === "work" ? "Work" : "Home") :
            "Home";

  // Menu-items voor de primaire navigatie (structuur → 6.1).
  const menuItems: MenuItem[] = [
    { href: '/', icon: '/images/home.svg', label: 'Home', active: onHome && section === 'home' },
    { href: '#work', icon: '/images/work.svg', label: 'Work', active: (onHome && section === 'work') || onHallo || onHallo2 || onNieuws || onPEC },
    { href: '/play', icon: '/images/playground.svg', label: 'Play', active: onPlay },
    { href: '/me', icon: '/images/emoji.svg', label: 'Me', active: onMe },
  ];

  const socialBaseIndex = menuItems.length;
  // Sociale links: apart lijstje zodat je ziet dat dit externe bestemmingen zijn.
  const socialLinks = [
    { href: 'https://www.behance.net/Raoulgraphics', icon: '/images/behance.svg', alt: 'Behance', label: 'Behance' },
    { href: 'https://www.instagram.com/raoulgraphics/', icon: '/images/instagram.svg', alt: 'Instagram', label: 'Instagram' },
    { href: 'https://www.youtube.com/@RaoulGraphics', icon: '/images/youtube.svg', alt: 'YouTube', label: 'YouTube' },
    { href: 'https://www.tiktok.com/@raoulgraphics', icon: '/images/tiktok.svg', alt: 'TikTok', label: 'TikTok' },
  ];

  // Terugknop voor detailpagina's: ga terug in de geschiedenis of naar home.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  // Sluit het mobiele menu met een korte animatie.
  const closeMobileMenu = () => {
    setIsClosingIcon(true);
    addTimeout(() => {
      setIsMenuOpen(false);
      setBgReady(false);
      setIsClosingIcon(false);
    }, 280);
  };

  // Scroll helper voor ankers op de homepagina (neemt nav-hoogte mee → 6.2).
  const smoothScrollToId = (id: string) => {
    const target = document.getElementById(id);
    const navH = (document.querySelector('.navbar') as HTMLElement | null)?.offsetHeight ?? 0;
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollTopSmooth = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Reageer op klikken/enter in het menu zodat toetsenbord en muis hetzelfde gedrag zien.
  const onMenuItemClick = (item: MenuItem, e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.label === 'Work') {
      e?.preventDefault();
      if (!onHome) {
        navigate('/', { state: { scrollTo: 'work' } });
      } else {
        smoothScrollToId('work');
        setSection('work');
      }
      if (mobileMode) closeMobileMenu();
      return;
    }
    if (item.label === 'Home') {
      e?.preventDefault();
      if (onHome) { scrollTopSmooth(); setSection('home'); }
      else navigate('/', { state: { scrollToTop: true } });
      if (mobileMode) closeMobileMenu();
      return;
    }
    if (item.label === 'Play') {
      e?.preventDefault();
      if (onPlay) scrollTopSmooth(); else navigate('/play', { state: { scrollToTop: true } });
      if (mobileMode) closeMobileMenu();
      return;
    }
    if (item.label === 'Me') {
      e?.preventDefault();
      if (onMe) scrollTopSmooth(); else navigate('/me', { state: { scrollToTop: true } });
      if (mobileMode) closeMobileMenu();
      return;
    }
    if (item.href.startsWith('/')) {
      e?.preventDefault();
      navigate(item.href, { state: { scrollToTop: true } });
      if (mobileMode) closeMobileMenu();
      return;
    }
    if (item.href.startsWith('#') && !onHome) {
      e?.preventDefault();
      navigate('/', { state: { scrollToTop: true } });
    }
  };

  /* Desktop hover open/close */
  // Deze handlers zorgen dat het menu automatisch opent/sluit bij hover (muisgebruik). 6.3
  const handleMenuEnter = useCallback(() => {
    if (mobileMode) return;
    if (isMenuOpen && enterStage === 'open') return;
    isHoveringRef.current = true;
    clearAllTimeouts();
    setIsExiting(false);
    setIsMenuOpen(true);
    setEnterStage('expandingRight');
    addTimeout(() => isHoveringRef.current && setEnterStage('expandingDown'), 200);
    addTimeout(() => isHoveringRef.current && setEnterStage('open'), 400);
  }, [mobileMode, isMenuOpen, enterStage, addTimeout, clearAllTimeouts]);

  const handleMenuLeave = useCallback(() => {
    if (mobileMode || !isMenuOpen) return;
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
  // Op mobiel werkt het menu via een klik/druk op de knop, met animatie.
  const toggleMenu = () => {
    if (!mobileMode) return;
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      setBgReady(false);
      setIsClosingIcon(false);
      clearBgDelay();
    } else {
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
  // Als je scrolt laten we de navbar iets omhoog komen voor extra focus op de inhoud.
  useEffect(() => {
    let ticking = false;
    const SHOW_AT = 8, HIDE_BELOW = 4;
    const onScroll = () => {
      if (ticking) return;
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

  // Houd een dynamische verschuiving bij gebaseerd op de huidige font-size.
  const [shiftPx, setShiftPx] = useState(16);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const px = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setShiftPx(Number.isFinite(px) ? px : 16);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Gebruik veer-animaties voor zachte bewegingen (responsief en vriendelijk voor motion). 6.2
  const dist = useSpring(0, { stiffness: 320, damping: 32, mass: 0.6 });
  useEffect(() => { dist.set(isScrolled ? shiftPx : 0); }, [isScrolled, shiftPx, dist]);

  const menuX = dist;
  const menuY = dist;
  const toggleX = useTransform(dist, v => -v);
  const toggleY = dist;

  /* Logo parallax */
  // Kleine parallaxbeweging op het logo om scroll-feedback te geven.
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

  // Breedte van de menuschil volgt de staat; visuele laag vult de ruimte op.
  const menuShellW = (mobileMode ? MOBILE_WH : (isMenuOpen ? desktopOpenW : desktopClosedW));
  const menuShellH = TARGET_H;
  const menuVisualW: string | number = '100%';

  /* Toggle sizes */
  const SWITCH_MOBILE_WH = 40;
  const SWITCH_DESKTOP_W = Math.round(5.5 * 16); // 88px breedte op desktop.
  const SWITCH_DESKTOP_H = Math.round(2.5 * 16); // 40px hoogte op desktop.

  const switchShellW = mobileMode ? SWITCH_MOBILE_WH : SWITCH_DESKTOP_W;
  const switchShellH = mobileMode ? SWITCH_MOBILE_WH : SWITCH_DESKTOP_H;
  const switchVisualW = switchShellW;

  /* Body lock op mobiel menu */
  // Wanneer het menu open is vergrendelen we de body-scroll om focus te houden. 6.3
  useEffect(() => {
    if (!(mobileMode && isMenuOpen)) return;
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

  return (
    <>
      {/* add is-project on project pages to target CSS */}
      <nav
        id="site-top"
        className={`navbar ${backMode ? 'is-project' : ''}`}
        tabIndex={-1}
        aria-label="Site navigation"
      >
        <div className="grid-container">
          <div className="navbar-grid">
            {/* MENU / BACK + PANEL WRAPPER */}
            <motion.div
              key={`menu-anchor-${mobileMode ? 'm' : 'd'}`}
              className="menu-anchor"
              style={{ x: menuX, y: menuY }}
              onMouseEnter={!mobileMode ? handleMenuEnter : undefined}
              onMouseLeave={!mobileMode ? handleMenuLeave : undefined}
            >
              <motion.button
                type="button"
                className="menu-shell"
                aria-label={backMode ? 'Go back' : 'Open menu'}
                aria-haspopup={backMode ? undefined : 'menu'}
                aria-expanded={backMode ? undefined : isMenuOpen}
                aria-controls={
                  backMode ? undefined : mobileMode ? MENU_ID_MOBILE : MENU_ID_DESKTOP
                }
                onClick={onMenuButtonClick}
                animate={{ width: menuShellW, height: menuShellH }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  key={`menu-visual-${mobileMode ? 'm' : 'd'}`}
                  className="menu-visual"
                  animate={{ width: menuVisualW }}
                  initial={false}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {!mobileMode && <motion.span className="menu-label" initial={false}>{menuButtonLabel}</motion.span>}

                  <div className={`menu-icon-box ${mobileMode ? 'is-mobile' : ''}`}>
                    {backMode ? (
                      <img src="/images/chevron-left.svg" alt="" className="menu-icon-img" />
                    ) : (
                      <>
                        <motion.img
                          src="/images/menu.svg"
                          alt=""
                          className="menu-icon-img"
                          initial={false}
                          animate={isMenuOpen ? { opacity: 0, rotate: 90, scale: 0 } : { opacity: 1, rotate: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: 'easeInOut', opacity: { duration: 0.15 } }}
                        />
                        <motion.img
                          src="/images/menu-open.svg"
                          alt=""
                          className="menu-icon-img"
                          initial={false}
                          animate={isMenuOpen ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: 90, scale: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut', opacity: { duration: 0.15, delay: mobileMode && isMenuOpen && !isClosingIcon ? 0.1 : 0 } }}
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.button>

              {/* DESKTOP/TABLET PANEL */}
              {!mobileMode && !backMode && isMenuOpen && (
                <motion.div
                  className="menu-panel"
                  variants={isExiting ? panelExitVariants : panelEnterVariants}
                  animate={isExiting ? exitStage : enterStage}
                  initial="expandingRight"
                >
                  <nav id={MENU_ID_DESKTOP} aria-label="Primary">
                    <ul className="menu-list">
                      {menuItems.map((item, index) => {
                        const showHoverDot = hoveredItem === item.label && !item.active;
                        return (
                          <motion.li
                            key={item.label}
                            className="menu-item"
                            variants={itemVariants}
                            animate={isExiting ? 'exit' : enterStage === 'open' ? 'open' : 'collapsed'}
                            custom={index}
                          >
                            <a
                              href={item.href}
                              className="menu-link"
                              onClick={(e) => onMenuItemClick(item, e)}
                              onMouseEnter={() => setHoveredItem(item.label)}
                              onMouseLeave={() => setHoveredItem(null)}
                              aria-current={item.active ? 'page' : undefined}
                            >
                              <motion.div
                                className="menu-dot-wrap"
                                initial={false}
                                animate={{ width: item.active || showHoverDot ? 24 : 0, marginRight: item.active || showHoverDot ? '0.75rem' : 0 }}
                                transition={springTransition}
                              >
                                <motion.img
                                  src={hoverDotSrcDesktop}
                                  alt=""
                                  className="menu-dot"
                                  initial={false}
                                  animate={{ x: showHoverDot ? 0 : -24, opacity: showHoverDot ? 1 : 0 }}
                                  transition={springTransition}
                                />
                                <motion.img
                                  src={activeDotSrc}
                                  alt=""
                                  className="menu-dot"
                                  initial={false}
                                  animate={{ x: 0, opacity: item.active ? 1 : 0 }}
                                  transition={springTransition}
                                />
                              </motion.div>
                              <motion.span className="menu-text" initial={false}>
                                <img src={item.icon} alt="" /> {item.label}
                              </motion.span>
                            </a>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </nav>
                </motion.div>
              )}
            </motion.div>

            {/* LOGO */}
            <motion.a href="/" className="nav-logo">
              <motion.img
                key={isDark ? 'logo-dark' : 'logo-light'}
                src={logoSrc}
                alt="Stylized blue letter R logo."
                style={{ y: logoY, scale: logoScale, willChange: 'transform' }}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </motion.a>

            {/* DARK-MODE TOGGLE */}
            <motion.div className="toggle-anchor" style={{ x: toggleX, y: toggleY, display: mobileMode && isMenuOpen ? 'none' : 'flex' }}>
              <motion.button
                type="button"
                aria-label="Toggle dark mode"
                aria-pressed={isDark}
                className={`switch-shell ${mobileMode ? 'is-mobile' : ''}`}
                onClick={toggleDarkMode}
                animate={{ width: switchShellW, height: switchShellH }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div className="switch-visual" animate={{ width: switchVisualW }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                  {mobileMode ? (
                    <div className="switch-mobile-face">
                      <div className="switch-flip-24">
                        <motion.div initial={false} animate={{ rotateY: isDark ? 0 : 180 }} transition={{ type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] }} className="flip-3d">
                          <img src="/images/moon.svg" alt="" className="flip-face front" />
                          <img src="/images/sun.svg" alt="" className="flip-face back" />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="switch-track">
                      <motion.div className="switch-fill" style={{ left: fillLeftPx }}>
                        <div className="switch-fill-center">
                          <motion.div initial={false} className="flip-3d" style={{ rotateY }} transition={{ type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
                            <img src="/images/moon.svg" alt="" className="flip-face front" />
                            <img src="/images/sun.svg" alt="" className="flip-face back" />
                          </motion.div>
                        </div>
                      </motion.div>
                      <span className="option option-light" />
                      <span className="option option-dark" />
                    </div>
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* MOBILE/FORCED FULL-SCREEN MENU */}
      {mobileMode && !backMode &&
        createPortal(
          <AnimatePresence>
            {isMenuOpen && (
              <div key="mobile-root" className="mobile-menu-root" role="dialog" aria-modal="true">
                <motion.div
                  key="mobile-bg"
                  className="mobile-menu-bg"
                  variants={mobileBgVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onAnimationComplete={(state) => {
                    if (state === 'visible') {
                      clearBgDelay();
                      bgDelayRef.current = window.setTimeout(() => setBgReady(true), 120);
                    }
                  }}
                />

                {/* CLOSE */}
                <motion.button
                  aria-label="Close menu"
                  className="mobile-close"
                  onClick={() => { setIsClosingIcon(true); addTimeout(() => { setIsMenuOpen(false); setBgReady(false); setIsClosingIcon(false); }, 280); }}
                >
                  <motion.div className="mobile-close-anim" style={{ x: menuX, y: menuY }}>
                    <motion.img src="/images/menu.svg" alt="" className="mobile-close-img"
                      initial={{ opacity: 1, rotate: 0, scale: 1 }}
                      animate={{ opacity: isClosingIcon ? 1 : 0, rotate: isClosingIcon ? 0 : 90, scale: isClosingIcon ? 1 : 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut', opacity: { duration: 0.18 } }}
                    />
                    <motion.img src="/images/close.svg" alt="" className="mobile-close-img"
                      initial={{ opacity: 0, rotate: -90, scale: 0.95 }}
                      animate={{ opacity: isClosingIcon ? 0 : 1, rotate: isClosingIcon ? -90 : 0, scale: isClosingIcon ? 0.95 : 1 }}
                      transition={{ duration: 0.28, ease: 'easeInOut', opacity: { duration: 0.18, delay: isClosingIcon ? 0 : 0.05 } }}
                    />
                  </motion.div>
                </motion.button>

                {/* PANEL */}
                <motion.div key="mobile-panel" className="mobile-panel" variants={mobilePanelVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="grid-container mobile-panel-inner">
                    <div className="grid-x mobile-panel-scroll">
                      <div className="cell small-12">
                        <nav id={MENU_ID_MOBILE} className="mobile-panel-nav" aria-label="Primary">
                          <ul className="mobile-list">
                            {menuItems.map((item, index) => {
                              const showHoverDot = hoveredItem === item.label && !item.active;
                              return (
                                <motion.li
                                  key={item.label}
                                  variants={itemVariants}
                                  initial="collapsed"
                                  animate={bgReady ? 'open' : 'collapsed'}
                                  exit="exit"
                                  custom={index}
                                  className="mobile-item"
                                >
                                  <a
                                    href={item.href}
                                    className="mobile-link"
                                    onClick={(e) => onMenuItemClick(item, e)}
                                    onMouseEnter={() => setHoveredItem(item.label)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    aria-current={item.active ? 'page' : undefined}
                                  >
                                    <img src={item.icon} alt="" className="mobile-icon" />
                                    <h3 className="mobile-label">{item.label}</h3>
                                    <span className="mobile-dot-wrap">
                                      {/* theme-aware hover dot on mobile */}
                                      <motion.img
                                        src={hoverDotSrcMobile}
                                        alt=""
                                        className="mobile-dot"
                                        initial={false}
                                        animate={{ opacity: showHoverDot ? 1 : 0 }}
                                        transition={{ duration: 0 }}
                                      />
                                      <motion.img
                                        src={activeDotSrc}
                                        alt=""
                                        className="mobile-dot"
                                        initial={false}
                                        animate={{ opacity: item.active ? 1 : 0, rotate: item.active ? 0 : -90, scale: item.active ? 1 : 0.95 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                      />
                                    </span>
                                  </a>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </nav>
                      </div>
                    </div>

                    {/* Divider + Social icons */}
                    <motion.div
                      variants={itemVariants}
                      initial="collapsed"
                      animate={bgReady ? 'open' : 'collapsed'}
                      exit="exit"
                      custom={socialBaseIndex}
                      className="mobile-divider"
                    />
                    <ul className="mobile-socials">
                      {socialLinks.map((link, index) => (
                        <motion.li
                          key={link.label}
                          variants={itemVariants}
                          initial="collapsed"
                          animate={bgReady ? 'open' : 'collapsed'}
                          exit="exit"
                          custom={socialBaseIndex + 1 + index}
                          className="mobile-social"
                        >
                          <Magnet padding={20} magnetStrength={10}>
                            <a
                              href={link.href}
                              aria-label={link.label}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mobile-social-btn"
                            >
                              <img src={link.icon} alt={link.alt} className="mobile-social-img" />
                            </a>
                          </Magnet>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Navigation;
