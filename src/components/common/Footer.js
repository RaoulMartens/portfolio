import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/common/Footer.tsx
import { useState, useEffect, useRef } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 10, wrapperClassName = '', innerClassName = '', ...props }) => {
    const magnetRef = useRef(null);
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
        const handleMouseMove = (e) => {
            if (!magnetRef.current)
                return;
            const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
            const cx = left + width / 2;
            const cy = top + height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            if (Math.abs(dx) < width / 2 + padding && Math.abs(dy) < height / 2 + padding) {
                api.start({ x: dx / magnetStrength, y: dy / magnetStrength });
            }
            else {
                api.start({ x: 0, y: 0 });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [padding, disabled, magnetStrength, api]);
    return (_jsx("div", { ref: magnetRef, className: `magnet ${wrapperClassName}`, style: { position: 'relative', display: 'inline-block' }, ...props, children: _jsx(animated.div, { className: innerClassName, style: {
                transform: to([x, y], (xv, yv) => `translate3d(${xv}px, ${yv}px, 0)`),
                willChange: 'transform',
            }, children: children }) }));
};
const readIsDarkFromDOM = () => typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark'));
const Footer = () => {
    const [copyButtonText, setCopyButtonText] = useState('Copy E-mail address');
    const [showCopyIcon, setShowCopyIcon] = useState(true);
    const [isScrollHovered, setIsScrollHovered] = useState(false);
    const [emailHovered, setEmailHovered] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);
    const [hoveredSocial, setHoveredSocial] = useState(null);
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
        const onStorage = (e) => {
            if (e.key === 'theme')
                handle();
        };
        window.addEventListener('storage', onStorage);
        return () => {
            observer.disconnect();
            window.removeEventListener('storage', onStorage);
        };
    }, []);
    const socialLinks = [
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
    const handleCopyEmail = async (e) => {
        e.preventDefault();
        const email = 'your-email@example.com';
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
        }
        catch (err) {
            console.error('Copy failed:', err);
        }
    };
    const footerImgSrc = mounted && isDark ? '/images/footer-dark.jpg' : '/images/footer.jpg';
    return (_jsx("footer", { className: "main-footer", children: _jsxs("div", { className: "footer-container grid-container", children: [_jsx("div", { className: "footer-main-content", children: _jsxs("div", { className: "footer-row grid-x align-stretch", children: [_jsx("div", { className: "cell small-12", children: _jsx("img", { src: footerImgSrc, alt: "Footer illustration", className: "footer-image", loading: "lazy" }, isDark ? 'footer-dark' : 'footer-light') }), _jsx("div", { className: "cell small-12", children: _jsxs("div", { className: "footer-color-block", children: [_jsxs("h3", { className: "footer-title", children: ["Quiet interfaces, loud impact.", ' ', _jsx("span", { className: "footer-title-gradient gradient-clip", children: "Work with me." })] }), _jsxs("div", { className: "footer-cta", children: [_jsx(Magnet, { padding: 30, magnetStrength: 8, wrapperClassName: "magnet--email", children: _jsxs("a", { href: "mailto:your-email@example.com", onClick: handleCopyEmail, onMouseEnter: () => setEmailHovered(true), onMouseLeave: () => setEmailHovered(false), "aria-label": "Email me at your-email@example.com", tabIndex: 0, className: "btn-email", children: [_jsx("span", { className: "btn-fill", style: {
                                                                    height: emailHovered || emailCopied ? '100%' : '0%',
                                                                } }), _jsxs("span", { className: "btn-content", children: [emailCopied ? (_jsx("img", { src: "/images/confirm.svg", alt: "Copied" })) : (showCopyIcon && _jsx("img", { src: "/images/copy.svg", alt: "Copy" })), _jsx("span", { children: copyButtonText })] })] }) }), _jsx("ul", { className: "social-list", children: socialLinks.map((link) => (_jsx("li", { children: _jsx(Magnet, { padding: 20, magnetStrength: 10, children: _jsxs("a", { href: link.href, "aria-label": link.label, target: "_blank", rel: "noopener noreferrer", className: "social-btn", onMouseEnter: () => setHoveredSocial(link.label), onMouseLeave: () => setHoveredSocial(null), children: [_jsx("span", { className: "btn-fill", style: {
                                                                            height: hoveredSocial === link.label ? '100%' : '0%',
                                                                        } }), _jsx("img", { src: link.icon, alt: link.alt, className: "social-icon" })] }) }) }, link.label))) })] })] }) })] }) }), _jsxs("div", { className: "footer-bottom", children: [_jsxs("div", { className: "footer-brand", children: [_jsx("img", { src: "/images/logo-grey.svg", alt: "Your Logo" }), " Raoul Martens"] }), _jsxs("a", { href: "#top", onClick: (e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, className: "scroll-to-top body-sm-medium", onMouseEnter: () => setIsScrollHovered(true), onMouseLeave: () => setIsScrollHovered(false), children: ["Back to top", _jsx("img", { src: "/images/chevron-top.svg", alt: "", style: {
                                        transform: isScrollHovered ? 'translateY(-8px)' : 'translateY(0)',
                                    } })] })] })] }) }));
};
export default Footer;
