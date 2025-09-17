import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';

/* ----------------------------- */
/* Magnet (react-spring)         */
/* ----------------------------- */
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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, disabled, magnetStrength, api]);

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: 'relative', display: 'inline-block' }}
      {...props}
    >
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

/* ----------------------------- */
/* Breakpoint hook               */
/* ----------------------------- */
type BP = 'mobile' | 'tablet' | 'desktop';
function useBreakpoint(): BP | null {
  const [bp, setBp] = useState<BP | null>(null);
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
const Hero: React.FC = () => {
  const bp = useBreakpoint();
  const [viewportHeight, setViewportHeight] = useState<string>('100vh');

  useLayoutEffect(() => {
    const calculateHeight = () => {
      const nav = document.querySelector('.navbar') as HTMLElement | null;
      const offset = nav?.offsetHeight || 0;
      setViewportHeight(`calc(100vh - ${offset}px)`);
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const handleAnimationComplete = () => {};

  // Fade-up base config
  const fadeUp = {
    distance: 50,
    direction: 'vertical' as const,
    duration: 0.8,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    initialOpacity: 0,
    animateOpacity: true,
    startOnMount: true,
    rootMarginBottomPct: 14,
  };

  // Stagger timings
  const iconDelay = 1.0;      // subtitle icon later
  const subtitleDelay = 1.2;  // subtitle text latest

  // Image comes in *after title but before subtitle*
  const heroImgAnim = {
    ...fadeUp,
    distance: 80,
    delay: 0.6, // middle timing
  };

  const heroGroupPhrase = {
    tokens: ['ux', '&', 'product', 'designer'],
    className: 'gradient-group',
  };

  if (!bp) return null;

  return (
    <header id="top" className="site-header" style={{ minHeight: viewportHeight }}>
      <div className="grid-container hero-center-wrap">
        {/* ---------------- Desktop ---------------- */}
        {bp === 'desktop' && (
          <div className="hero-desktop-layout">
            <div className="hero-grid">
              <div className="hero-title-row">
                <div className="hero-title-wrapper">
                  <div className="hero-desktop-title-container">
                    <div className="page-title hero-title">
                      <SplitText
                        text="I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people."
                        delay={0.06}
                        duration={0.8}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 50 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="left"
                        onLetterAnimationComplete={handleAnimationComplete}
                        groupPhrase={heroGroupPhrase}
                      />
                    </div>

                    <div className="subtitle-row">
                      <AnimatedContent {...fadeUp} delay={iconDelay}>
                        <img src="/images/map-pin.svg" alt="Location pin" width={24} height={24} />
                      </AnimatedContent>

                      <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                        <div className="subtitle-text">Currently designing at HAN University</div>
                      </AnimatedContent>
                    </div>
                  </div>

                  {/* HERO IMAGE — still after subtitle row in DOM, but animates earlier */}
                  <AnimatedContent {...heroImgAnim}>
                    <Magnet padding={50} magnetStrength={9}>
                      <img
                        src="/images/hero-image.jpg"
                        alt="Hero image"
                        className="hero-image hero-image--desktop"
                      />
                    </Magnet>
                  </AnimatedContent>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Tablet ---------------- */}
        {bp === 'tablet' && (
          <div className="hero-tablet-layout">
            <AnimatedContent {...heroImgAnim}>
              <Magnet padding={50} magnetStrength={9}>
                <img
                  src="/images/hero-image.jpg"
                  alt="Hero image"
                  className="hero-image hero-image--tablet"
                />
              </Magnet>
            </AnimatedContent>

            <div className="text-container" style={{ width: '100%' }}>
              <div className="page-title hero-title hero-title--tablet">
                <SplitText
                  text="I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people."
                  delay={0.06}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                  groupPhrase={heroGroupPhrase}
                />
              </div>

              <div className="subtitle-row">
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <img src="/images/map-pin.svg" alt="Location pin" width={24} height={24} />
                </AnimatedContent>

                <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                  <div className="subtitle-text">Currently designing at HAN University</div>
                </AnimatedContent>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Mobile ---------------- */}
        {bp === 'mobile' && (
          <div className="hero-mobile-layout">
            <AnimatedContent {...heroImgAnim}>
              <Magnet padding={50} magnetStrength={9}>
                <img
                  src="/images/hero-image.jpg"
                  alt="Young man wearing a light cap and blue shirt, smiling while sitting at an outdoor café."
                  className="hero-image hero-image--mobile"
                />
              </Magnet>
            </AnimatedContent>

            <div className="text-container" style={{ width: '100%' }}>
              <div className="page-title hero-title hero-title--mobile">
                <SplitText
                  text="I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people."
                  delay={0.06}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                  groupPhrase={heroGroupPhrase}
                />
              </div>

              <div className="subtitle-row">
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <img
                    src="/images/map-pin.svg"
                    alt="Location pin"
                    width={16}
                    height={16}
                    style={{ display: 'block', verticalAlign: 'middle' }}
                  />
                </AnimatedContent>

                <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                  <div className="subtitle-text">Currently designing at HAN University</div>
                </AnimatedContent>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Hero;
