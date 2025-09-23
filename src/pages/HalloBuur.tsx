// src/pages/HalloBuur.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";

/* =========================================================
   LottieBox v6 — .json/.lottie player (iOS/Safari hardened)
   - Fallback CDN + timeout voor webcomponent load
   - Autoplay op dotlottie-player + iOS double-play nudge
   - Soepelere IntersectionObserver thresholds op mobiel
   - Poster zichtbaar tot 'ready'
   ========================================================= */

let dotlottieReadyPromise: Promise<void> | null = null;
function ensureDotLottieDefined(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("dotlottie-player")) return Promise.resolve();

  if (!dotlottieReadyPromise) {
    dotlottieReadyPromise = new Promise<void>((resolve) => {
      const loadWith = (src: string, onFail?: () => void) => {
        const s = document.createElement("script");
        s.type = "module";
        s.src = src;
        s.onload = () =>
          customElements.whenDefined("dotlottie-player").then(() => resolve());
        s.onerror = () => (onFail ? onFail() : resolve());
        document.head.appendChild(s);
      };

      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // 1) unpkg → 2) jsDelivr → 3) timeout safety net (Safari)
      loadWith(
        "https://unpkg.com/@dotlottie/player-component/dist/dotlottie-player.mjs",
        () =>
          loadWith(
            "https://cdn.jsdelivr.net/npm/@dotlottie/player-component/dist/dotlottie-player.mjs",
            done
          )
      );
      setTimeout(done, 1800);
    });
  }
  return dotlottieReadyPromise;
}

const jsonWarmCache = new Set<string>();
let lottieModule: any | null = null;

const runIdle = (fn: () => void) => {
  // @ts-ignore
  if (typeof requestIdleCallback === "function")
    (requestIdleCallback as any)(fn, { timeout: 1200 });
  else setTimeout(fn, 120);
};

