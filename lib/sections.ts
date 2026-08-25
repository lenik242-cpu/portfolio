// Source de vérité pour les sections de la page et la navigation.
// L'ordre du tableau = ordre d'apparition dans le scroll vertical.
export type SectionId = "hero" | "work" | "services" | "about" | "contact";

export interface SectionMeta {
  id: SectionId;
  label: string; // libellé affiché dans la nav
}

export const SECTIONS: SectionMeta[] = [
  { id: "hero", label: "Accueil" },
  { id: "work", label: "Projets" },
  { id: "services", label: "Services" },
  { id: "about", label: "À propos" },
  { id: "contact", label: "Contact" },
];

// Sections affichées dans la nav (on masque « Accueil » au profit du logo).
export const NAV_SECTIONS = SECTIONS.filter((s) => s.id !== "hero");
