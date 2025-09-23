// src/pages/Me.tsx
import React, { useEffect, useRef, useState } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";

/* ----------------------------- */
/* Breakpoint hook (match Hero)  */
/* ----------------------------- */
type BP = "mobile" | "tablet" | "desktop";
function useBreakpoint(): BP | null {
  const [bp, setBp] = useState<BP | null>(null);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? "mobile" : w <= 1024 ? "tablet" : "desktop");
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return bp;
}

/* ----------------------------- */
/* In-view title hook            */
/* ----------------------------- */
function useInViewTitle(options?: {
  rootMargin?: string;
  thresholds?: number[];
  minRatio?: number;
  minTopRatio?: number; // fraction of viewport from top (e.g., 0.2 = 20%)
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;

    let obs: IntersectionObserver | null = null;
    let rafId = 0;

    const arm = () => {
      if (obs) return;

      const {
        rootMargin = "0px 0px -35% 0px",
        thresholds = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
        minRatio = 0.6,
        minTopRatio = 0.2,
      } = options || {};

      obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const vh = entry.rootBounds?.height ?? window.innerHeight;
            const top = entry.boundingClientRect.top;
            const ratio = entry.intersectionRatio;
            const deepEnough = ratio >= minRatio && top >= vh * minTopRatio;
            if (deepEnough) {
              setInView(true);
              obs?.disconnect();
              obs = null;
              break;
            }
          }
        },
        { rootMargin, threshold: thresholds }
      );

      rafId = requestAnimationFrame(() => {
        if (ref.current) obs?.observe(ref.current);
      });
    };

    const afterFonts = () => arm();
    if ("fonts" in document && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(afterFonts).catch(afterFonts);
    } else {
      afterFonts();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      obs?.disconnect();
      obs = null;
    };
  }, [inView, options]);

  return { ref, inView };
}

