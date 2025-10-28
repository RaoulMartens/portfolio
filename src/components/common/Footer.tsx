// src/components/common/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

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
  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 280, friction: 12, mass: 1.2 },
  }));

  useEffect(() => {
    if (disabled) {
      api.start({ x: 0, y: 0 });
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
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [padding, disabled, magnetStrength, api]);

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
          willChange: 'transform',
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
  alt: string;
  label: string;
}

const readIsDarkFromDOM = () =>
  typeof document !== 'undefined' &&
  (document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark'));

const Footer: React.FC = () => {
  const [copyButtonText, setCopyButtonText] = useState('Copy E-mail address');
  const [showCopyIcon, setShowCopyIcon] = useState(true);
  const [isScrollHovered, setIsScrollHovered] = useState(false);
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    { href: 'https://www.behance.net/Raoulgraphics', icon: '/images/behance.svg', alt: 'Behance', label: 'Behance' },
    { href: 'https://www.instagram.com/raoulgraphics/', icon: '/images/instagram.svg', alt: 'Instagram', label: 'Instagram' },
    { href: 'https://www.youtube.com/@RaoulGraphics', icon: '/images/youtube.svg', alt: 'YouTube', label: 'YouTube' },
    { href: 'https://www.tiktok.com/@raoulgraphics', icon: '/images/tiktok.svg', alt: 'TikTok', label: 'TikTok' },
  ];

  // Preload footer images
  useEffect(() => {
    ['/images/confirm.svg', '/images/footer.jpg', '/images/footer-dark.jpg'].forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const email = 'Raoulma4@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      setCopyButtonText('Copied');
      setShowCopyIcon(false);
      setEmailCopied(true);
      setTimeout(() => {
        setCopyButtonText('Copy E-mail address');
        setShowCopyIcon(true);
        setEmailCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const footerImgSrc = mounted && isDark ? '/images/footer-dark.jpg' : '/images/footer.jpg';

  return (
    <footer className="main-footer">
      <div className="footer-container grid-container">
        <div className="footer-main-content">
          <div className="footer-row grid-x align-stretch">
            <div className="cell small-12">
              <img
                key={isDark ? 'footer-dark' : 'footer-light'}
                src={footerImgSrc}
                alt="Footer illustration"
                className="footer-image"
                loading="lazy"
              />
            </div>

            <div className="cell small-12">
              <div className="footer-color-block">
                <h3 className="footer-title">
                  Quiet interfaces, loud impact.{' '}
                  <span className="footer-title-gradient gradient-clip">Work with me.</span>
                </h3>

                <div className="footer-cta">
                  <Magnet
                    padding={30}
                    magnetStrength={8}
                    wrapperClassName="magnet--email"
                  >
                    <a
                      href="mailto:Raoulma4@gmail.com"
                      onClick={handleCopyEmail}
                      onMouseEnter={() => setEmailHovered(true)}
                      onMouseLeave={() => setEmailHovered(false)}
                      aria-label="Email me at Raoulma4@gmail.com"
                      tabIndex={0}
                      className="btn-email"
                    >
                      <span
                        className="btn-fill"
                        style={{
                          height: emailHovered || emailCopied ? '100%' : '0%',
                        }}
                      />
                      <span className="btn-content">
                        {emailCopied ? (
                          <img src="/images/confirm.svg" alt="Copied" />
                        ) : (
                          showCopyIcon && <img src="/images/copy.svg" alt="Copy" />
                        )}
                        <span aria-live="polite" aria-atomic="true">{copyButtonText}</span>
                      </span>
                    </a>
                  </Magnet>

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
                          >
                            <span
                              className="btn-fill"
                              style={{
                                height: hoveredSocial === link.label ? '100%' : '0%',
                              }}
                            />
                            <img src={link.icon} alt={link.alt} className="social-icon" />
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
            <img src="/images/logo-grey.svg" alt="Your Logo" /> Raoul Martens © 2025
          </div>

          <a
            href="#site-top"
            onClick={(e) => {
              const target = document.getElementById('site-top');
              if (!target) return;

              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              if (typeof (target as HTMLElement).focus === 'function') {
                (target as HTMLElement).focus({ preventScroll: true });
              }
            }}
            className="scroll-to-top body-sm-medium"
            onMouseEnter={() => setIsScrollHovered(true)}
            onMouseLeave={() => setIsScrollHovered(false)}
          >
            Back to top
            <img
              src="/images/chevron-top.svg"
              alt=""
              style={{
                transform: isScrollHovered ? 'translateY(-8px)' : 'translateY(0)',
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
