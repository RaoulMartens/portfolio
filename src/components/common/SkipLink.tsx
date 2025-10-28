import React from "react";

interface SkipLinkProps {
  /** The id of the element to skip to. Defaults to `main-content`. */
  targetId?: string;
  /** Optional label for the skip link. */
  label?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ targetId = "main-content", label = "Skip to main content" }) => {
  const handleClick = (_event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Wait for the browser to move focus to the anchor target, then ensure focus actually lands there.
    window.requestAnimationFrame(() => {
      if (typeof (target as HTMLElement).focus === "function") {
        (target as HTMLElement).focus({ preventScroll: true });
      }
    });
    // Let the default anchor behaviour handle the scroll + hash so history works as expected.
  };

  return (
    <a className="skip-link" href={`#${targetId}`} onClick={handleClick}>
      {label}
    </a>
  );
};

export default SkipLink;
