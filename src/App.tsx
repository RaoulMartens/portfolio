import React, { useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Home page pieces (local components)
import Navigation from "./components/common/Navigation";
import Hero from "./components/sections/Hero";
import ProjectCard from "./components/sections/ProjectCard";
import Footer from "./components/common/Footer";

// Standalone pages
import Play from "./pages/Play";
import Me from "./pages/Me";
import HalloBuur from "./pages/HalloBuur";
import HalloBuur2 from "./pages/HalloBuur2";
import Nieuwsbegrip from "./pages/Nieuwsbegrip";
import PECZwolle from "./pages/PECZwolle";

// Scroll restore
import ScrollToTop from "./components/common/ScrollToTop";

/* ---- local types (just for Home's project list) ---- */
interface MediaVideo { webm: string; mp4: string; poster: string; alt: string; }
interface MediaImage { src: string; alt: string; }
interface Project {
  title: string; meta: string; link: string;
  media: MediaVideo | MediaImage; isVideo: boolean;
}

/* ---- sample project data for Home ---- */
const projects: Project[] = [
  {
    title: "Community building through a digital bulletin board.",
    meta: "Hallo Buur, 2025",
    link: "/hallo-buur",
    media: {
      webm: "/videos/hallo-buur.webm",
      mp4: "/videos/hallo-buur.mp4",
      poster: "/images/hallo-buur-cover.jpg",
      alt: "Hallo Buur app interface with central logo and two example posts: one about organizing a board game afternoon and another about asking neighbors for pasta ingredients.",
    },
    isVideo: true,
  },
  {
    title: "A fresh take on the news-based reading comprehension method.",
    meta: "Nieuwsbegrip, 2024",
    link: "/nieuwsbegrip",
    media: { src: "/images/nieuwsbegrip-cover.jpg", alt: "Illustration of a laptop displaying the Nieuwsbegrip dashboard interface, showing quick access tiles and workflows on a clean, modern layout." },
    isVideo: false,
  },
  {
    title: "Bringing an Eredivisie club's matches and campaigns to life.",
    meta: "PEC Zwolle, 2023 - 2024",
    link: "/pec-zwolle",
    media: { src: "/images/peczwolle-cover.jpg", alt: "A showcase of your third project" },
    isVideo: false,
  },
  {
    title: "Researching social connection in a shifting residential community.",
    meta: "Hallo Buur, 2025",
    link: "/hallo-buur-2",
    media: { src: "/images/hallo-buur2-cover.jpg", alt: "A showcase of your fourth project" },
    isVideo: false,
  },
];

/* ------------ tiny section bus ------------ */
type Section = "home" | "work";
declare global { interface Window { __section?: Section; } }
function emitSection(section: Section) {
  window.__section = section;
  window.dispatchEvent(new CustomEvent("sectionchange", { detail: { section } }));
}

/* ------------ utilities ------------ */
function getNavHeight(): number {
  const el = document.querySelector(".navbar") as HTMLElement | null;
  return el?.offsetHeight ?? 0;
}
function scrollToY(y: number, behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top: y, behavior });
}

/* Keep a CSS variable in sync so we can use scroll-margin-top in pure CSS */
function updateNavHeightVar() {
  const h = getNavHeight() || 80;
  document.documentElement.style.setProperty("--nav-height", `${h}px`);
}

/* ------------ Home page ------------ */
const Home: React.FC = () => {
  const location = useLocation();
  const workRef = useRef<HTMLDivElement | null>(null);
  const lastSectionRef = useRef<Section>("home");

  const computeWorkTop = () => {
    const el = workRef.current || (document.getElementById("work") as HTMLDivElement | null);
    if (!el) return 0;
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(rectTop - getNavHeight(), 0);
  };

  /* keep --nav-height in sync */
  useEffect(() => {
    updateNavHeightVar();
    const onResize = () => updateNavHeightVar();
    window.addEventListener("resize", onResize);
    // run once after first paint too
    requestAnimationFrame(updateNavHeightVar);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* initial hash/state handling and section emit */
  useEffect(() => {
    if (location.pathname !== "/") return;

    type LocState = { scrollTo?: "work"; scrollToTop?: boolean } | null;
    const locState = (location.state ?? null) as LocState;

    const wantsWork = location.hash === "#work" || locState?.scrollTo === "work";
    const wantsTop  = locState?.scrollToTop === true;

    if (wantsTop) {
      scrollToY(0, "smooth");
      lastSectionRef.current = "home";
      emitSection("home");
      if (location.hash) {
        const urlNoHash = window.location.pathname + window.location.search;
        window.history.replaceState({}, "", urlNoHash);
      }
      return;
    }

    if (!wantsWork) {
      lastSectionRef.current = "home";
      emitSection("home");

      let tries = 0;
      const maxTries = 24;
      const settle = () => {
        tries += 1;
        const y = computeWorkTop();
        if (y > 0) {
          const inWork = window.scrollY >= y - 1;
          const next: Section = inWork ? "work" : "home";
          if (next !== lastSectionRef.current) {
            lastSectionRef.current = next;
            emitSection(next);
          }
          return;
        }
        if (tries < maxTries) requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
      return;
    }

    let tries = 0;
    const maxTries = 24;
    const tick = () => {
      tries += 1;
      const y = computeWorkTop();
      if (y > 0 || tries >= maxTries) {
        scrollToY(y, "smooth");
        lastSectionRef.current = "work";
        emitSection("work");
        if (location.hash === "#work") {
          const urlNoHash = window.location.pathname + window.location.search;
          window.history.replaceState({}, "", urlNoHash);
        }
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [location.pathname, location.hash, location.state]);

  /* emit section on scroll/resize */
  useEffect(() => {
    if (location.pathname !== "/") return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = computeWorkTop();
        if (y <= 0) {
          if (lastSectionRef.current !== "home") {
            lastSectionRef.current = "home";
            emitSection("home");
          }
          return;
        }
        const inWork = window.scrollY >= y - 1;
        const next: Section = inWork ? "work" : "home";
        if (next !== lastSectionRef.current) {
          lastSectionRef.current = next;
          emitSection(next);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  const cards = useMemo(
    () =>
      projects.map((p, i) => {
        const imageMedia = (p as any).isVideo
          ? { src: (p.media as MediaVideo).poster, alt: (p.media as MediaVideo).alt }
          : (p.media as MediaImage);
        return (
          <ProjectCard
            key={i}
            title={p.title}
            meta={p.meta}
            link={p.link}
            media={imageMedia}
            isVideo={p.isVideo}
          />
        );
      }),
    []
  );

  return (
    <div className="viewport-wrapper">
      <Navigation />
      <Hero />
      <div id="work" ref={workRef} className="work-anchor" />
      {cards}
      <Footer />
    </div>
  );
};

/* ------------ Router ------------ */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/me" element={<Me />} />
        <Route path="/hallo-buur" element={<HalloBuur />} />
        <Route path="/hallo-buur-2" element={<HalloBuur2 />} />
        <Route path="/nieuwsbegrip" element={<Nieuwsbegrip />} />
        <Route path="/pec-zwolle" element={<PECZwolle />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
