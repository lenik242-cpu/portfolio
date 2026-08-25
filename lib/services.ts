// Données des services 3D — partagées entre la section d'accueil et /services.
export interface Service {
  title: string;
  desc: string;
}

export const SERVICES: Service[] = [
  {
    title: "Modélisation 3D",
    desc: "Hard-surface et organique : objets, props, décors et assets, du blocking au mesh production-ready.",
  },
  {
    title: "Personnages & créatures",
    desc: "Ma spécialité de cœur : sculpt, anatomie et stylisation pour le jeu vidéo, le film et l'animation.",
  },
  {
    title: "Visualisation produit · e-commerce",
    desc: "Modèles et rendus produits photoréalistes pour boutiques en ligne, fiches et configurateurs.",
  },
  {
    title: "Texturing & look dev",
    desc: "UVs propres, PBR sous Substance, shading et matériaux réalistes ou stylisés.",
  },
  {
    title: "Real-time & optimisation",
    desc: "Retopo, baking, LODs et assets légers optimisés pour le temps réel (Unreal, Unity).",
  },
];

// Étapes de collaboration — décrit ta façon de travailler (aucune promesse de
// track record, juste le déroulé d'un projet).
export interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}

export const PROCESS: ProcessStep[] = [
  {
    step: "01",
    title: "Brief & références",
    desc: "On cadre ensemble le besoin, le style visé et les contraintes techniques.",
  },
  {
    step: "02",
    title: "Blocking",
    desc: "Mise en volume rapide pour valider proportions, silhouette et direction.",
  },
  {
    step: "03",
    title: "Sculpt / modélisation",
    desc: "Passage en haute définition : détails, anatomie et propreté du mesh.",
  },
  {
    step: "04",
    title: "Texturing & look dev",
    desc: "UVs, matériaux PBR, shading et réglages de rendu.",
  },
  {
    step: "05",
    title: "Livraison",
    desc: "Fichiers optimisés au format souhaité, prêts à être utilisés.",
  },
];
