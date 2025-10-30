import React from "react";

interface SkipLinkProps {
  /** Het id van het element waar we naartoe springen. Standaard `main-content`. */
  targetId?: string;
  /** Tekst van de link, zodat gebruikers weten wat er gebeurt. */
  label?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ targetId = "main-content", label = "Skip to main content" }) => {
  const handleClick = (_event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Wacht tot de browser gesprongen is en zet daarna de focus op het doel (toetsenbordvriendelijk).
    window.requestAnimationFrame(() => {
      if (typeof (target as HTMLElement).focus === "function") {
        (target as HTMLElement).focus({ preventScroll: true });
      }
    });
    // Laat de standaard anker-actie de scroll en hash regelen (structuur → 6.1).
  };

  return (
    <a className="skip-link" href={`#${targetId}`} onClick={handleClick}>
      {label}
    </a>
  );
};

export default SkipLink;
