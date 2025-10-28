import React from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import AnimatedContent from "../components/common/AnimatedContent";
import SplitText from "../components/common/SplitText";

type GalleryItem = { src: string; alt: string };

/* ----------------------------- */
/* Breakpoint hook (match Hero)  */
/* ----------------------------- */
type BP = "mobile" | "tablet" | "desktop";
function useBreakpoint(): BP | null {
  const [bp, setBp] = React.useState<BP | null>(null);
  React.useEffect(() => {
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

const GALLERY_MAIN: GalleryItem[] = [
  { src: "/images/play/football-psg.jpg", alt: "Creative scene with players" },
  { src: "/images/play/football-euros.jpg", alt: "Retro sports composite" },
  { src: "/images/play/football-messi.jpg", alt: "Trophies portrait" },
  { src: "/images/play/football-haaland.jpg", alt: "Sails and atmosphere" },
  { src: "/images/play/football-mbappe.jpg", alt: "Tower and sky vortex" },
  { src: "/images/play/football-championsleague.jpg", alt: "Golden trophy composition" },
  { src: "/images/play/football-liverpool.jpg", alt: "Juventus match moment" },
  { src: "/images/play/football-messi-space.png", alt: "Barcelona celebration" },
  { src: "/images/play/football-italy.jpg", alt: "Real Madrid intensity" },
];

const GALLERY_WIDE: GalleryItem[] = [
  { src: "/images/play/collabassa-ver.jpg", alt: "Dutch orange crowd" },
  { src: "/images/play/utrecht-gebouw.jpg", alt: "Italy team spirit" },
];

const GALLERY_SQUARE: GalleryItem[] = [
  { src: "/images/play/kerk-plafond.jpg", alt: "Square image 1" },
  { src: "/images/play/poemba.jpg", alt: "Square image 2" },
  { src: "/images/play/boom-closeup.jpg", alt: "Square image 3" },
  { src: "/images/play/toverland-paard.jpg", alt: "Square image 4" },
];

const GALLERY_MIX = {
  horizontal: { src: "/images/play/venlo-station.jpg", alt: "Mixed row horizontal" },
  vertical: { src: "/images/play/italie-bruggen.jpg", alt: "Mixed row vertical" },
};

const GALLERY_VERTICALS: GalleryItem[] = [
  { src: "/images/play/antwerpen-tram.jpg", alt: "Vertical image 1" },
  { src: "/images/play/italie-uitzicht.jpg", alt: "Vertical image 2" },
  { src: "/images/play/breda-cathedraal.jpg", alt: "Vertical image 3" },
];

const GALLERY_SQ_WIDE = {
  square: { src: "/images/play/nina-sissy.jpg", alt: "Row square image" },
  horizontal: { src: "/images/play/rund-in-bos.jpg", alt: "Row horizontal image" },
};

const GALLERY_WIDE_2: GalleryItem[] = [
  { src: "/images/play/antwerpen-werk.jpg", alt: "Extra horizontal image 1" },
  { src: "/images/play/friet-scootmobiel.jpg", alt: "Extra horizontal image 2" },
];

/** Returns 1/2/3 columns to match CSS (<=767:1, 768–1024:2, >=1025:3) */
function getCols(): number {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 1025px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

const Play: React.FC = () => {
  const bp = useBreakpoint();
  if (!bp) return null;

  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  // Use the exact same Hero classes per breakpoint, but keep LEFT alignment
  const titleClass =
    bp === "desktop"
      ? "page-title hero-title play-title"
      : bp === "tablet"
      ? "page-title hero-title hero-title--tablet play-title"
      : "page-title hero-title hero-title--mobile play-title";

  const imgAnim = {
    distance: 80,
    direction: "vertical" as const,
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    initialOpacity: 0,
    animateOpacity: true,
  };

  const STAGGER_COL = 0.22;
  const LATE = new Set([3, 4, 5]);
  const VERY_LATE = new Set([6, 7, 8]);

  // compute once per render (fine for progressive delays)
  const colsMain = getCols();
  const headingId = "play-heading";

  return (
    <div className="viewport-wrapper">
      <Navigation />

      <main
        id="main-content"
        aria-label="Play page"
        className="play-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        {/* Title */}
        <section className="play-container">
          <div className="title-grid">
            <div className="title-col">
              <h1 id={headingId} className={titleClass}>
                <SplitText
                  text="Made with nothing but curiosity. Browse, enjoy, and see where creativity runs free."
                  splitType="words"
                  delay={0.06}
                  duration={0.7}
                  ease="power3.out"
                  from={{ opacity: 0, y: 28 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.2}
                  rootMargin="0px 0px -10% 0px"
                  textAlign="left" // always left aligned
                  groupPhrase={{ tokens: ["curiosity"], className: "gradient-group" }}
                />
              </h1>
            </div>
          </div>
        </section>

        {/* Main */}
        <section className="play-container gallery-container" aria-label="Image gallery">
          <div className="gallery">
            {GALLERY_MAIN.map(({ src, alt }, i) => {
              const isFirstRow = i < colsMain;
              const perRowIndex = i % colsMain;
              const delay = perRowIndex * STAGGER_COL;

              const rootMarginBottomPct = isFirstRow
                ? undefined
                : VERY_LATE.has(i)
                ? 6
                : LATE.has(i)
                ? 10
                : 16;

              return (
                <div key={i} className="tile">
                  <AnimatedContent
                    {...imgAnim}
                    startOnMount={isFirstRow}
                    rootMarginBottomPct={rootMarginBottomPct}
                    delay={delay}
                  >
                    <img className="tile-media" src={src} alt={alt} loading="lazy" />
                  </AnimatedContent>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wide */}
        <section className="play-container gallery-wide" aria-label="Wide image gallery">
          {GALLERY_WIDE.map(({ src, alt }, i) => (
            <div key={i} className="tile-wide">
              <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={(i % 2) * STAGGER_COL}>
                <img className="tile-media-wide" src={src} alt={alt} loading="lazy" />
              </AnimatedContent>
            </div>
          ))}
        </section>

        {/* Squares */}
        <section className="play-container gallery-square" aria-label="Square image gallery">
          {GALLERY_SQUARE.map(({ src, alt }, i) => (
            <div key={i} className="tile-square">
              <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={i * 0.18}>
                <img className="tile-media-square" src={src} alt={alt} loading="lazy" />
              </AnimatedContent>
            </div>
          ))}
        </section>

        {/* Mix */}
        <section className="play-container gallery-mix" aria-label="Mixed image row">
          <div className="mix-empty" />
          <div className="tile-mix mix-horizontal">
            <AnimatedContent {...imgAnim} rootMarginBottomPct={14}>
              <img src={GALLERY_MIX.horizontal.src} alt={GALLERY_MIX.horizontal.alt} loading="lazy" />
            </AnimatedContent>
          </div>
          <div className="tile-mix mix-vertical">
            <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={STAGGER_COL}>
              <img src={GALLERY_MIX.vertical.src} alt={GALLERY_MIX.vertical.alt} loading="lazy" />
            </AnimatedContent>
          </div>
        </section>

        {/* Verticals */}
        <section className="play-container gallery-verticals" aria-label="Vertical image gallery">
          {GALLERY_VERTICALS.map(({ src, alt }, i) => (
            <div key={i} className="tile-vertical">
              <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={i * 0.18}>
                <img className="tile-media-vertical" src={src} alt={alt} loading="lazy" />
              </AnimatedContent>
            </div>
          ))}
          <div className="tile-vertical mix-vertical">
            <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={3 * 0.18}>
              <img
                className="tile-media-vertical"
                src={GALLERY_MIX.vertical.src}
                alt={GALLERY_MIX.vertical.alt}
                loading="lazy"
              />
            </AnimatedContent>
          </div>
        </section>

        {/* Square + Horizontal */}
        <section className="play-container gallery-sq-wide" aria-label="Square + Horizontal row">
          <div className="tile-sqw sqw-square">
            <AnimatedContent {...imgAnim} rootMarginBottomPct={14}>
              <img
                className="tile-media-sqw-square"
                src={GALLERY_SQ_WIDE.square.src}
                alt={GALLERY_SQ_WIDE.square.alt}
                loading="lazy"
              />
            </AnimatedContent>
          </div>
          <div className="sqw-empty" />
          <div className="tile-sqw sqw-horizontal">
            <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={STAGGER_COL}>
              <img
                className="tile-media-sqw-horizontal"
                src={GALLERY_SQ_WIDE.horizontal.src}
                alt={GALLERY_SQ_WIDE.horizontal.alt}
                loading="lazy"
              />
            </AnimatedContent>
          </div>
        </section>

        {/* Extra Wide */}
        <section className="play-container gallery-wide-2" aria-label="Extra wide image gallery">
          {GALLERY_WIDE_2.map(({ src, alt }, i) => (
            <div key={i} className="tile-wide-2">
              <AnimatedContent {...imgAnim} rootMarginBottomPct={14} delay={i * 0.22}>
                <img className="tile-media-wide-2" src={src} alt={alt} loading="lazy" />
              </AnimatedContent>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Play;
