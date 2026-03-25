// src/pages/PECZwolle.tsx
import React from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
import RuleGrow from "../components/common/RuleGrow";
import { useDocumentHead } from "../hooks/useDocumentHead";

/* RuleGrow is now imported from ../components/common/RuleGrow */

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

  useDocumentHead({
    title: "PEC Zwolle — Raoul Martens",
    description:
      "Graphic design for PEC Zwolle: matchday posters and season ticket campaigns.",
  });

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
                  delay={0.06}
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
                  delay={0.06}
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
              <RuleGrow classPrefix="pz" />
            </div>
          </div>

          {/* TEXT BLOCK 1 */}
          <div className="pz-block">
            <div className="pz-block-grid">
              <div className="pz-block-title">
                <AnimatedContent {...textReveal}>
                  <h3>Matchdays</h3>
                </AnimatedContent>
              </div>
              <div className="pz-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    I've proudly collaborated with PEC Zwolle, creating posters for various matches.
                    Each design was made using a combination of Photoshop and Blender, showcasing
                    a blend of 2D and 3D elements.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* 2x2 PORTRAIT GRID */}
          <div className="pz-grid">
            <div className="pz-images-2x2">
              <div className="pz-2x2">
                {[
                  {
                    src: "/images/pec-zwolle/vert-1.webp",
                    alt:
                      "A boy lies on his bed in a dimly lit room decorated with PEC Zwolle posters, dreaming while looking at photos of football players and matches on the wall.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-2.webp",
                    alt:
                      "Four PEC Zwolle players decorate a glowing Christmas tree on the football field under a starry night sky with a full moon.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-3.webp",
                    alt:
                      "PEC Zwolle players ride a roller coaster shaped like a fierce wolf high above the city, passing a tall clock tower under a dramatic sky.",
                  },
                  {
                    src: "/images/pec-zwolle/vert-4.webp",
                    alt:
                      "Four PEC Zwolle players ride a roller coaster shaped like a wolf soaring above the city skyline beside a clock tower, symbolizing excitement and team spirit.",
                  },
                ].map(({ src, alt }, i) => (
                  <AnimatedContent key={i} {...imageReveal} delay={i * 0.08}>
                    <figure className="pz-img-vert">
                      <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
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
                  <h3>Ticket Campaign</h3>
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

          {/* MOSAIC GRID: 1 TALL LEFT, 2 HORIZONTAL RIGHT */}
          <div className="pz-grid">
            <div className="pz-mosaic">
              <div className="pz-mosaic-grid">
                {/* Left tall portrait */}
                <AnimatedContent {...imageReveal}>
                  <figure className="pz-mosaic-left">
                    <img
                      src="/images/pec-zwolle/vert-5.webp"
                      alt="An adult and a child wearing PEC Zwolle clothing stand together in a room covered with photos from past football matches, symbolizing shared memories of the season."
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </figure>
                </AnimatedContent>

                {/* Right stacked horizontals */}
                <div className="pz-mosaic-right">
                  {[
                    {
                      src: "/images/pec-zwolle/horz-1.webp",
                      alt:
                        "Screenshot of PEC Zwolle’s season ticket page showing two fans facing a wall of match photos with the text ‘De mooiste club van allemaal’ and buttons to choose season tickets for different age groups.",
                    },
                    {
                      src: "/images/pec-zwolle/horz-2.webp",
                      alt:
                        "Screenshot of PEC Zwolle’s news section showing three updates: the season ticket campaign launch, a match summary against Telstar, and a photo from the Almere City FC match.",
                    },
                  ].map(({ src, alt }, i) => (
                    <AnimatedContent key={i} {...imageReveal} delay={i * 0.08}>
                      <figure className="pz-img-horz">
                        <img
                          src={src}
                          alt={alt}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
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
                <figure className="pz-wide-figure">
                  <img
                    src="/images/pec-zwolle/wide-1.webp"
                    alt="PEC Zwolle full-width visual"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
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
