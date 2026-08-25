// Identité éditoriale du site — placeholders à personnaliser.
// (Le nom, la baseline et les liens sont volontairement centralisés ici.)
export const SITE = {
  brand: "Nikita Resta", // ← nom / marque affiché dans la nav, le hero et le footer
  role: "Artiste 3D",
  tagline: "Imagerie produit, animation et expériences visuelles.",
  email: "nikita.resta.pro@gmail.com",
  socials: [
    { label: "ArtStation", href: "https://www.artstation.com/nikitaresta1" },
    { label: "Instagram", href: "https://www.instagram.com/nik242_3d" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/nikita-resta-82a29333b/",
    },
  ],
  // Tuiles « À propos » — valeurs honnêtes, pensées pour un artiste qui démarre.
  // Modifie-les librement quand ta situation évolue.
  stats: [
    { value: "Freelance", label: "disponible pour vos projets" },
    { value: "9", label: "logiciels maîtrisés" },
    { value: "24 h", label: "délai de réponse moyen" },
  ],
  // Logiciels : voir SOFTWARE dans lib/content.ts (source unique de vérité,
  // utilisée par /about — ne pas dupliquer la liste ici).
  // Services « au-delà de la 3D » — bloc à part, extensible.
  // Ajoute simplement de nouvelles entrées quand tu proposeras d'autres services.
  otherServices: [
    {
      title: "Sites web sur-mesure, assistés par IA",
      desc: "Sites vitrines et landing pages modernes, rapides et personnalisés, conçus efficacement grâce à l'IA.",
    },
  ],
} as const;
