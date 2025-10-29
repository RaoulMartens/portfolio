/**
 * Geordende data voor de projecten op de homepage.
 * Door content apart te houden kan JSX zich op semantiek richten (criterium 6.1)
 * en kan dezelfde data hergebruikt worden in responsive layouts (criterium 6.2).
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
      alt: "A street view near a historic city gate shows a bus stop poster featuring two football fans, an adult and a child, looking toward a brightly lit stadium scene filled with team colors and supporters.",
    },
  },
  {
    title: "Researching social connection in a shifting residential community.",
    meta: "Hallo Buur, 2025",
    link: "/hallo-buur-2",
    media: {
      kind: "image",
      src: "/images/hallo-buur2-cover.jpg",
      alt: "An elderly man uses a large interactive screen displaying activity cards for residents, such as a game afternoon and help with a drill.",
    },
  },
];
