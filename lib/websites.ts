// Catalogue des sites web fictifs (démonstration de savoir-faire web/3D).
// Source unique : édite les textes/URLs ici, la section d'accueil et les
// pages dédiées (/web/[slug]) s'actualisent automatiquement.

export interface Website {
  slug: string;
  name: string;
  url: string;
  tag: string; // phrase courte affichée sur la carte
  category: string; // "Type de site · Domaine"
  description: string; // paragraphe (page dédiée)
  image: string;
  width: number;
  height: number;
}

export const WEBSITES: Website[] = [
  {
    slug: "burnt",
    name: "BURNT",
    url: "https://burntproject.vercel.app",
    tag: "Restaurant / food branding",
    category: "Site vitrine · Restauration",
    description:
      "Une identité de restaurant pensée comme une expérience sensorielle. Direction artistique chaleureuse et affirmée, photographie mise en avant, parcours gourmand du menu à la commande. Un site qui donne faim avant même de lire une ligne.",
    image: "/websites/burnt.webp",
    width: 1873,
    height: 972,
  },
  {
    slug: "nova",
    name: "NØVA",
    url: "https://novaproject-wheat.vercel.app",
    tag: "Technical fashion",
    category: "Site vitrine · Mode technique",
    description:
      "Une marque de vêtements techniques à l'esthétique minimale et froide. Grands aplats, typographie massive, animations au scroll qui laissent respirer le produit. Le vêtement comme objet de design.",
    image: "/websites/nova.webp",
    width: 1872,
    height: 972,
  },
  {
    slug: "aera",
    name: "AERA One",
    url: "https://aera-forest.vercel.app",
    tag: "Premium audio product",
    category: "Site produit · Audio premium",
    description:
      "Une page produit pour un casque audio haut de gamme. Mise en scène cinématique de l'objet, détails techniques révélés au scroll, palette sombre et dorée qui évoque le luxe et la précision d'un instrument façonné à la main.",
    image: "/websites/aera.webp",
    width: 1871,
    height: 976,
  },
  {
    slug: "aeron",
    name: "AERØN",
    url: "https://aeronproject.vercel.app",
    tag: "Motorsport / F1 constructor",
    category: "Site immersif · Motorsport",
    description:
      "Un constructeur de Formule 1 fictif, présenté comme une expérience immersive. Navigation par chapitres, mise en scène 3D de la monoplace, atmosphère sombre et tendue. Le site le plus spectaculaire de la série — pensé pour impressionner.",
    image: "/websites/aeron.webp",
    width: 1869,
    height: 969,
  },
];

export function getWebsite(slug: string): Website | undefined {
  return WEBSITES.find((w) => w.slug === slug);
}
