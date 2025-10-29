// src/pages/PECZwolle.tsx
import React, { useEffect, useRef } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";

/* Respect reduced motion */
const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Left→Right grow divider */
const RuleGrow: React.FC<{ delayMs?: number }> = ({ delayMs = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.classList.add("is-in");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (playedRef.current) break;
          if (!e.isIntersecting) continue;

          const ratio = e.intersectionRatio;
          const top = e.boundingClientRect.top;
          const vh = e.rootBounds?.height ?? window.innerHeight;
          const deepEnough = ratio >= 0.6 && top >= vh * 0.15;

          if (deepEnough) {
            playedRef.current = true;
            if (delayMs > 0) el.style.transitionDelay = `${Math.max(0, delayMs)}ms`;
            requestAnimationFrame(() => el.classList.add("is-in"));
            obs.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "0px 0px -25% 0px", threshold: [0, 0.25, 0.6, 0.9, 1] }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  return <div ref={ref} className="pz-rule pz-rule-anim" role="separator" aria-hidden="true" />;
};

const PECZwolle: React.FC = () => {
  // animations (same feel as other project pages)
  const textReveal = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 14,
  };
  const imageReveal = {
    distance: 60,
    direction: "vertical" as const,
    duration: 0.7,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 28,
  };
  const STAGGER = 0.18;

  const headingId = "pec-zwolle-heading";

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main
        id="main-content"
        aria-label="PEC Zwolle case study"
        className="pz-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        <section className="pz-container">
          {/* HEADER */}
          <div className="pz-grid">
            <div className="pz-content">
              <h1 id={headingId} className="pz-title">
                <SplitText
                  text="PEC Zwolle"
                  splitType="words"
                  delay={0.06}            // ✅ fixed (was 60)
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 28 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
                />
              </h1>

              <p className="pz-subtitle">
                <SplitText
                  text="Bringing an Eredivisie club’s matches and campaigns to life."
                  splitType="words"
                  delay={0.06}            // ✅ fixed (was 60)
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 24 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
                  startDelay={0.15}
                />
              </p>
            </div>
          </div>

          {/* DIVIDER — grow left → right */}
          <div className="pz-grid pz-divider-wrap">
            <div className="pz-divider">
              <RuleGrow />
            </div>
          </div>

          {/* TEXT BLOCK 1 */}
          <div className="pz-block">
            <div className="pz-block-grid">
              <div className="pz-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Matchdays</h5>
                </AnimatedContent>
              </div>
              <div className="pz-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    I've proudly collaborated with PEC Zwolle, creating posters for various matches.
                    Each design was crafted using a combination of Photoshop and Blender, showcasing
                    a dynamic blend of 2D and 3D elements.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* 2x2 PORTRAIT GRID (4/5) */}
          <div className="pz-grid">
            <div className="pz-images-2x2">
              <div className="pz-2x2">
                {[
                  {
                    src: "/images/pec-zwolle/vert-1.jpg",
                    alt: "A boy lies on his bed in a dimly lit room decorated with PEC Zwolle posters, dreaming while looking at photos of football players and matches on the wall.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-2.jpg",
                    alt: "Four PEC Zwolle players decorate a glowing Christmas tree on the football field under a starry night sky with a full moon.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-3.jpg",
                    alt: "PEC Zwolle players ride a roller coaster shaped like a fierce wolf high above the city, passing a tall clock tower under a dramatic sky.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-4.jpg",
                    alt: "Four PEC Zwolle players ride a roller coaster shaped like a wolf soaring above the city skyline beside a clock tower, symbolizing excitement and team spirit.",
                  },
                ].map(({ src, alt }, i) => (
                  <AnimatedContent key={i} {...imageReveal} delay={i * 0.08}>
                    <figure className="pz-img-vert" aria-label={alt}>
                      <img src={src} alt={alt} loading="lazy" decoding="async" />
                    </figure>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </div>


          {/* DIVIDER — grow left → right */}
          <div className="pz-grid">
            <div className="pz-divider">
              <RuleGrow />
            </div>
          </div>

          {/* TEXT BLOCK 2 */}
          <div className="pz-block">
            <div className="pz-block-grid">
              <div className="pz-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Ticket Campaign</h5>
                </AnimatedContent>
              </div>
              <div className="pz-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    PEC Zwolle asked me to design a special poster for the 2023/24 season ticket
                    campaign. Of course, I couldn't say no to this opportunity.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* MOSAIC GRID: 1 TALL LEFT (portrait), 2 HORIZONTAL RIGHT */}
          <div className="pz-grid">
            <div className="pz-mosaic">
              <div className="pz-mosaic-grid">
                {/* Left tall portrait */}
                <AnimatedContent {...imageReveal}>
                  <figure className="pz-mosaic-left" aria-label="Tall portrait">
                    <img
                      src="/images/pec-zwolle/vert-5.jpg"
                      alt="An adult and a child wearing PEC Zwolle clothing stand together in a room covered with photos from past football matches, symbolizing shared memories of the season."
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </AnimatedContent>

                {/* Right stacked horizontals */}
                <div className="pz-mosaic-right">
                  {[
                    {
                      src: "/images/pec-zwolle/horz-1.jpg",
                      alt: "Screenshot of PEC Zwolle’s season ticket page showing two fans facing a wall of match photos with the text ‘De mooiste club van allemaal’ and buttons to choose season tickets for different age groups.",
                    },
                    {
                      src: "/images/pec-zwolle/horz-2.jpg",
                      alt: "Screenshot of PEC Zwolle’s news section showing three updates: the season ticket campaign launch, a match summary against Telstar, and a photo from the Almere City FC match.",
                    },
                  ].map(({ src, alt }, i) => (
                    <AnimatedContent key={i} {...imageReveal} delay={i * 0.08}>
                      <figure className="pz-img-horz" aria-label={alt}>
                        <img src={src} alt={alt} loading="lazy" decoding="async" />
                      </figure>
                    </AnimatedContent>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* FULL-WIDTH HORIZONTAL IMAGE */}
          <div className="pz-grid">
            <div className="pz-wide">
              <AnimatedContent {...imageReveal}>
                <figure className="pz-wide-figure" aria-label="Full width horizontal">
                  <img
                    src="/images/pec-zwolle/wide-1.jpg"
                    alt="PEC Zwolle full-width visual"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </AnimatedContent>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PECZwolle;
