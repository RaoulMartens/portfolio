// src/pages/Me.tsx
import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";

/* ----------------------------- */
/* Breakpoint hook (SSR-safe)    */
/* ----------------------------- */
type BP = "mobile" | "tablet" | "desktop";

function useBreakpoint(): BP {
  // SSR: kies een veilige default
  const ssrSafeDefault: BP = "desktop";
  const getBP = () => {
    if (typeof window === "undefined") return ssrSafeDefault;
    const w = window.innerWidth;
    return w < 768 ? "mobile" : w <= 1024 ? "tablet" : "desktop";
  };

  const [bp, setBp] = useState<BP>(getBP);

  // layoutEffect om eerste paint jump te beperken
  useLayoutEffect(() => {
    setBp(getBP());
  }, []);

  useEffect(() => {
    const onResize = () => setBp(getBP());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

/* ----------------------------- */
/* In-view title hook (hardened) */
/* ----------------------------- */
function useInViewTitle(params?: {
  rootMargin?: string;
  thresholds?: number[];
  minRatio?: number;
  minTopRatio?: number; // 0..1 vh
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  const {
    rootMargin,
    thresholds,
    minRatio,
    minTopRatio,
  } = useMemo(
    () => ({
      rootMargin: params?.rootMargin ?? "0px 0px -15% 0px",
      thresholds: params?.thresholds ?? [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
      minRatio: params?.minRatio ?? 0.2,
      minTopRatio: params?.minTopRatio ?? 0.1,
    }),
    [params?.rootMargin, params?.thresholds, params?.minRatio, params?.minTopRatio]
  );

  useEffect(() => {
    if (inView) return;
    if (typeof window === "undefined") { setInView(true); return; }

    let obs: IntersectionObserver | null = null;
    let rafId = 0;

    const start = () => {
      if (!ref.current) return;
      obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const vh = entry.rootBounds?.height ?? window.innerHeight;
            const top = entry.boundingClientRect.top;
            const ratio = entry.intersectionRatio;
            if (ratio >= minRatio && top >= vh * minTopRatio) {
              setInView(true);
              obs?.disconnect();
              obs = null;
              break;
            }
          }
        },
        { rootMargin, threshold: thresholds }
      );
      rafId = requestAnimationFrame(() => ref.current && obs?.observe(ref.current));
    };

    // Wacht op fonts voor stabiele bounds
    const ready = (document as any).fonts?.ready;
    if (ready && typeof ready.then === "function") {
      ready.then(start).catch(start);
    } else {
      start();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      obs?.disconnect();
      obs = null;
    };
  }, [inView, rootMargin, thresholds, minRatio, minTopRatio]);

  return { ref, inView };
}

const Me: React.FC = () => {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const headingId = "me-heading";

  // Titels liften pas in als ze in view zijn
  const approach = useInViewTitle({
    rootMargin: "0px 0px -15% 0px",
    thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
    minRatio: 0.2,
    minTopRatio: 0.1,
  });
  const favorites = useInViewTitle({
    rootMargin: "0px 0px -15% 0px",
    thresholds: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
    minRatio: 0.2,
    minTopRatio: 0.1,
  });

  // Animatieprofielen
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
  const heroBodyAnim = { ...heroImgAnim, delay: 0.9 };

  const cardReveal = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 14,
  };

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main
        id="main-content"
        aria-label="Me page"
        className="me-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        <div className="grid-container me-grid">
          {/* Titel */}
          <div className="me-title-col">
            <h1
              id={headingId}
              className={
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
                textAlign="left"
                groupPhrase={{ tokens: ["digital", "products"], className: "gradient-group" }}
              />
            </h1>
          </div>

          {/* Afbeelding */}
          <div className="me-image-col">
            <AnimatedContent {...heroImgAnim}>
              <img
                className="me-image"
                src="/images/me/me.webp"
                alt="Raoul Martens standing and smiling on a bridge between two modern buildings, with a geometric green-covered high-rise in the background."
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            </AnimatedContent>
          </div>

          {/* Body */}
          <div className="me-body-col">
            <AnimatedContent {...heroBodyAnim}>
              <p className="me-body">
                Since then, I’ve started to shape my practice more around design thinking. For me, it starts with listening and really trying to understand behaviour, emotions and what’s actually going on beneath the surface. Only after that do I move into sketches, wireframes and prototypes, testing ideas early to see how real users respond.
              </p>
            </AnimatedContent>
          </div>

          {/* Approach Title */}
          <div className="me-approach-title-col">
            <div ref={approach.ref}>
              <h2 className="me-approach-title">
                {approach.inView ? (
                  <SplitText
                    text="How I work, from first idea to live product"
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
                  <span className="invisible-placeholder" aria-hidden="true">
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
              { idx: 1, title: "Empathize", body: "If you miss what people actually need, you can easily spend weeks making the wrong thing look good.", iconClass: "mask-empathize" },
              { idx: 2, title: "Define", body: "Defining the problem well keeps things from drifting and gives your decisions a good reason.", iconClass: "mask-define" },
              { idx: 3, title: "Ideate", body: "You have to get past the obvious ideas before the interesting ones start to come.", iconClass: "mask-ideate" },
              { idx: 4, title: "Prototype", body: "Once an idea is visible and usable, feedback gets a lot more useful.", iconClass: "mask-prototype" },
              { idx: 5, title: "Iterate", body: "Each version gets you closer to something that feels obvious in the best way.", iconClass: "mask-iterate" },
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
                  <span className="invisible-placeholder" aria-hidden="true">
                    A few things I live for
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Favorites Cards */}
          <div className="me-favorites-cards">
            {[
              {
                title: "Football",
                body:
                  "I grew up playing football, and it still helps me clear my head. A lot of what I like about it: strategy, teamwork, reacting quickly, is also what I enjoy in design. It just happens on a pitch instead of behind a screen.",
                iconClass: "mask-football",
              },
              {
                title: "Always curious",
                body:
                  "At the core, I just love creating. If it’s visual, I’m interested. Graphic design, editing, interfaces, motion, apps. I like building things that start as an idea and slowly become real.",
                iconClass: "mask-hammer",
              },
              {
                title: "Stories on screen",
                body:
                  "I like stories that are told visually. Films and narrative games pull me in because every detail matters: timing, atmosphere, sound, colour. I enjoy picking those things apart and understanding how they create emotion.",
                iconClass: "mask-macbook",
              },
              {
                title: "Analogue photography",
                body:
                  "I shoot on film it forces me to slow down. You take the photo, then you wait, and that waiting is part of it. It reminds me that not everything needs to be instant to be good.",
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
