// src/components/sections/Hero.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';

/* Magnet (react-spring) */
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

  // respect reduced motion
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
    return () =>
      mq.removeEventListener ? mq.removeEventListener('change', apply) : mq.removeListener(apply as any);
  }, []);

  useEffect(() => {
    if (disabled || reduceMotion || typeof window === 'undefined') {
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
  }, [padding, disabled, magnetStrength, api, reduceMotion]);

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

/* Breakpoint hook */
type BP = 'mobile' | 'tablet' | 'desktop';
function useBreakpoint(): BP | null {
  const [bp, setBp] = useState<BP | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

/* Hero */
interface HeroProps {
  headingId?: string;
}

const Hero: React.FC<HeroProps> = ({ headingId = 'home-hero-heading' }) => {
  const bp = useBreakpoint();
  const [viewportHeight, setViewportHeight] = useState<string>('100vh');

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const calculateHeight = () => {
      const nav = document.querySelector('.navbar') as HTMLElement | null;
      const offset = nav?.offsetHeight || 0;
      setViewportHeight(`calc(100vh - ${offset}px)`);
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const handleAnimationComplete = () => { };

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

  const iconDelay = 1.0;
  const subtitleDelay = 1.2;

  const heroImgAnim = {
    ...fadeUp,
    distance: 80,
    delay: 0.6,
  };

  const heroGroupPhrase = {
    tokens: ['ux', '&', 'product', 'designer'],
    className: 'gradient-group',
  };

  if (!bp) return null;

  // shared hero text
  const heroText =
    "I'm Raoul, a UX & Product Designer crafting intuitive digital experiences that connect people.";

  // pin icon is decorative, hide from a11y tree
  const PinIcon = ({ size = 24 }: { size?: number }) => (
    <img
      className="hero-pin"
      src="/images/map-pin.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );

  // hero image attributes to avoid CLS + prioritize above-the-fold
  const heroImgAttrs = {
    src: '/images/hero-image.webp',
    decoding: 'async' as const,
    loading: 'eager' as const,
    // fetchPriority ondersteunt moderne browsers; harmless fallback elders
    fetchpriority: 'high' as any,
  };

  return (
    <header
      id="home-hero"
      className="site-header"
      style={{ minHeight: viewportHeight }}
      aria-labelledby={headingId}
    >
      <div className="grid-container hero-center-wrap">
        {/* Desktop */}
        {bp === 'desktop' && (
          <div className="hero-desktop-layout">
            <div className="hero-grid">
              <div className="hero-title-row">
                <div className="hero-title-wrapper">
                  <div className="hero-desktop-title-container">
                    <h1 id={headingId} className="page-title hero-title">
                      <SplitText
                        text={heroText}
                        delay={0.06}
                        duration={0.8}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 50 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="0px 0px -10% 0px"
                        textAlign="left"
                        onLetterAnimationComplete={handleAnimationComplete}
                        groupPhrase={heroGroupPhrase}
                      />
                    </h1>

                    <div className="subtitle-row">
                      <AnimatedContent {...fadeUp} delay={iconDelay}>
                        <PinIcon size={24} />
                      </AnimatedContent>

                      <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                        <div className="subtitle-text">Currently designing at HAN University</div>
                      </AnimatedContent>
                    </div>
                  </div>

                  <AnimatedContent {...heroImgAnim}>
                    <Magnet padding={50} magnetStrength={9}>
                      <img
                        {...heroImgAttrs}
                        alt="Portrait of Raoul Martens seated at an outdoor café, smiling toward the camera."
                        className="hero-image hero-image--desktop"
                        width={640}
                        height={800}
                      />
                    </Magnet>
                  </AnimatedContent>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tablet */}
        {bp === 'tablet' && (
          <div className="hero-tablet-layout">
            <AnimatedContent {...heroImgAnim}>
              <Magnet padding={50} magnetStrength={9}>
                <img
                  {...heroImgAttrs}
                  alt="Portrait of Raoul Martens at an outdoor café."
                  className="hero-image hero-image--tablet"
                  width={560}
                  height={700}
                />
              </Magnet>
            </AnimatedContent>

            <div className="text-container" style={{ width: '100%' }}>
              <h1 id={headingId} className="page-title hero-title hero-title--tablet">
                <SplitText
                  text={heroText}
                  delay={0.06}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="0px 0px -10% 0px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                  groupPhrase={heroGroupPhrase}
                />
              </h1>

              <div className="subtitle-row">
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <PinIcon size={24} />
                </AnimatedContent>

                <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                  <div className="subtitle-text">Currently designing at HAN University</div>
                </AnimatedContent>
              </div>
            </div>
          </div>
        )}

        {/* Mobile */}
        {bp === 'mobile' && (
          <div className="hero-mobile-layout">
            <AnimatedContent {...heroImgAnim}>
              <Magnet padding={50} magnetStrength={9}>
                <img
                  {...heroImgAttrs}
                  alt="Portrait of Raoul Martens smiling at an outdoor café."
                  className="hero-image hero-image--mobile"
                  width={480}
                  height={640}
                />
              </Magnet>
            </AnimatedContent>

            <div className="text-container" style={{ width: '100%' }}>
              <h1 id={headingId} className="page-title hero-title hero-title--mobile">
                <SplitText
                  text={heroText}
                  delay={0.06}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="0px 0px -10% 0px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                  groupPhrase={heroGroupPhrase}
                />
              </h1>

              <div className="subtitle-row">
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <PinIcon size={16} />
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
