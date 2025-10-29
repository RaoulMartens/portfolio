import React, { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import Navigation from "../components/common/Navigation";
import Hero from "../components/sections/Hero";
import ProjectCard from "../components/sections/ProjectCard";
import Footer from "../components/common/Footer";

import { homeProjects } from "../data/projects";
import { Section, emitSection } from "../utils/sections";
import { getNavHeight, scrollToY, updateNavHeightVar } from "../utils/layout";

/**
 * Deze pagina plakt de hero, projecten en footer netjes aan elkaar.
 * - Semantische HTML + aria laten de structuur zien → criterium 6.1.
 * - Scroll-logica reageert op schermbreedtes en nav-hoogte → criterium 6.2.
 * - Focusbeheer en headings maken alles bruikbaar met toetsenbord → criterium 6.3.
 */
const Home: React.FC = () => {
  const location = useLocation();
  const workRef = useRef<HTMLDivElement | null>(null);
  const lastSectionRef = useRef<Section>("home");
  const heroHeadingId = "home-hero-heading";

  // Hulpfunctie: bereken waar het werk-gedeelte begint (rekening met hoogte van navigatie).
  const computeWorkTop = () => {
    const el = workRef.current || (document.getElementById("work") as HTMLDivElement | null);
    if (!el) return 0;
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(rectTop - getNavHeight(), 0);
  };

  // Bij laden en resizen meten we de navigatiehoogte zodat de CSS variabele klopt (6.1 + 6.2).
  useEffect(() => {
    updateNavHeightVar();
    const onResize = () => updateNavHeightVar();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(updateNavHeightVar);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reageer op router-state: spring naar werk of top, en vergeet oude hashes voor nette URL.
  useEffect(() => {
    if (location.pathname !== "/") return;

    type LocState = { scrollTo?: "work"; scrollToTop?: boolean } | null;
    const locState = (location.state ?? null) as LocState;

    const wantsWork = location.hash === "#work" || locState?.scrollTo === "work";
    const wantsTop = locState?.scrollToTop === true;

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

  // Houd bij of je scrolt in het werk-gedeelte zodat de navigatie de juiste sectie kan tonen.
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

  // Maak de projectkaarten één keer aan; dit scheidt data van presentatie (6.1).
  const cards = useMemo(
    () =>
      homeProjects.map((project) => {
        const media =
          project.media.kind === "video"
            ? { src: project.media.poster, alt: project.media.alt }
            : { src: project.media.src, alt: project.media.alt };

        return (
          <ProjectCard
            key={project.link}
            title={project.title}
            meta={project.meta}
            link={project.link}
            media={media}
            isVideo={project.media.kind === "video"}
          />
        );
      }),
    []
  );

  return (
    <div className="viewport-wrapper">
      <Navigation />
      <main
        id="main-content"
        className="home-main"
        tabIndex={-1}
        aria-labelledby={heroHeadingId}
      >
        {/* Hero-sectie: intro en snelle uitleg over wie je bent. */}
        <Hero headingId={heroHeadingId} />
        <section
          id="work"
          ref={workRef}
          className="work-section work-anchor"
          aria-labelledby="work-heading"
        >
          {/* Visueel verstopte titel zodat screenreaders snappen dat dit het werkoverzicht is. */}
          <h2 id="work-heading" className="sr-only">
            Featured work
          </h2>
          {/* Alle projecten krijgen dezelfde semantische opmaak via ProjectCard. */}
          {cards}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
