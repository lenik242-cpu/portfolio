// Textes éditoriaux longs (paragraphes de section) — centralisés ici pour
// rester faciles à relire/ajuster sans toucher au JSX. Les données courtes et
// structurelles (nom, liens, projets) restent dans site.ts / projects.ts.

// Source unique de vérité pour les logiciels affichés sur le site (page
// /about). Les tags outils des pages projet (lib/projects.ts) restent
// distincts — ce sont les logiciels réellement utilisés pour CE projet, pas
// la liste générale. Modélisation/sculpt → texturing → rendu → compositing
// → 2D/référence → preview temps réel.
export const SOFTWARE = [
  "ZBrush",
  "Maya",
  "3ds Max",
  "Substance 3D Painter",
  "V-Ray",
  "Nuke",
  "Photoshop",
  "Krita",
  "Marmoset Toolbag",
] as const;

export const ABOUT_CONTENT = {
  label: "À propos",
  titleBefore: "La personne derrière les ",
  titleAccent: "rendus",
  titleAfter: ".",
  photoAlt: "Portrait de Nikita Resta",
  paragraphs: [
    "Artiste 3D freelance formé au jeu vidéo, au cinéma et à l'animation, je me spécialise dans l'imagerie produit et la visualisation — je transforme objets, références et idées en rendus propres et crédibles. Basé en France, je travaille à distance avec des studios, des marques et des créateurs.",
    "Ma démarche part du détail : un hard-surface propre, une topologie honnête, rien laissé approximatif. La lumière et les matériaux viennent ensuite, toujours au service du produit — jamais comme décoration gratuite.",
    "Au quotidien, cela veut dire Maya pour la modélisation, Substance 3D pour le texturing et le look dev, V-Ray pour l'éclairage et le rendu, et Nuke quand un plan a besoin de compositing pour atteindre son image finale.",
  ],
} as const;

// Les quatre chapitres de la section Services (accueil). `accent` progresse
// doucement bleu froid → lavande à travers les quatre (même famille que
// --color-accent / --color-accent-blue), jamais hors palette.
export interface HomeService {
  n: string;
  name: string;
  desc: string;
  includes: string;
  accent: string;
}

// Page /about — version longue, réservée à qui clique pour en savoir plus
// (la section d'accueil reste courte, ceci ne la duplique pas). Ton honnête :
// aucune statistique ni track record inventés (cf. ABOUT_CONTENT, PROCESS).
export const ABOUT_PAGE_CONTENT = {
  backLabel: "Retour à l'accueil",
  label: "À propos",
  titleBefore: "Au-delà du ",
  titleAccent: "rendu",
  titleAfter: ".",
  intro:
    "La version courte est sur l'accueil. Celle-ci va un peu plus loin — le parcours, la manière de travailler, et ce qui se cache derrière chaque image.",
  photoAlt: "Portrait de Nikita Resta",
  bio: [
    "Formé au jeu vidéo, au cinéma et à l'animation, je suis devenu artiste 3D par goût du détail plus que par plan de carrière. Le character design reste ma spécialité de cœur — sculpter une silhouette jusqu'à ce qu'elle ait l'air vivante — mais la majorité de mes projets aujourd'hui sont des visualisations produit.",
    "Ma démarche ne change pas selon le sujet : une topologie honnête, des matériaux qui répondent correctement à la lumière, rien laissé approximatif parce que « ça se verra pas ». Le rendu final n'est que la conséquence logique d'un travail propre en amont.",
    "Cette exigence ne s'arrête pas à la 3D. Quand un projet a besoin d'un site plutôt que d'un rendu, je le conçois et je le développe aussi — direction artistique, intégration, mise en ligne — avec l'IA comme accélérateur, jamais comme raccourci qui abîme le résultat.",
    "Basé en France, je travaille à distance avec des studios, des marques et des créateurs, sur des missions courtes comme sur des collaborations suivies.",
  ],
  values: [
    {
      title: "Exigence technique",
      desc: "Un mesh propre, des UVs soignées, des fichiers exploitables — la qualité invisible qui fait gagner du temps à tout le monde.",
    },
    {
      title: "Polyvalence",
      desc: "Personnage, produit ou site web : je m'adapte au médium plutôt que d'imposer un seul outil ou un seul style.",
    },
    {
      title: "Communication claire",
      desc: "Des points réguliers, des retours simples à donner, et un délai de réponse court — pas de zone d'ombre en cours de route.",
    },
  ],
  includedLabel: "Ce que ça couvre",
  processLabel: "Comment je travaille",
  toolsLabel: "Logiciels",
  ctaText: "Un projet en tête ?",
  ctaButton: "Discuter de votre projet",
} as const;

export const HOME_SERVICES: HomeService[] = [
  {
    n: "01",
    name: "Modélisation 3D",
    desc: "Hard-surface, produits et objets — topologie propre, meshes prêts pour la production.",
    includes: "Modélisation hard-surface, topologie clean, UV, optimisation",
    accent: "#4c7dff",
  },
  {
    n: "02",
    name: "Character Design",
    desc: "Personnages et concept art — de la recherche à la sculpture finale.",
    includes: "Concept art, sculpting, character modeling, look dev",
    accent: "#627dff",
  },
  {
    n: "03",
    name: "Visualisation produit & e-commerce",
    desc: "Vos produits, mis en scène et rendus comme de vrais objets désirables.",
    includes: "Packshots, éclairage studio, imagerie e-commerce",
    accent: "#797cff",
  },
  {
    n: "04",
    name: "Sites web & expériences 3D",
    desc: "Des sites sur-mesure avec une vraie direction artistique et de la 3D intégrée.",
    includes: "Design, développement, intégration 3D, animations",
    accent: "#8f7cff",
  },
];
