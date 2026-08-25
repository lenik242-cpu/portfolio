// Point d'enregistrement unique des plugins GSAP.
// Importé par tout composant client qui crée des animations ScrollTrigger.
// L'enregistrement au niveau module est idempotent et s'exécute côté client
// dès le premier import, avant les effets des composants enfants.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
