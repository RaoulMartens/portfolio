import React from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import AnimatedContent from "../components/common/AnimatedContent";
import SplitText from "../components/common/SplitText";

type GalleryItem = { src: string; alt: string };

/* ----------------------------- */
/* Breakpoint hook (zelfde als Hero) */
/* ----------------------------- */
// Houd bij welke schermgrootte actief is zodat de layout zich aanpast (6.2).
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
  { src: "/images/play/football-psg.jpg", alt: "Two PSG players in a dimly lit room strategize around a table with toy soldiers, a football, and the Champions League trophy, symbolizing tactical preparation and battle for victory." },
  { src: "/images/play/football-euros.jpg", alt: "Abstract artwork of a football team celebrating on the field, with distorted red and blue glitch effects and players’ faces replaced by digital eye patterns." },
  { src: "/images/play/football-messi.jpg", alt: "Lionel Messi in an Argentina jersey sits on a throne holding the World Cup trophy, surrounded by numerous golden Ballon d’Ors and championship cups under dramatic lighting." },
  { src: "/images/play/football-haaland.jpg", alt: "Erling Haaland wearing a Manchester City jersey sits in a Viking ship holding a glowing blue axe, surrounded by footballs, sailing toward a burning castle under a stormy sky." },
  { src: "/images/play/football-mbappe.jpg", alt: "Kylian Mbappe in a Paris Saint-Germain kit poses confidently with one foot on a ball beneath the Eiffel Tower, illuminated by dramatic lighting and a surreal, cinematic sky." },
  { src: "/images/play/football-championsleague.jpg", alt: "Football players from various European clubs stand on rocky cliffs under a glowing sky, facing a massive translucent Champions League trophy in the distance." },
  { src: "/images/play/football-liverpool.jpg", alt: "Liverpool players in red vintage biplanes marked with ‘YNWA’ and the club logo struggle as the planes begin crashing down through a fiery sunset sky." },
  { src: "/images/play/football-messi-space.png", alt: "Lionel Messi in a PSG kit stands triumphantly on a glowing planet in space, surrounded by floating debris and cosmic light, raising both hands toward the sky." },
  { src: "/images/play/football-italy.jpg", alt: "Italian football players celebrate a dramatic goal on the pitch with the words ‘The Italian way’ above them, set against a stylized blue graphic background." },
];

const GALLERY_WIDE: GalleryItem[] = [
  { src: "/images/play/collabassa-ver.jpg", alt: "View of a small Italian hillside village surrounded by dense green trees and mountains under a partly cloudy blue sky." },
  { src: "/images/play/utrecht-gebouw.jpg", alt: "Street view of a large historic brick building with white trim in a European city, with a delivery van and pedestrians passing by under bright sunlight." },
];

const GALLERY_SQUARE: GalleryItem[] = [
  { src: "/images/play/kerk-plafond.jpg", alt: "Ceiling of a Gothic-style church with detailed stone arches and colorful floral patterns painted between the ribs." },
  { src: "/images/play/poemba.jpg", alt: "A cat sits on a mat by a sunlit door, gazing outside as warm light highlights its fur." },
  { src: "/images/play/boom-closeup.jpg", alt: "Close-up of a large moss-covered tree trunk in a sunlit forest garden with green plants and yellow flowers around the base" },
  { src: "/images/play/toverland-paard.jpg", alt: "Close-up of a large wooden Trojan horse sculpture decorated with metal shields and armor details." },
];

const GALLERY_MIX = {
  horizontal: { src: "/images/play/venlo-station.jpg", alt: "A quiet street corner with a low beige building and two large green trees in front, lit by the warm evening sun." },
  vertical: { src: "/images/play/italie-bruggen.jpg", alt: "View looking up between old connected buildings with arched bridges and worn shutters, showing a hanging towel and warm evening light." },
};

const GALLERY_VERTICALS: GalleryItem[] = [
  { src: "/images/play/antwerpen-tram.jpg", alt: "Historic tram number 7 passing in front of the ornate Nationale Bank van België building on a sunny day in Antwerp." },
  { src: "/images/play/italie-uitzicht.jpg", alt: "Moody mountain landscape with rolling green hills and soft clouds drifting across the peaks under a pale morning sky." },
  { src: "/images/play/breda-cathedraal.jpg", alt: "Upward view of a tall Gothic church tower with intricate stone details and pointed arches, framed by a tree on the left under a cloudy sky." },
];

const GALLERY_SQ_WIDE = {
  square: { src: "/images/play/nina-sissy.jpg", alt: "Black and white photo of an elderly woman sitting calmly on a bench beside a small dog, with stone walls and trees in the background." },
  horizontal: { src: "/images/play/rund-in-bos.jpg", alt: "Black and white photo of a cow standing in a quiet forest clearing surrounded by tall, thin trees." },
};

const GALLERY_WIDE_2: GalleryItem[] = [
  { src: "/images/play/antwerpen-werk.jpg", alt: "Black and white photo of a construction worker cutting metal beside tram tracks, with a large rusted pipe lying across the rails and pedestrians passing by in the background." },
  { src: "/images/play/friet-scootmobiel.jpg", alt: "Black and white photo of people waiting in line at a food stand labeled ‘Verse Friet & Snacks,’ with an older person on a mobility scooter in the foreground." },
];

/** Berekent 1/2/3 kolommen zodat het aansluit op de CSS breakpoints. */
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

  // Gebruik dezelfde hero-klassen per breakpoint maar houd de tekst links.
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

  // Eén keer per render berekenen is genoeg voor de animatievertragingen.
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
        {/* Titelblok met animatie en duidelijke H1. */}
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
                  textAlign="left" // altijd links uitgelijnd voor leesbaarheid
                  groupPhrase={{ tokens: ["curiosity"], className: "gradient-group" }}
                />
              </h1>
            </div>
          </div>
        </section>

        {/* Hoofdgalerij met responsieve afbeeldingen. */}
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
