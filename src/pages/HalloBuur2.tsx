// src/pages/HalloBuur2.tsx
import React from "react";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import SplitText from "../components/common/SplitText";
import AnimatedContent from "../components/common/AnimatedContent";
import RuleGrow from "../components/common/RuleGrow";
import { useDocumentHead } from "../hooks/useDocumentHead";

/* RuleGrow + prefersReducedMotion imported from shared modules */

const HalloBuur2: React.FC = () => {
  useDocumentHead({
    title: "Hallo Buur Research — Raoul Martens",
    description:
      "Co-creation research on social connection in a changing residential community.",
  });
  /* Animaties (gelijk aan HalloBuur) */
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
        className="hb2-main"
        tabIndex={-1}
        aria-labelledby={headingId}
      >
        <section className="hb2-container">
          {/* HEADER */}
          <div className="hb2-grid">
            <div className="hb2-content">
              <h1 id={headingId} className="hb2-title">
                <SplitText
                  text="Understanding community change"
                  splitType="words"
                  delay={0.06}                 // correct delay
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

              <div className="hb2-hero">
                <AnimatedContent {...heroImgAnim}>
                  <img
                    className="hb2-hero-img"
                    src="/images/hallo-buur2/hero.webp"
                    alt="Group of elderly residents sitting together at a community table having coffee and conversation, with handwritten observation notes visible in the foreground."
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                  />
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* TEXT BLOCK #1 */}
          <section className="hb2-block" role="region" aria-labelledby="hb2-intro">
            <div className="hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h3 id="hb2-intro">Introduction</h3>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    After probes and observations, I found that older residents do want more social contact, but are not quick to embrace change. Through a co-creation session, I got a better understanding of how strong that need really is, and what makes taking the first step so difficult for them.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </section>

          {/* FULL-WIDTH IMAGE #1 */}
          <div className="hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-1.webp"
                  alt="Simple black-and-white illustration of a frowning man with text above him that reads 'This is all pointless, those people won’t show up anyway.'"
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT BLOCK #2 */}
          <section className="hb2-block" role="region" aria-labelledby="hb2-context">
            <div className="hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h3 id="hb2-context">Context</h3>
                </AnimatedContent>
              </div>
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal} delay={STAGGER}>
                  <p>
                    In a residential complex on Aubadestraat in Nijmegen, owned by Talis, many older residents still live. The complex used to have a 65-plus label, but that has recently been removed. As a result, the number of elderly residents is slowly decreasing, while more young people and newcomers are moving in. Many older residents miss the sense of community that used to be there and would like more contact with the new residents.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </section>

          {/* DIVIDER — grow left → right */}
          <div className="hb2-grid">
            <div className="hb2-divider">
              <RuleGrow classPrefix="hb2" />
            </div>
          </div>

          {/* TITLE + TWO CARDS */}
          <div className="hb2-block hb2-title-only">
            <div className="hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h3 id="hb2-why">Why a Co-Creation?</h3>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="hb2-grid">
            <div className="hb2-cards-right" role="list" aria-labelledby="hb2-why">
              {[
                {
                  title: "Needs and desires",
                  body:
                    "Their ideas and input helped me better understand what they truly need, value, and hope for.",
                  iconClass: "mask-shopping-bag",
                },
                {
                  title: "Depth",
                  body:
                    "Compared to more static methods like interviews, co-creation creates more room for open conversation. That often leads to deeper insights.",
                  iconClass: "mask-triangle",
                },
              ].map((c, i) => (
                <AnimatedContent key={i} {...textReveal} delay={i * 0.06}>
                  <div className="hb2-card" role="listitem">
                    <div className={`hb2-card-icon ${c.iconClass}`} aria-hidden="true" />
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>

          {/* DIVIDER — grow left → right */}
          <div className="hb2-grid">
            <div className="hb2-divider">
              <RuleGrow />
            </div>
          </div>

          {/* TEXT BLOCK #3 */}
          <section className="hb2-block" role="region" aria-labelledby="hb2-co-creation">
            <div className="hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h3 id="hb2-co-creation">The Co-Creation</h3>
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
          </section>

          {/* FULL-WIDTH IMAGE #2 */}
          <div className="hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-2.webp"
                  alt="Two groups of colorful sticky notes labeled 'Why not?' and 'Why yes?' showing reasons for and against participating in community coffee gatherings."
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT (no title) #4 */}
          <div className="hb2-block">
            <div className="hb2-block-grid">
              <div className="hb2-block-text">
                <AnimatedContent {...textReveal}>
                  <p>
                    Some residents are not strongly affected by the negativity and even suggest ways to improve the atmosphere. One idea was to display positive feedback at the entrance, making visible what residents value about the shared space. Still, tensions remain. One resident, who occasionally joins communal activities, recalled being handed a paintbrush with the comment, “The paint will come later.” Although meant as a joke, it felt personal. This shows how seemingly small remarks can still have impact and may contribute to division between residents.

                    To explore these dynamics, I visited residents in their homes to learn more about how they move through the building, how they relate to neighbours, and where contact with others tends to happen. These insights may later inform the design.
                  </p>
                </AnimatedContent>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH IMAGE #3 (hairline fix via CSS) */}
          <div className="hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image hb2-image--hairline-fix"
                  src="/images/hallo-buur2/wide-3.webp"
                  alt="Black-and-white illustration of a man with a slight smile looking upward, with handwritten text above him that reads: 'On the 3rd and 5th floors, everyone knows each other, it’s really cozy there.'"
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT (no title) #5 */}
          <div className="hb2-block">
            <div className="hb2-block-grid">
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
          <div className="hb2-grid">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-4.webp"
                  alt="Illustration of an apartment building surrounded by icons and short phrases representing things residents appreciate about their community, such as 'Music is part of it,' 'Well-maintained garden,' 'Being together is cozy,' 'Bingo,' and 'Beautiful walking area.' The image highlights positive aspects of shared living like social events, greenery, and nearby facilities."
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                />
              </AnimatedContent>
            </div>
          </div>

          {/* TEXT BLOCK #6 */}
          <section className="hb2-block" role="region" aria-labelledby="hb2-result">
            <div className="hb2-block-grid">
              <div className="hb2-block-title">
                <AnimatedContent {...textReveal}>
                  <h3 id="hb2-result">Result</h3>
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
          </section>

          {/* FULL-WIDTH IMAGE #5 */}
          <div className="hb2-grid hb2-bottom-gap">
            <div className="hb2-followup">
              <AnimatedContent {...imageReveal}>
                <img
                  className="hb2-image"
                  src="/images/hallo-buur2/wide-5.webp"
                  alt="A colorful poster titled 'De Aubade Waardeplaat' hanging on a beige wall near an elevator. The poster visualizes what residents value about their building, featuring icons and categories such as 'Activiteiten,' 'Sociaal,' 'Feesten,' 'Voorzieningen,' and 'Omgeving.' Illustrations show themes like bingo, coffee gatherings, helping each other, greenery, and local shops."
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
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
