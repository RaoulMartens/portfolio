// src/components/sections/Hero.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';

/* ----------------------------- */
/* Magnet (react-spring)         */
/* ----------------------------- */
// Kleine hulpcomponent voor het magnetische effect rond visuals (responsief → 6.2).
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
// Bepaal eenvoudig of we mobiel, tablet of desktop tonen (responsief → 6.2).
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
interface HeroProps {
  headingId?: string;
}

/**
 * Hero-sectie met animaties en duidelijke heading.
 * - Structuur: <header> met <h1> → criterium 6.1.
 * - Responsief: layout wisselt op basis van breakpoint → criterium 6.2.
 * - Toegankelijk: aria-labelledby en leesbare tekst → criterium 6.3.
 */
const Hero: React.FC<HeroProps> = ({ headingId = "home-hero-heading" }) => {
  const bp = useBreakpoint();
  const [viewportHeight, setViewportHeight] = useState<string>('100vh');

  useLayoutEffect(() => {
    // Houd de hero even hoog als het scherm minus de navigatiehoogte.
    const calculateHeight = () => {
      const nav = document.querySelector('.navbar') as HTMLElement | null;
      const offset = nav?.offsetHeight || 0;
      setViewportHeight(`calc(100vh - ${offset}px)`);
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Placeholder voor eventuele vervolgacties wanneer de SplitText klaar is.
  const handleAnimationComplete = () => {};

  // Basisconfig voor fade-up animaties zodat alles hetzelfde tempo volgt.
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

  // Verschillende vertragingen voor iconen/tekst zodat de animaties rustig binnenkomen.
  const iconDelay = 1.0;      // icoon iets later
  const subtitleDelay = 1.2;  // ondertitel als laatste

  // Afbeelding komt na de titel, maar vóór de ondertitel, voor een logische volgorde.
  const heroImgAnim = {
    ...fadeUp,
    distance: 80,
    delay: 0.6, // midden timing
  };

  // Speciaal groepje woorden zodat "UX & Product Designer" dezelfde gradient krijgt.
  const heroGroupPhrase = {
    tokens: ['ux', '&', 'product', 'designer'],
    className: 'gradient-group',
  };

  if (!bp) return null;

  return (
    <header
      id="home-hero"
      className="site-header"
      style={{ minHeight: viewportHeight }}
      aria-labelledby={headingId}
    >
      <div className="grid-container hero-center-wrap">
        {/* ---------------- Desktop ---------------- */}
        {bp === 'desktop' && (
          <div className="hero-desktop-layout">
            <div className="grid hero-grid">
              <div className="hero-title-row">
                <div className="grid hero-title-wrapper">
                  <div className="hero-desktop-title-container">
                    <h1 id={headingId} className="page-title hero-title">
                      {/* SplitText animeren de woorden zodat de intro rustig leesbaar binnenkomt. */}
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
                    </h1>

                    <div className="subtitle-row">
                      {/* Locatie-informatie koppelt icoon en tekst voor screenreaders. */}
                      <AnimatedContent {...fadeUp} delay={iconDelay}>
                        <img
                          className="hero-pin"
                          src="/images/map-pin.svg"
                          alt="Location pin"
                          width={24}
                          height={24}
                        />
                      </AnimatedContent>

                      <AnimatedContent {...fadeUp} delay={subtitleDelay}>
                        <div className="subtitle-text">Currently designing at HAN University</div>
                      </AnimatedContent>
                    </div>
                  </div>

                  {/* Hero-afbeelding met magnetisch effect voor extra interactie. */}
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
            {/* Eerst de afbeelding zodat hij naast de tekst staat in tablet-layout. */}
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
              {/* Zelfde boodschap in de h1 maar gecentreerd voor tablet. */}
              <h1 id={headingId} className="page-title hero-title hero-title--tablet">
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
              </h1>

              <div className="subtitle-row">
                {/* Iconen/tekst blijven identiek zodat screenreaders consistente inhoud horen. */}
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <img
                    className="hero-pin"
                    src="/images/map-pin.svg"
                    alt="Location pin"
                    width={24}
                    height={24}
                  />
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
            {/* Mobiel: afbeelding staat bovenaan zodat de intro meteen zichtbaar is. */}
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
              {/* Tekst volgt onder de foto maar blijft hetzelfde verhaal en heading-id. */}
              <h1 id={headingId} className="page-title hero-title hero-title--mobile">
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
              </h1>

              <div className="subtitle-row">
                {/* Herhaal locatie-informatie zodat iedereen die snel kan vinden. */}
                <AnimatedContent {...fadeUp} delay={iconDelay}>
                  <img
                    className="hero-pin"
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