const deviceMemory = (() => {
  const dm = (navigator as any).deviceMemory;
  return typeof dm === "number" ? dm : 8;
})();

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isIOS =
  typeof navigator !== "undefined" &&
  (/iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

const LottieBox: React.FC<{
  src: string;
  loop?: boolean;
  className?: string;
  poster?: string;
}> = ({ src, loop = true, className, poster }) => {
  const isDot = /\.lottie(\?|#|$)/i.test(src);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const instRef = useRef<any>(null);
  const createdOnceRef = useRef(false);

  const [preloaded, setPreloaded] = useState(false);
  const [readyToShow, setReadyToShow] = useState(prefersReducedMotion);

  const renderer = useMemo<"svg" | "canvas">(() => {
    if (typeof window === "undefined") return "svg";
    const smallScreen = window.matchMedia("(max-width: 1024px)").matches;
    const lowMem = deviceMemory < 6;
    return smallScreen || lowMem ? "canvas" : "svg";
  }, []);

  // Optioneel: pauzeren bij tab-weg en hervatten bij terugkeren
  useEffect(() => {
    const onVis = () => {
      if (!instRef.current) return;
      if (document.hidden) instRef.current.pause?.();
      else instRef.current.play?.();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    let mounted = true;

    let warmObs: IntersectionObserver | null = null;
    let createObs: IntersectionObserver | null = null;
    let playObs: IntersectionObserver | null = null;

    if (prefersReducedMotion) {
      setPreloaded(true);
      setReadyToShow(true);
      return () => {};
    }

    const warm = async () => {
      try {
        if (!jsonWarmCache.has(src)) {
          await fetch(src, { cache: "force-cache" }).catch(() => {});
          jsonWarmCache.add(src);
        }
        if (isDot) {
          await ensureDotLottieDefined();
        } else if (!lottieModule) {
          const mod = await import("lottie-web/build/player/lottie_light");
          lottieModule = (mod as any).default ?? mod;
          if (deviceMemory <= 2) lottieModule.setQuality("low");
          else if (deviceMemory <= 4) lottieModule.setQuality("medium");
          else lottieModule.setQuality("high");
        }
        if (mounted) setPreloaded(true);
      } catch {}
    };

    warmObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          warmObs?.disconnect();
          runIdle(warm);
        }
      },
      { root: null, rootMargin: "1200px 0px", threshold: 0 }
    );
    warmObs.observe(el);

    createObs = new IntersectionObserver(
      async (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (!entry || !holderRef.current) return;

        if (createdOnceRef.current) {
          createObs?.disconnect();
          return;
        }
        createdOnceRef.current = true;
        createObs?.disconnect();

        if (isDot) {
          await ensureDotLottieDefined();
          if (!mounted || !holderRef.current) return;

          const player = document.createElement("dotlottie-player") as any;
          player.setAttribute("src", src);
          player.setAttribute("loop", loop ? "true" : "false");
          player.setAttribute("autoplay", "true"); // laat de component zelf starten
          player.setAttribute("background", "transparent");
          // geen 'renderer' attribuut op dotlottie-player (kan verwarren)
          player.className = "hb-lottie-el";
          holderRef.current.appendChild(player);

          const onReady = () => {
            setReadyToShow(true);

            if (isIOS) {
              // iOS Safari duwtje: play → korte pause → opnieuw play
              try {
                player.seek?.(0);
                player.play?.();
                setTimeout(() => player.pause?.(), 24);
                setTimeout(() => player.play?.(), 48);
              } catch {}
            } else {
              requestAnimationFrame(() => {
                try {
                  player.play?.();
                } catch {}
              });
            }

            player.removeEventListener?.("ready", onReady);
          };
          player.addEventListener?.("ready", onReady);

          instRef.current = player;
        } else {
          if (!lottieModule) {
            const mod = await import("lottie-web/build/player/lottie_light");
            lottieModule = (mod as any).default ?? mod;
            if (deviceMemory <= 2) lottieModule.setQuality("low");
            else if (deviceMemory <= 4) lottieModule.setQuality("medium");
            else lottieModule.setQuality("high");
          }
          if (!mounted || !holderRef.current) return;

          if (instRef.current) {
            instRef.current.destroy?.();
            instRef.current = null;
          }

          instRef.current = lottieModule.loadAnimation({
            container: holderRef.current,
            renderer,
            loop,
            autoplay: false,
            path: src,
            rendererSettings: {
              progressiveLoad: true,
              hideOnTransparent: true,
              preserveAspectRatio: "xMidYMid meet",
              clearCanvas: true,
            },
          });

          const onDomLoaded = () => {
            setReadyToShow(true);
            requestAnimationFrame(() => {
              try {
                instRef.current?.play?.();
              } catch {}
            });
            instRef.current?.removeEventListener?.("DOMLoaded", onDomLoaded);
          };
          instRef.current?.addEventListener?.("DOMLoaded", onDomLoaded);
        }

        // Soepelere zichtbaarheid op iOS (adresbalk/viewport jumps)
        playObs = new IntersectionObserver(
          (es) => {
            const me = es.find((e) => e.target === holderRef.current);
            if (!me || !instRef.current) return;

            const ratio = me.intersectionRatio ?? 0;
            const rect = me.boundingClientRect;
            const vh = (me.rootBounds?.height ?? window.innerHeight) || 0;

            const minRatio = isIOS ? 0.12 : 0.35;
            const topLimit = isIOS ? -1.2 * vh : -0.8 * vh;

            const visibleEnough = ratio >= minRatio && rect.top > topLimit;

            if (visibleEnough) {
              if (isDot) instRef.current.play?.();
              else if (instRef.current.isPaused) instRef.current.play();
            } else {
              if (isDot) instRef.current.pause?.();
              else if (!instRef.current.isPaused) instRef.current.pause();
            }
          },
          { root: null, rootMargin: "0px", threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1] }
        );
        if (holderRef.current) playObs.observe(holderRef.current);
      },
      { root: null, rootMargin: "400px 0px", threshold: [0] }
    );
    createObs.observe(el);

    return () => {
      warmObs?.disconnect();
      createObs?.disconnect();
      playObs?.disconnect();
      if (instRef.current) {
        instRef.current.destroy?.(); // lottie-web only; webcomponent negeert dit
        try {
          (holderRef.current as any)?.removeChild?.(instRef.current);
        } catch {}
        instRef.current = null;
      }
    };
  }, [src, renderer, loop]);

  return (
    <div
      ref={holderRef}
      className={`hb-lottie-holder ${readyToShow ? "is-ready" : ""} ${prefersReducedMotion ? "is-rm" : ""} ${className ?? ""}`}
      aria-busy={!preloaded && !prefersReducedMotion}
    >
      {poster && (!readyToShow || prefersReducedMotion) && (
        <img
          src={poster}
          alt=""
          className="hb-poster"
          decoding="async"
          loading="lazy"
          fetchPriority="low"
        />
      )}
    </div>
  );
};

