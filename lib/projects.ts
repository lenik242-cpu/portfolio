// Catalogue des projets du portfolio.
// `featured: true` → mis en avant sur l'accueil.
// `hero` = image de vignette ; `images` = galerie de la page projet.
// Les catégories affichées dans les filtres sont dérivées des projets présents.

export type Category =
  | "Personnages"
  | "Modélisation"
  | "Produit / e-commerce"
  | "Environnements";

export interface Project {
  slug: string;
  title: string;
  category: Category;
  year: string;
  tools: string[];
  summary: string; // phrase courte (carte / méta)
  description: string; // paragraphe (page projet)
  hero: string; // vignette, ex: "/projects/xbox-hero.webp"
  images: string[]; // galerie (page projet)
  featured?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "xbox-elite-series-x",
    title: "Xbox Elite & Series X",
    category: "Produit / e-commerce",
    year: "2025",
    tools: ["Maya", "Substance 3D Painter", "V-Ray", "Nuke"],
    summary: "Manette Elite Series 2 & console Series X.",
    description:
      "Modélisation et rendu produit de la manette Xbox Elite Series 2 et de la console Series X. Travail hard-surface détaillé, matériaux PBR (plastiques, métaux, grip), éclairage studio et compositing sous Nuke.",
    hero: "/projects/xbox-hero.webp",
    images: [
      "/projects/xbox-hero.webp",
      "/projects/xbox-02.webp",
      "/projects/xbox-03.webp",
      "/projects/xbox-04.webp",
      "/projects/xbox-05.webp",
    ],
    featured: true,
  },
  {
    slug: "macbook-pro-14",
    title: "MacBook Pro 14",
    category: "Produit / e-commerce",
    year: "2025",
    tools: ["Maya", "Substance 3D Painter", "V-Ray", "Nuke"],
    summary: "Modélisation & rendu produit.",
    description:
      "MacBook Pro 14 pouces modélisé et rendu en studio : hard-surface précis, matériaux (aluminium, écran, clavier) et vues éclatées. Une passe wireframe met en avant la topologie.",
    hero: "/projects/mac-hero.webp",
    images: [
      "/projects/mac-hero.webp",
      "/projects/mac-02.webp",
      "/projects/mac-wire.webp",
      "/projects/mac-wire2.webp",
    ],
    featured: true,
  },
  {
    slug: "dior-sauvage",
    title: "Dior Sauvage · Eau de Parfum",
    category: "Produit / e-commerce",
    year: "2025",
    tools: ["Maya", "Substance 3D Painter", "V-Ray"],
    summary: "Packshot 3D du flacon de parfum.",
    description:
      "Flacon Dior Sauvage (Eau de Parfum) recréé en 3D : modélisation précise, matériaux verre / métal / liquide et rendu packshot photoréaliste sous V-Ray. Une passe wireframe montre la topologie.",
    hero: "/projects/parfum-cap.webp",
    images: [
      "/projects/parfum-pedestal.webp",
      "/projects/parfum-float.webp",
      "/projects/parfum-cap.webp",
      "/projects/parfum-spray.webp",
      "/projects/parfum-wire.webp",
    ],
    featured: true,
  },
  {
    slug: "guitare-ellie-tlou2",
    title: "La guitare d'Ellie · The Last of Us Part II",
    category: "Modélisation",
    year: "2024",
    tools: ["Maya", "Substance 3D Painter", "V-Ray", "Nuke"],
    summary: "Recréation de la guitare de TLOU Part II.",
    description:
      "Recréation en 3D de la guitare d'Ellie dans The Last of Us Part II : corps acoustique sunburst, gravure fougère & papillon sur la table et incrustation papillon sur le manche. Modélisation, texturing bois et rendu, avec passe wireframe.",
    hero: "/projects/guitare-body.webp",
    images: [
      "/projects/guitare-body.webp",
      "/projects/guitare-neck.webp",
      "/projects/guitare-back.webp",
      "/projects/guitare-wire.webp",
    ],
    featured: true,
  },
];

export const FEATURED = PROJECTS.filter((p) => p.featured);

// Catégories réellement présentes (pour les filtres), dans l'ordre canonique.
const ORDER: Category[] = [
  "Personnages",
  "Modélisation",
  "Produit / e-commerce",
  "Environnements",
];
export const CATEGORIES: Category[] = ORDER.filter((c) =>
  PROJECTS.some((p) => p.category === c)
);

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
