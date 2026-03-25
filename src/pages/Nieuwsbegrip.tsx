// src/pages/Nieuwsbegrip.tsx
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

/* Left→Right grow divider (same logic as HalloBuur) */
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

  return <div ref={ref} className="np-rule np-rule-anim" role="separator" aria-hidden="true" />;
};

const Nieuwsbegrip: React.FC = () => {
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
  const headingId = "nieuwsbegrip-heading";

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main
        id="main-content"
        aria-label="Nieuwsbegrip case study"
        className="np-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        <section className="np-container">
          {/* HEADER */}
          <div className="np-grid">
            <div className="np-content">
              <h1 id={headingId} className="np-title">
                <SplitText
                  text="Nieuwsbegrip"
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

              <p className="np-subtitle">
                <SplitText
                  text="A fresh take on the news-based reading comprehension method."
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

          {/* DIVIDER 1 */}
          <div className="np-grid np-divider-wrap">
            <div className="np-divider">
              <RuleGrow />
            </div>
          </div>

          {/* INTRODUCTION */}
          <div className="np-block">
            <div className="np-block-grid">
              <div className="np-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Introduction</h5>
                </AnimatedContent>
              </div>
              <div className="np-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    How can we make teaching easier in an already demanding classroom environment? That was the
                    question my team and I set out to answer when we were challenged to redesign Nieuwsbegrip. A
                    widely used platform that helps teachers improve students reading ability through weekly
                    news-based lessons. Working in a team of five, we applied the IDEO design
                    thinking process to develop a renewed concept specifically tailored to teachers. Through multiple
                    iterations, co-creative sessions, and user testing with educators, we created a more intuitive experience that helps teachers focus on what they do best.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* DIVIDER 2 */}
          <div className="np-grid">
            <div className="np-divider">
              <RuleGrow />
            </div>
          </div>

          {/* CONTEXT */}
          <div className="np-block">
            <div className="np-block-grid">
              <div className="np-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Context</h5>
                </AnimatedContent>
              </div>
              <div className="np-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    Although the platform offers a lot of content, many teachers run into problems while using it. They described the experience as cluttered, unclear, and hard to navigate, especially when preparing lessons. Our redesign focused on making that process feel simpler, from logging in and finding the right texts to planning and assigning lessons in a way that better fits their daily workflow.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* STACKED IMAGES */}
          <div className="np-grid">
            <div className="np-images">
              {[
                {
                  src: "/images/nieuwsbegrip/image-1.webp",
                  alt:
                    "Laptop mockup showing the redesigned Nieuwsbegrip interface with the ‘Week 17’ lesson overview and navigation menu on the left side.",
                },
                {
                  src: "/images/nieuwsbegrip/image-2.webp",
                  alt:
                    "Laptop mockup displaying the redesigned Nieuwsbegrip dashboard with quick access tiles for lessons, digital board, and workflows.",
                },
                {
                  src: "/images/nieuwsbegrip/image-3.webp",
                  alt:
                    "Two laptops showing the redesigned Nieuwsbegrip student management pages, with class lists and settings for individual learners.",
                },
                {
                  src: "/images/nieuwsbegrip/image-4.webp",
                  alt:
                    "Laptop mockup showing the redesigned Nieuwsbegrip archive page with a list of past lessons and filters for strategies and saved materials.",
                },
                {
                  src: "/images/nieuwsbegrip/image-5.webp",
                  alt:
                    "Laptop mockup displaying the redesigned Nieuwsbegrip results page with performance graphs showing student test scores over time.",
                },
                {
                  src: "/images/nieuwsbegrip/image-6.webp",
                  alt:
                    "Two laptops showing redesigned Nieuwsbegrip pages: one with student test results for a speed test block, and the other with extra lesson materials and quizzes.",
                },
              ].map(({ src, alt }, i) => (
                <AnimatedContent key={i} {...imageReveal} delay={i * 0.1}>
                  <figure className="np-image">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Nieuwsbegrip;