const Me: React.FC = () => {
  const bp = useBreakpoint();

  // Scroll-triggered titles (match ProjectCard behavior)
  const approach = useInViewTitle({
    rootMargin: "0px 0px -35% 0px",
    thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
    minRatio: 0.6,
    minTopRatio: 0.2,
  });

  const favorites = useInViewTitle({
    rootMargin: "0px 0px -35% 0px",
    thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
    minRatio: 0.6,
    minTopRatio: 0.2,
  });

  // Image animation (same as hero)
  const heroImgAnim = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    startOnMount: true,
    rootMarginBottomPct: 14,
    delay: 0.18,
  };

  // Body appears noticeably later than the image
  const heroBodyAnim = {
    ...heroImgAnim,
    delay: 0.9, // clear gap after the image
  };

  // Card reveal
  const cardReveal = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 14,
  };

  if (!bp) return null;

  const isMobile = bp === "mobile";

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main aria-label="Me page" className="me-main">
        <div className="grid-container me-grid">
          {/* Title */}
          <div className="me-title-col">
            <h1
              className={
                // 👉 On mobile, reuse the exact Hero mobile title classes
                isMobile
                  ? "page-title hero-title hero-title--mobile me-title"
                  : "page-title me-title"
              }
            >
              <SplitText
                text="My design journey kicked off with late night sessions making football posters. That spark soon branched into digital products."
                splitType="words"
                delay={0.06}
                duration={0.7}
                ease="power3.out"
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign={isMobile ? "center" : "left"}
                groupPhrase={{
                  tokens: ["digital", "products"],
                  className: "gradient-group",
                }}
              />
            </h1>
          </div>

          {/* Image */}
          <div className="me-image-col">
            <AnimatedContent {...heroImgAnim}>
              <img className="me-image" src="/images/me/me.jpg" alt="Raoul Martens" />
            </AnimatedContent>
          </div>

          {/* Body — later */}
          <div className="me-body-col">
            <AnimatedContent {...heroBodyAnim}>
              <p className="me-body">
                Since then I’ve centred my practice on design thinking: observing, reframing, prototyping and
                testing until the problem is unmistakably clear. I begin every project by listening: mapping
                behaviours, emotions instead of jumping straight to pixels. From there I iterate fast—sketch,
                wireframe, clickable proof. Because ideas earn their keep only when real users respond to them.
              </p>
            </AnimatedContent>
          </div>

          {/* Approach Title */}
          <div className="me-approach-title-col">
            <div ref={approach.ref}>
              <h2 className="me-approach-title">
                {approach.inView ? (
                  <SplitText
                    text="My approach, from first spark to live product"
                    splitType="words"
                    delay={0.06}
                    duration={0.8}
                    ease="power3.out"
                    from={{ opacity: 0, y: 32 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0}
                    rootMargin="100% 0 100% 0"
                    textAlign="left"
                    startDelay={0.1}
                  />
                ) : (
                  <span className="invisible-placeholder">
                    My approach, from first spark to live product
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Process Cards */}
          <div
            className="me-cards-wrap"
            aria-label="Design process steps (grid on tablet & stacked on mobile)"
          >
            {[
              { idx: 1, title: "Empathize", body: "Real insight saves weeks of nice looking but useless UI.", iconClass: "mask-empathize" },
              { idx: 2, title: "Define", body: "Focus keeps scope tight and decisions easy to defend.", iconClass: "mask-define" },
              { idx: 3, title: "Ideate", body: "Quantity early, so quality can surface later.", iconClass: "mask-ideate" },
              { idx: 4, title: "Prototype", body: "Making it tangible turns opinions into evidence.", iconClass: "mask-prototype" },
              { idx: 5, title: "Iterate", body: "Each loop nudges the product closer to effortless.", iconClass: "mask-iterate" },
            ].map((c, i) => (
              <AnimatedContent key={c.idx} {...cardReveal} delay={i * 0.06}>
                <div className="me-card hb-card">
                  <div className={`hb-card-icon ${c.iconClass}`} />
                  <h5>{c.title}</h5>
                  <p>{c.body}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* Favorites Title */}
          <div className="me-favorites-title-col">
            <div ref={favorites.ref}>
              <h2 className="me-favorites-title">
                {favorites.inView ? (
                  <SplitText
                    text="A few things I live for"
                    splitType="words"
                    delay={0.06}
                    duration={0.8}
                    ease="power3.out"
                    from={{ opacity: 0, y: 32 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0}
                    rootMargin="100% 0 100% 0"
                    textAlign="right"
                    startDelay={0.1}
                  />
                ) : (
                  <span className="invisible-placeholder">A few things I live for</span>
                )}
              </h2>
            </div>
          </div>

          {/* Favorites Cards */}
          <div className="me-favorites-cards">
            {[
              {
                title: "Football’s rhythm",
                body:
                  "I grew up with a ball at my feet, and the sport still resets my head. Strategy, teamwork, split-second decisions, exactly the muscles I use in product design, just covered in grass stains and echoing with last-minute cheers.",
                iconClass: "mask-football",
              },
              {
                title: "Curious making",
                body:
                  "Give me a blank canvas, Figma frame, Blender scene and I’ll fill it. I love turning half formed ideas into visuals people can react to, whether that’s a micro interaction in an app or a poster that lives on a bedroom wall.",
                iconClass: "mask-hammer",
              },
              {
                title: "Stories on screen",
                body:
                  "Films and narrative driven games fascinate me. I pause, rewind, dissect pacing, colour and sound design the way some people study code. It keeps my sense of storytelling sharp.",
                iconClass: "mask-macbook",
              },
              {
                title: "Analogue moments",
                body:
                  "I shoot 35 mm photos to slow down. Waiting for a roll to develop reminds me that not everything should be instant, and that patience often rewards with richer results.",
                iconClass: "mask-camera",
              },
            ].map((f, i) => (
              <AnimatedContent key={i} {...cardReveal} delay={i * 0.06}>
                <div className="me-card me-fav-card">
                  <div className={`me-card-icon ${f.iconClass}`} />
                  <h5>{f.title}</h5>
                  <p>{f.body}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Me;
