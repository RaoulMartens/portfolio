// src/pages/HalloBuur2.tsx
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

/* Left→Right grow divider (same as other pages) */
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

  return <div ref={ref} className="hb2-rule hb2-rule-anim" role="separator" aria-hidden="true" />;
};

const HalloBuur2: React.FC = () => {
  /* --- animations (match HalloBuur feel) --- */
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
  const heroImgAnim = {
    ...imageReveal,
    distance: 80,
    duration: 0.8,
    startOnMount: true,
    delay: 0.18,
  };
  const STAGGER = 0.18;

  const headingId = "hallo-buur-2-heading";

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main
        id="main-content"
        aria-label="Hallo Buur 2 case study"
        className="hb2-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        <section className="hb2-container">
          {/* HEADER */}
          <div className="grid hb2-grid">
            <div className="hb2-content">
              <h1 id={headingId} className="hb2-title">
                <SplitText
                  text="Understanding community change"
                  splitType="words"
                  delay={0.06}                 // ✅ fixed (was 60)
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 28 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
                />
              </h1>

              <p className="hb2-subtitle">
                <SplitText
                  text="Researching social connection in a shifting residential community."
                  splitType="words"
                  delay={0.06}                 // ✅ fixed (was 60)
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 24 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
                  startDelay={0.15}            // subtle trail after title
                />
              </p>

              <div className="hb2-hero">
                <AnimatedContent {...heroImgAnim}>
                  <img
                    className="hb2-hero-img"
                    src="/images/hallo-buur2/hero.jpg"
                    alt="Hallo Buur 2 — hero"
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                  />
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* TEXT BLOCK #1 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Introduction</h5>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    After various probes and observations, I discovered that elderly people do desire more
                    social contact but are not easily open to change. By conducting a co-creation session, I
                    gained insight into how deeply these desires are rooted and why they are unable to take
                    the first step themselves.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #1 */}
          <div className="grid hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-1.jpg"
                  alt="Hallo Buur 2 — board overview"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT BLOCK #2 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Context</h5>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    In a residential complex owned by Talis on Aubadestraat in Nijmegen, many elderly people
                    live. Until recently, the complex had a 65-plus label, but this has since been removed.
                    This means that the number of elderly residents is decreasing, and this gap is not being
                    filled for the time being. Increasingly, young and foreign people are moving in. The older
                    residents miss the sense of community they once had and would like to have more contact
                    with the new residents.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* DIVIDER — grow left → right */}
          <div className="grid hb2-grid">
            <div className="hb2-divider">
              <RuleGrow />
            </div>
          </div>

          {/* TITLE + TWO CARDS */}
          <div className="hb2-block hb2-title-only">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Why a Co-Creation?</h5>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="grid hb2-grid">
            <div className="grid hb2-cards-right">
              {[
                {
                  title: "Needs and desires",
                  body:
                    "By actively thinking along and sharing their ideas, participants provide me, as a researcher, " +
                    "with a better and more nuanced understanding of their actual needs, values, and desires.",
                  iconClass: "mask-shopping-bag",
                },
                {
                  title: "Depth",
                  body:
                    "Where traditional methods such as surveys or interviews are often structured and more superficial, " +
                    "co-creation allows for open exploration and deeper conversations. This brings hidden insights and emotions to light.",
                  iconClass: "mask-triangle",
                },
              ].map((c, i) => (
                <AnimatedContent key={i} {...textReveal} delay={i * 0.06}>
                  <div className="hb2-card">
                    <div className={`hb2-card-icon ${c.iconClass}`} />
                    <h5>{c.title}</h5>
                    <p>{c.body}</p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>

          {/* DIVIDER — grow left → right */}
          <div className="grid hb2-grid">
            <div className="hb2-divider">
              <RuleGrow />
            </div>
          </div>

          {/* TEXT BLOCK #3 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>The Co-Creation</h5>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    I started by sharing the results of a previously conducted cultural probe. It quickly became
                    clear that the residents had already reviewed these results themselves. This demonstrates their
                    curiosity and their willingness to occasionally cross ethical boundaries to satisfy this
                    curiosity. After discussing the results, I asked why they think some residents don’t come to
                    the common area, and why others do. It became apparent that they believe those who don’t come
                    have a negative perception of them. The level of distrust among residents is significant.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #2 */}
          <div className="grid hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-2.jpg"
                  alt="Hallo Buur 2 — posting flow"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT (no title) #4 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal}>
                  <p>
                    Some residents aren’t affected by the negativity and even suggest solutions—for instance,
                    displaying positive feedback at the building’s entrance to highlight what makes the common area
                    cozy. Still, tensions remain. One resident, who occasionally joins communal activities, recalled
                    being handed a paintbrush with the comment, “The paint will come later,” which, though humorous,
                    felt personal. This illustrates how negative remarks still impact residents and may contribute to
                    group divisions. To explore these dynamics further, I visited several residents to ask where they
                    live, how they relate to neighbours, which routes they take through the building, and where they
                    typically meet others—insights that may inform the design later.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #3 (hairline fix via CSS) */}
          <div className="grid hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image hb2-image--hairline-fix"
                  src="/images/hallo-buur2/wide-3.jpg"
                  alt="Hallo Buur 2 — sorting and filters"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT (no title) #5 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal}>
                  <p>
                    The next task was to create a discussion board. By asking the residents what they value about the
                    complex and letting them discuss it, we managed to reduce the negative thoughts from earlier. They
                    had a pleasant chat about previously organized activities and the experiences they had gained from
                    them.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #4 */}
          <div className="grid hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-4.jpg"
                  alt="Hallo Buur 2 — responses and confirmations"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT BLOCK #6 */}
          <div className="hb2-block">
            <div className="grid hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Result</h5>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    I then processed the results of this session into a neighbourhood value map. This serves as an
                    excellent addition to one of the earlier ideas from the co-creation session, where it was suggested
                    to hang the positive feedback at the entrance of the building. In this way, anyone entering the
                    building can immediately see the value of the community within the complex.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #5 — bottom gap to match other pages */}
          <div className="grid hb2-grid hb2-bottom-gap">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-5.jpg"
                  alt="Hallo Buur 2 — accessible patterns"
                />
              </AnimatedContent>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HalloBuur2;
