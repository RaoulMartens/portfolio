/**
 * Structured data describing the projects that appear on the home page.
 * Keeping content separate from components means the JSX focuses on semantic
 * structure (criterion 6.1) while the data can be reused in responsive contexts
 * or alternative layouts (criterion 6.2).
 */
export type HomeProjectMedia =
  | {
      kind: "video";
      alt: string;
      poster: string;
      sources: { webm: string; mp4: string };
    }
  | {
      kind: "image";
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
    title: "Community building through a digital bulletin board.",
    meta: "Hallo Buur, 2025",
    link: "/hallo-buur",
    media: {
      kind: "video",
      poster: "/images/hallo-buur-cover.jpg",
      alt: "Hallo Buur app interface with central logo and two example posts: one about organizing a board game afternoon and another about asking neighbors for pasta ingredients.",
      sources: {
        webm: "/videos/hallo-buur.webm",
        mp4: "/videos/hallo-buur.mp4",
      },
    },
  },
  {
    title: "A fresh take on the news-based reading comprehension method.",
    meta: "Nieuwsbegrip, 2024",
    link: "/nieuwsbegrip",
    media: {
      kind: "image",
      src: "/images/nieuwsbegrip-cover.jpg",
      alt: "Illustration of a laptop displaying the Nieuwsbegrip dashboard interface, showing quick access tiles and workflows on a clean, modern layout.",
    },
  },
  {
    title: "Bringing an Eredivisie club's matches and campaigns to life.",
    meta: "PEC Zwolle, 2023 - 2024",
    link: "/pec-zwolle",
    media: {
      kind: "image",
      src: "/images/peczwolle-cover.jpg",
      alt: "A showcase of your third project",
    },
  },
  {
    title: "Researching social connection in a shifting residential community.",
    meta: "Hallo Buur, 2025",
    link: "/hallo-buur-2",
    media: {
      kind: "image",
      src: "/images/hallo-buur2-cover.jpg",
      alt: "A showcase of your fourth project",
    },
  },
];
