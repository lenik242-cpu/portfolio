// Catalogue des projets du portfolio.
// `featured: true` → mis en avant sur l'accueil.
// `hero` = image de vignette ; `images` = galerie de la page projet.
// Les catégories affichées dans les filtres sont dérivées des projets présents.

export type Category =
  | "Personnages"
  | "Modélisation"
  | "Produit / e-commerce"
  | "Environnements";

// Dimensions réelles du fichier (largeur/hauteur intrinsèques) — réservent
// l'espace de la galerie AVANT que l'image (lazy) ne charge. Sans ça, la
// hauteur réelle de la page grandit pendant le scroll (chaque image lazy qui
// charge agrandit le document) et déphase Lenis/ScrollTrigger : la page
// semble bloquée avant sa vraie fin. Plus la galerie contient d'images
// hautes, plus l'écart est perceptible (cas du parfum, 3 images portrait).
export interface GalleryImage {
  src: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  year: string;
  tools: string[];
  summary: string; // phrase courte (carte / méta)
  description: string; // paragraphe (page projet)
  hero: string; // vignette, ex: "/projects/xbox-hero.webp"
  images: GalleryImage[]; // galerie (page projet)
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
      { src: "/projects/xbox-hero.webp", width: 2000, height: 2000 },
      { src: "/projects/xbox-02.webp", width: 2000, height: 2000 },
      { src: "/projects/xbox-03.webp", width: 2000, height: 2000 },
      { src: "/projects/xbox-04.webp", width: 1125, height: 2000 },
      { src: "/projects/xbox-05.webp", width: 2000, height: 2000 },
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
      { src: "/projects/mac-hero.webp", width: 1333, height: 2000 },
      { src: "/projects/mac-02.webp", width: 2000, height: 2000 },
      { src: "/projects/mac-wire.webp", width: 1333, height: 2000 },
      { src: "/projects/mac-wire2.webp", width: 2000, height: 2000 },
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
      { src: "/projects/parfum-pedestal.webp", width: 736, height: 1308 },
      { src: "/projects/parfum-float.webp", width: 736, height: 1308 },
      { src: "/projects/parfum-cap.webp", width: 2000, height: 2000 },
      { src: "/projects/parfum-spray.webp", width: 2000, height: 2000 },
      { src: "/projects/parfum-wire.webp", width: 736, height: 1308 },
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
      { src: "/projects/guitare-body.webp", width: 826, height: 901 },
      { src: "/projects/guitare-neck.webp", width: 838, height: 868 },
      { src: "/projects/guitare-back.webp", width: 969, height: 919 },
      { src: "/projects/guitare-wire.webp", width: 2000, height: 2000 },
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