/* ------------ Left→Right grow divider ------------ */
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
            if (delayMs > 0) el.style.setProperty("--hb-rule-delay", `${Math.max(0, delayMs)}ms`);
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

  return <div ref={ref} className="hb-rule hb-rule-anim" role="separator" aria-hidden="true" />;
};

const HalloBuur: React.FC = () => {
  const lottieReveal = {
    distance: 60,
    direction: "vertical" as const,
    duration: 0.7,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 28,
  };

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

  const textReveal = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
    rootMarginBottomPct: 14,
  };

  const STAGGER = 0.18;

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main className="hb-main" aria-label="Hallo Buur case study">
        <section className="hb-container">
          {/* HEADER */}
          <div className="hb-grid cv-auto">
            <div className="hb-content">
              <h5 className="hb-title">
                <SplitText
                  text="Hallo Buur"
                  splitType="words"
                  delay={0.06}
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 28 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
                />
              </h5>

              <p className="hb-subtitle">
                <SplitText
                  text="Community building through a digital bulletin board."
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

              <div className="hb-hero">
                <AnimatedContent {...heroImgAnim}>
                  <img
                    src="/images/hallo-buur/preview.jpg"
                    alt="Hallo Buur — hero"
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                    className="hb-hero-img"
                  />
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* INTRODUCTION */}
          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Introduction</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    In a residential complex where the elderly used to make up the majority,
                    the population is now shifting. Young people and newcomers&nbsp;are moving in.
                    This transition has led to a social disconnect. Older residents often feel ignored,
                    while newer ones feel unwelcome. These assumptions feed into a spiral of misunderstanding,
                    preventing natural contact.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="hb-grid cv-media">
            <div className="hb-followup">
              <AnimatedContent {...lottieReveal}>
                <img
                  src="/images/hallo-buur/problem.jpg"
                  alt="Hallo Buur — follow up visual"
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                  className="hb-followup-img"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* PROBLEM */}
          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Problem</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    While both groups express a need for contact, neither feels comfortable taking the first step.
                    The building lacks a low threshold system to spark interactions or create visibility around shared interests.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="hb-grid">
            <div className="hb-divider">
              <RuleGrow />
            </div>
          </div>

          {/* RESEARCH */}
          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Research</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    Getting residents to open up about their social struggles wasn’t easy.
                    In the early phase of the project, I conducted a cultural probe study and a co-creation
                    session to uncover the underlying reasons behind the lack of social interaction in the building.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* CARDS (group 1) */}
          <div className="hb-grid cv-auto">
            <div className="hb-cards">
              {[
                {
                  title: "Conversation anxiety",
                  body:
                    "Residents often avoid initiating contact out of fear of being judged or rejected. This makes casual conversations feel risky instead of natural.",
                  iconClass: "mask-ghost",
                },
                {
                  title: "Silent assumptions",
                  body:
                    "Older residents assume newcomers aren’t interested in them, while newer residents feel like outsiders. These silent assumptions fuel a cycle of avoidance.",
                  iconClass: "mask-barrier",
                },
                {
                  title: "Dormant spaces",
                  body:
                    "Although there are shared areas, interactions rarely happen spontaneously. Without a clear invitation or reason to connect, most residents stick to their routines.",
                  iconClass: "mask-suitcase",
                },
              ].map((c, i) => (
                <AnimatedContent key={i} {...textReveal} delay={i * 0.06}>
                  <div className="hb-card">
                    <div className={`hb-card-icon ${c.iconClass}`} />
                    <h5>{c.title}</h5>
                    <p>{c.body}</p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>

          {/* DIVIDER 2 */}
          <div className="hb-grid">
            <div className="hb-divider-2">
              <RuleGrow />
            </div>
          </div>

          {/* SOLUTION */}
          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Solution</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    The Digital Bulletin Board lowers the threshold for initiating contact between residents. It provides a simple and approachable way to express needs, share activities, and offer help. Making the first step toward connection easier. While the interaction starts digitally, the goal is to encourage real-life encounters and build a stronger sense of community within the complex.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* DIVIDER 3 */}
          <div className="hb-grid">
            <div className="hb-divider-3">
              <RuleGrow />
            </div>
          </div>

          {/* TEXT + LOTTIES */}
          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Create an Account</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    Residents can quickly set up a profile by entering their name, house number, and language preference. This simple onboarding step ensures that each post or response comes from a real person in the building, building trust without oversharing.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="hb-grid cv-media">
            <div className="hb-lottie">
              <AnimatedContent {...lottieReveal}>
                <div className="hb-lottie-wrap" aria-label="Create an account animation">
                  <LottieBox
                    src="/videos/hallo-buur/create-an-account.lottie"
                    poster="/images/hallo-buur/posters/create-an-account.jpg"
                  />
                </div>
              </AnimatedContent>
            </div>
          </div>

          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Post an Activity</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    Residents can add events, questions, or small favours in the form of digital post-its. These are instantly placed on the shared board, making it easy for others to see and engage.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="hb-grid cv-media">
            <div className="hb-lottie hb-lottie-2">
              <AnimatedContent {...lottieReveal}>
                <div className="hb-lottie-wrap" aria-label="Post a note animation">
                  <LottieBox
                    src="/videos/hallo-buur/post-an-activity.lottie"
                    poster="/images/hallo-buur/posters/post-an-activity.jpg"
                  />
                </div>
              </AnimatedContent>
            </div>
          </div>

          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Responding to a Request</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    The sort button helps residents quickly find something that suits them. By separating questions from activities, the board becomes easier to navigate and respond to. When someone replies to a request, the original poster receives a notification. Making real-life contact possible.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="hb-grid cv-media">
            <div className="hb-lottie hb-lottie-3">
              <AnimatedContent {...lottieReveal}>
                <div className="hb-lottie-wrap" aria-label="Join an activity animation">
                  <LottieBox
                    src="/videos/hallo-buur/responding-to-a-request.lottie"
                    poster="/images/hallo-buur/posters/responding-to-a-request.jpg"
                  />
                </div>
              </AnimatedContent>
            </div>
          </div>

          <div className="hb-block cv-auto">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Manage Profile Settings</h5>
                </AnimatedContent>
              </div>
              <div className="hb-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    In a community where people come from different backgrounds, it's important that residents feel in control of how they present themselves. The settings allow them to adjust their avatar, language, and more accessibility features, helping them feel safe, respected, and more confident when taking the first step toward connection.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="hb-grid cv-media">
            <div className="hb-lottie hb-lottie-4">
              <AnimatedContent {...lottieReveal}>
                <div className="hb-lottie-wrap" aria-label="Ongoing connection animation">
                  <LottieBox
                    src="/videos/hallo-buur/manage-profile-settings.lottie"
                    poster="/images/hallo-buur/posters/manage-profile-settings.jpg"
                  />
                </div>
              </AnimatedContent>
            </div>
          </div>

          {/* Title-only */}
          <div className="hb-block hb-title-only">
            <div className="hb-block-grid">
              <div className="hb-block-title">
                <AnimatedContent {...textReveal}>
                  <h5>Learnings</h5>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* CARDS (group 2) */}
          <div className="hb-grid">
            <div className="hb-cards-2" aria-label="Learnings">
              {[
                { title: "Assumption barriers", body: "Co-creation helped uncover hidden beliefs between residents.", iconClass: "mask-hidden" },
                { title: "Contact, not connection", body: "Real interaction happens offline, the app just opens the door.", iconClass: "mask-door" },
                { title: "Small barriers matter", body: "Even tiny obstacles can prevent people from connecting. Simplicity makes a difference.", iconClass: "mask-barrier" },
                { title: "Accessibility is key", body: "Simple flows and a Help Centre made the app usable for everyone.", iconClass: "mask-access" },
                { title: "People want control", body: "Balancing visibility and privacy builds trust.", iconClass: "mask-joystick" },
              ].map((c, i) => (
                <AnimatedContent key={i} {...textReveal} delay={i * 0.06}>
                  <div className="hb-card">
                    <div className={`hb-card-icon ${c.iconClass}`} />
                    <h5>{c.title}</h5>
                    <p>{c.body}</p>
                  </div>
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

export default HalloBuur;
