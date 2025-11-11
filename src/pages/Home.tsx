// src/pages/Home.tsx
import React, { useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import Navigation from "../components/common/Navigation";
import Hero from "../components/sections/Hero";
import ProjectCard from "../components/sections/ProjectCard";
import Footer from "../components/common/Footer";

import { homeProjects } from "../data/projects";
import { Section, emitSection } from "../utils/sections";
import { getNavHeight, scrollToY, updateNavHeightVar } from "../utils/layout";

/**
 * Home pagina met hero, projecten en footer.
 * - Semantiek en aria → 6.1
 * - Scroll/resize gedrag → 6.2
 * - Focus/heading structuur → 6.3
 */
const Home: React.FC = () => {
  const location = useLocation();
  const workRef = useRef<HTMLDivElement | null>(null);
  const lastSectionRef = useRef<Section>("home");
  const heroHeadingId = "home-hero-heading";

  // Bepaal top van work-sectie (houdt rekening met nav-hoogte)
  const computeWorkTop = () => {
    const el = workRef.current || (document.getElementById("work") as HTMLDivElement | null);
    if (!el) return 0;
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(rectTop - getNavHeight(), 0);
  };

  // Zet CSS var voor nav-hoogte zo vroeg mogelijk om jumps te voorkomen
  useLayoutEffect(() => {
    updateNavHeightVar();
    const onResize = () => updateNavHeightVar();
    window.addEventListener("resize", onResize);
    // extra rAF om late fonts/layout te vangen
    requestAnimationFrame(updateNavHeightVar);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Router-state: scroll naar work of top en maak URL schoon
  useEffect(() => {
    if (location.pathname !== "/") return;

    const { scrollToTop = false, scrollTo } =
      ((location.state ?? {}) as { scrollToTop?: boolean; scrollTo?: "work" }) || {};

    const wantsWork = location.hash === "#work" || scrollTo === "work";
    const wantsTop = !!scrollToTop;

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
      // Init sectie status na mount/layout settle
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

    // Wél naar work scrollen
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
  }, [location.pathname, location.hash, (location.state as any)?.scrollTo, (location.state as any)?.scrollToTop]);

  // Sectie-tracking tijdens scroll/resize zodat nav actief item kan tonen
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
    onScroll(); // init

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  // Projectkaarten (data → presentatie)
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
    [homeProjects]
  );

  return (
    <div className="viewport-wrapper">
      <Navigation />
      <main id="main-content" className="home-main" tabIndex={-1} aria-labelledby={heroHeadingId}>
        <Hero headingId={heroHeadingId} />

        <section id="work" ref={workRef} className="work-section work-anchor" aria-labelledby="work-heading">
          <h2 id="work-heading" className="sr-only">
            Featured work
          </h2>
          {cards}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
