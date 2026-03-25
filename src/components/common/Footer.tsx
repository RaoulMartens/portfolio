// src/components/common/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

/* ---------- utils ---------- */
function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const readIsDarkFromDOM = () =>
  typeof document !== 'undefined' &&
  (document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark'));

/* ---------- Magnet ---------- */
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
  [key: string]: any;
}
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 10,
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const actuallyDisabled = disabled || prefersReduced;

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 280, friction: 12, mass: 1.2 },
  }));

  useEffect(() => {
    if (actuallyDisabled) {
      api.start({ x: 0, y: 0, immediate: true });
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return;
      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.abs(dx) < width / 2 + padding && Math.abs(dy) < height / 2 + padding) {
        api.start({ x: dx / magnetStrength, y: dy / magnetStrength });
      } else {
        api.start({ x: 0, y: 0 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, actuallyDisabled, magnetStrength, api]);

  return (
    <div
      ref={magnetRef}
      className={`magnet ${wrapperClassName}`}
      style={{ position: 'relative', display: 'inline-block' }}
      {...props}
    >
      <animated.div
        className={innerClassName}
        style={{
          transform: to([x, y], (xv: number, yv: number) => `translate3d(${xv}px, ${yv}px, 0)`),
          willChange: actuallyDisabled ? undefined : 'transform',
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};

/* ---------- Footer ---------- */
interface SocialLink {
  href: string;
  icon: string;
  label: string; // accessible name lives on the link
}

const Footer: React.FC = () => {
  const [copyButtonText, setCopyButtonText] = useState('Copy email address');
  const [showCopyIcon, setShowCopyIcon] = useState(true);
  const [isScrollHovered, setIsScrollHovered] = useState(false);
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsDark(readIsDarkFromDOM());
    const root = document.documentElement;
    const body = document.body;
    const handle = () => setIsDark(readIsDarkFromDOM());

    const observer = new MutationObserver(handle);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') handle();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const socialLinks: SocialLink[] = [
    { href: 'https://www.behance.net/Raoulgraphics', icon: '/images/behance.svg', label: 'Behance' },
    { href: 'https://www.instagram.com/raoulgraphics/', icon: '/images/instagram.svg', label: 'Instagram' },
    { href: 'https://www.youtube.com/@RaoulGraphics', icon: '/images/youtube.svg', label: 'YouTube' },
    { href: 'https://www.tiktok.com/@raoulgraphics', icon: '/images/tiktok.svg', label: 'TikTok' },
  ];

  // Preload
  useEffect(() => {
    ['/images/confirm.svg', '/images/footer.webp', '/images/footer-dark.webp'].forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Gewone click = kopiëren; Ctrl/Cmd-click laat mailto openen.
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const email = 'Raoulma4@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      setCopyButtonText('Copied');
      setShowCopyIcon(false);
      setEmailCopied(true);
      // update live region expliciet
      if (statusRef.current) statusRef.current.textContent = 'Email address copied to clipboard';
      const t = setTimeout(() => {
        setCopyButtonText('Copy email address');
        setShowCopyIcon(true);
        setEmailCopied(false);
        if (statusRef.current) statusRef.current.textContent = '';
      }, 2000);
      return () => clearTimeout(t);
    } catch (err) {
      console.error('Copy failed:', err);
      if (statusRef.current) statusRef.current.textContent = 'Copy failed';
    }
  };

  const footerImgSrc = mounted && isDark ? '/images/footer-dark.webp' : '/images/footer.webp';

  return (
    <footer className="main-footer">
      <div className="footer-container grid-container">
        <div className="footer-main-content">
          <div className="footer-row grid-x align-stretch">
            <div className="cell small-12">
              <img
                key={isDark ? 'footer-dark' : 'footer-light'}
                src={footerImgSrc}
                alt={
                  isDark
                    ? 'Sunlight filtering through garden trees at sunset, casting a warm glow over the grass and surrounding plants.'
                    : 'A quiet rural path curving through a line of trees beside plowed fields under a bright blue sky with scattered clouds.'
                }
                className="footer-image"
                loading="lazy"
              />
            </div>

            <div className="cell small-12">
              <div className="footer-color-block">
                <h3 className="footer-title">
                  Quiet interfaces, loud impact{' '}
                  <span className="footer-title-gradient gradient-clip">Work with me.</span>
                </h3>

                <div className="footer-cta">
                  {/* Mailknop: click = kopiëren, Ctrl/Cmd-click = mailto openen */}
                  <Magnet padding={30} magnetStrength={8} wrapperClassName="magnet--email">
                    <a
                      href="mailto:Raoulma4@gmail.com"
                      onClick={handleCopyEmail}
                      onMouseEnter={() => setEmailHovered(true)}
                      onMouseLeave={() => setEmailHovered(false)}
                      aria-label="Copy email address for Raoulma4@gmail.com"
                      className="btn-email"
                      title="Click to copy. Ctrl/Cmd-click to open email app."
                    >
                      <span
                        className="btn-fill"
                        style={{ height: emailHovered || emailCopied ? '100%' : '0%' }}
                        aria-hidden="true"
                      />
                      <span className="btn-content">
                        {emailCopied ? (
                          <img src="/images/confirm.svg" alt="Copied" />
                        ) : (
                          showCopyIcon && <img src="/images/copy.svg" alt="" aria-hidden="true" />
                        )}
                        <span>{copyButtonText}</span>
                      </span>
                    </a>
                  </Magnet>

                  {/* Live region voor statusupdates (non-visual) */}
                  <span
                    ref={statusRef}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                  />

                  {/* Social media */}
                  <ul className="social-list">
                    {socialLinks.map((link) => (
                      <li key={link.label}>
                        <Magnet padding={20} magnetStrength={10}>
                          <a
                            href={link.href}
                            aria-label={link.label}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn"
                            onMouseEnter={() => setHoveredSocial(link.label)}
                            onMouseLeave={() => setHoveredSocial(null)}
                            title={link.label}
                          >
                            <span
                              className="btn-fill"
                              style={{ height: hoveredSocial === link.label ? '100%' : '0%' }}
                              aria-hidden="true"
                            />
                            {/* decoratief icoon; naam zit op de link */}
                            <img src={link.icon} alt="" aria-hidden="true" className="social-icon" />
                          </a>
                        </Magnet>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-brand">
            <img src="/images/logo-grey.svg" alt="" aria-hidden="true" /> Raoul Martens © 2026
          </div>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="scroll-to-top body-sm-medium"
            aria-label="Back to top of page"
            onMouseEnter={() => setIsScrollHovered(true)}
            onMouseLeave={() => setIsScrollHovered(false)}
            title="Back to top"
          >
            Back to top
            <img
              src="/images/chevron-top.svg"
              alt=""
              aria-hidden="true"
              style={{ transform: isScrollHovered ? 'translateY(-8px)' : 'translateY(0)' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
