/**
 * Geordende data voor de projecten op de homepage.
 * Houdt content gescheiden van presentatie (criterium 6.1)
 * en maakt hergebruik in responsive componenten mogelijk (criterium 6.2).
 */
export type HomeProjectMedia =
  | {
    kind: 'video';
    alt: string;
    poster: string;
    sources: { webm: string; mp4: string };
  }
  | {
    kind: 'image';
    alt: string;
    src: string;
  };

export interface HomeProject {
  title: string;
  meta: string;
  link: string;
  media: HomeProjectMedia;
}

export const homeProjects: HomeProject[] = [
  {
    title: 'Community building through a digital bulletin board.',
    meta: 'Hallo Buur · 2025',
    link: '/hallo-buur',
    media: {
      kind: 'video',
      poster: '/images/hallo-buur-cover.webp',
      alt: 'Hallo Buur app interface showing a central logo and example neighbor posts about a board-game afternoon and borrowing pasta.',
      sources: {
        webm: '/videos/hallo-buur.webm',
        mp4: '/videos/hallo-buur.mp4',
      },
    },
  },
  {
    title: 'A fresh take on the news-based reading comprehension method.',
    meta: 'Nieuwsbegrip · 2024',
    link: '/nieuwsbegrip',
    media: {
      kind: 'image',
      src: '/images/nieuwsbegrip-cover.webp',
      alt: 'Laptop with the Nieuwsbegrip dashboard on screen, showing lesson tiles and clear navigation.',
    },
  },
  {
    title: "Bringing an Eredivisie club's matches and campaigns to life.",
    meta: 'PEC Zwolle · 2023–2024',
    link: '/pec-zwolle',
    media: {
      kind: 'image',
      src: '/images/peczwolle-cover.webp',
      alt: 'Street poster of two PEC Zwolle fans looking toward a lit stadium filled with supporters.',
    },
  },
  {
    title: 'Researching social connection in a changing residential community.',
    meta: 'Hallo Buur · 2025',
    link: '/hallo-buur-2',
    media: {
      kind: 'image',
      src: '/images/hallo-buur2-cover.webp',
      alt: 'Elderly resident using an interactive screen with community activity cards such as game afternoons and repair help.',
    },
  },
];
