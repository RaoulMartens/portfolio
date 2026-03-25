import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';
import { hasPlayed, markPlayed } from '../../utils/animationMemory';

/* ---------- dotLottie web component wrapper ---------- */
const DotlottiePlayer = React.forwardRef<any, any>((props, ref) =>
  React.createElement('dotlottie-player' as any, { ...props, ref })
);
DotlottiePlayer.displayName = 'DotlottiePlayer';

/* ---------- Types ---------- */
interface ImageMedia { src: string; alt: string; }
type Media = ImageMedia;

interface ProjectCardProps {
  title: string;
  meta: string;
  link: string;
  media: Media;
  isVideo?: boolean;
}

/* ---------- Small Lottie wrapper ---------- */
// Respecteert prefers-reduced-motion en voorkomt onnodige focus.
const LottieAnim: React.FC<{
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}> = ({ src, loop = true, autoplay = true, className }) => {
  const [ready, setReady] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(autoplay);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const apply = () => setShouldAutoplay(mq?.matches ? false : autoplay);
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [autoplay]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('customElements' in window)) {
      setReady(true);
      return;
    }
    if (customElements.get('dotlottie-player')) {
      setReady(true);
      return;
    }
    customElements.whenDefined('dotlottie-player')
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  // Zorg dat de animatie de container volledig vult.
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    let raf = 0;
    const apply = () => {
      const root = (playerRef.current as any).shadowRoot;
      const svg = root?.querySelector?.('svg');
      if (!svg) { raf = requestAnimationFrame(apply); return; }
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      (svg as SVGElement).style.width = '100%';
      (svg as SVGElement).style.height = '100%';
    };
    apply();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [ready]);

  return (
    <div className={`lottie-player-container ${className ?? ''}`}>
      {ready && (
        <DotlottiePlayer
          ref={playerRef}
          src={src}
          autoplay={shouldAutoplay}
          loop={shouldAutoplay && loop}
          background="transparent"
          renderer="svg"
          // niet focusbaar; link rondom draagt de naam
          tabindex={-1 as any}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/* ---------- Theme sync (DOM class watch) ---------- */
function useIsDarkFromDOM() {
  if (typeof document === 'undefined') return false;

  const getIsDark = () =>
    document.documentElement.classList.contains('dark') ||
    document.documentElement.classList.contains('mapped--dark') ||
    document.body.classList.contains('dark') ||
    document.body.classList.contains('mapped--dark');

  const [isDark, setIsDark] = useState<boolean>(getIsDark);

  useEffect(() => {
    const update = () => setIsDark(getIsDark());
    const htmlObs = new MutationObserver(update);
    const bodyObs = new MutationObserver(update);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const onStorage = (e: StorageEvent) => { if (e.key === 'theme') update(); };
    window.addEventListener('storage', onStorage);
    update();
    return () => {
      htmlObs.disconnect();
      bodyObs.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return isDark;
}

/* ---------- Link ---------- */
// Duidelijke naam voor SR; decoratieve pijl is aria-hidden.
const LinkWithHover: React.FC<{ link: string; title: string; className?: string }> = ({ link, title, className }) => {
  const isDark = useIsDarkFromDOM();
  const chevronSrc = useMemo(
    () => (isDark ? '/images/chevron-right-dark.svg' : '/images/chevron-right.svg'),
    [isDark]
  );

  return (
    <a href={link} className={`project-link ${className ?? ''}`} aria-label={`Read story: ${title}`}>
      <span>Read Story</span>
      <img className="active-icon" src={chevronSrc} alt="" aria-hidden="true" />
    </a>
  );
};

/* ---------- Project header ---------- */
interface ProjectInfoProps {
  title: string;
  meta: string;
  link: string;
  headingId: string;
}

const ProjectInfo: React.FC<ProjectInfoProps> = memo(({ title, meta, link, headingId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const playedTitle = hasPlayed(`${link}::title`);
  const playedMeta = hasPlayed(`${link}::meta`);
  const playedCta = hasPlayed(`${link}::cta`);

  // Start animaties bij eerste intersect; geen afhankelijkheid van scrollY.
  useEffect(() => {
    if (inView || (playedTitle && playedMeta && playedCta)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, playedTitle, playedMeta, playedCta]);

  const titleDelay = 0.06;
  const titleDuration = 0.8;
  const titleWordCount = title.trim().split(/\s+/).length;
  const subtitleStartDelay = titleWordCount * titleDelay * 0.5 + 0.1;
  const ctaDelay = subtitleStartDelay + 0.3;
  const ctaDuration = 0.8;

  useEffect(() => {
    if (!inView || playedCta) return;
    const t = window.setTimeout(() => { markPlayed(`${link}::cta`); }, Math.max(0, (ctaDelay + ctaDuration) * 1000));
    return () => window.clearTimeout(t);
  }, [inView, playedCta, link, ctaDelay, ctaDuration]);

  return (
    <div className="project-header" ref={ref}>
      <div className="project-info">
        <h2 id={headingId} className="project-title">
          {playedTitle ? (
            <span className="static">{title}</span>
          ) : inView ? (
            <SplitText
              text={title}
              delay={titleDelay}
              duration={titleDuration}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="100% 0px 100% 0px"
              textAlign="left"
              persistId={`${link}::title`}
              onLetterAnimationComplete={() => markPlayed(`${link}::title`)}
            />
          ) : (
            <span className="invisible" aria-hidden="true">{title}</span>
          )}
        </h2>

        <p className="project-meta body-sm-medium">
          {playedMeta ? (
            <span className="static">{meta}</span>
          ) : inView ? (
            <SplitText
              text={meta}
              delay={0.05}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="100% 0px 100% 0px"
              textAlign="left"
              persistId={`${link}::meta`}
              startDelay={subtitleStartDelay}
              onLetterAnimationComplete={() => markPlayed(`${link}::meta`)}
            />
          ) : (
            <span className="invisible" aria-hidden="true">{meta}</span>
          )}
        </p>
      </div>

      <div className="project-link-desktop">
        {playedCta ? (
          <LinkWithHover link={link} title={title} />
        ) : inView && (
          <AnimatedContent
            distance={50}
            direction="horizontal"
            reverse
            duration={0.8}
            ease="power3.out"
            delay={ctaDelay}
            animateOpacity
            initialOpacity={0}
            persistId={`${link}::cta`}
          >
            <LinkWithHover link={link} title={title} />
          </AnimatedContent>
        )}
      </div>
    </div>
  );
});
ProjectInfo.displayName = 'ProjectInfo';

/* ---------- Project card ---------- */
const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  meta,
  link,
  media,
  isVideo = false,
}) => {
  const lottieSrc = '/videos/hallo-buur.lottie';

  const mobileCtaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (hasPlayed(`${link}::cta`)) return;
    const node = mobileCtaRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => markPlayed(`${link}::cta`), 800);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [link]);

  const imageProps =
    isVideo
      ? { src: (media as any).poster as string, alt: (media as any).alt as string }
      : (media as ImageMedia);

  const headingId = useMemo(
    () =>
      `project-${link
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/(^-|-$)/g, '')
        .toLowerCase()}`,
    [link]
  );

  return (
    <section className="project-background">
      <div className="grid-container">
        <div className="grid-x project-background-row">
          <article
            className="project-card cell small-12 medium-10 medium-offset-1 large-8 large-offset-2"
            aria-labelledby={headingId}
          >
            <ProjectInfo title={title} meta={meta} link={link} headingId={headingId} />

            <div className="project-image-wrapper">
              <a href={link} aria-label={`Open ${title}`} className="media-link">
                <div className="media-inner">
                  {isVideo ? (
                    <LottieAnim src={lottieSrc} loop autoplay />
                  ) : (
                    <img
                      src={imageProps.src}
                      alt={imageProps.alt}
                      className="project-image"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              </a>
            </div>

            <div className="project-link-mobile" ref={mobileCtaRef}>
              {hasPlayed(`${link}::cta`) ? (
                <LinkWithHover link={link} title={title} />
              ) : (
                <AnimatedContent persistId={`${link}::cta`}>
                  <LinkWithHover link={link} title={title} />
                </AnimatedContent>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ProjectCard;
