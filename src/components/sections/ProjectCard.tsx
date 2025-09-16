import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import SplitText from '../common/SplitText';
import AnimatedContent from '../common/AnimatedContent';
import { hasPlayed } from '../../utils/animationMemory';

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
    if (mq?.matches) setShouldAutoplay(false);
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

  // Force svg cover behavior once shadow DOM exists
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
          loop={loop}
          background="transparent"
          renderer="svg"
        />
      )}
    </div>
  );
};

/* ---------- Theme sync (DOM class watch) ---------- */
function useIsDarkFromDOM() {
  const getIsDark = () =>
    document.documentElement.classList.contains('dark') ||
    document.documentElement.classList.contains('mapped--dark') ||
    document.body.classList.contains('dark') ||
    document.body.classList.contains('mapped--dark');

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return getIsDark();
  });

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
const LinkWithHover: React.FC<{ link: string; className?: string }> = ({ link, className }) => {
  const isDark = useIsDarkFromDOM();
  const chevronSrc = useMemo(
    () => (isDark ? '/images/chevron-right-dark.svg' : '/images/chevron-right.svg'),
    [isDark]
  );

  return (
    <a href={link} className={`project-link ${className ?? ''}`} aria-label="Read story">
      <span>Read story</span>
      <img className="active-icon" src={chevronSrc} alt="" />
    </a>
  );
};

/* ---------- Project header ---------- */
const ProjectInfo: React.FC<{ title: string; meta: string; link: string }> = memo(({ title, meta, link }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (hasPlayed(`${link}::title`) || hasPlayed(`${link}::meta`) || hasPlayed(`${link}::cta`)) {
      setInView(true);
    }
  }, [link]);

  useEffect(() => {
    if (inView) return;
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
      {
        rootMargin: '0px 0px -25% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.5],
      }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView]);

  return (
    <div className="project-header" ref={ref}>
      <div className="project-info">
        <h2 className="project-title">
          {inView ? (
            <SplitText
              text={title}
              delay={100}
              duration={0.8}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.9}
              rootMargin="-5% 0px -25% 0px"
              textAlign="left"
              persistId={`${link}::title`}
            />
          ) : (
            <span className="invisible">{title}</span>
          )}
        </h2>

        <p className="project-meta body-sm-medium">
          {inView ? (
            <SplitText
              text={meta}
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.95}
              rootMargin="-5% 0px -20% 0px"
              textAlign="left"
              persistId={`${link}::meta`}
            />
          ) : (
            <span className="invisible">{meta}</span>
          )}
        </p>
      </div>

      <div className="project-link-desktop">
        {inView && (
          <AnimatedContent
            distance={50}
            direction="horizontal"
            reverse
            duration={0.8}
            ease="power3.out"
            delay={1}
            animateOpacity
            initialOpacity={0}
            persistId={`${link}::cta`}
          >
            <LinkWithHover link={link} />
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

  return (
    <section className="project-background">
      <div className="grid-container">
        <div className="grid-x project-background-row">
          <section className="project-card cell small-12 medium-10 medium-offset-1 large-8 large-offset-2">
            <ProjectInfo title={title} meta={meta} link={link} />

            <div className="project-image-wrapper">
              <a href={link} aria-label={`Open ${title}`} className="media-link">
                <div className="media-inner">
                  {isVideo ? (
                    <LottieAnim src={lottieSrc} loop autoplay />
                  ) : (
                    <img
                      src={(media as ImageMedia).src}
                      alt={(media as ImageMedia).alt}
                      className="project-image"
                    />
                  )}
                </div>
              </a>
            </div>

            {/* mobile-only CTA */}
            <div className="project-link-mobile">
              <AnimatedContent persistId={`${link}::cta`}>
                <LinkWithHover link={link} />
              </AnimatedContent>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default ProjectCard;
