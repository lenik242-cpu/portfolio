// Interludes vidéo « Flow » — amélioration progressive, rare et secondaire.
// Config centralisée : pour remplacer/activer une vidéo, changer ici (les
// posters WebP restent le fallback principal).
export type FlowClip = { src: string; poster: string };

// Vidéos ACTIVES (versions web-optimisées : H.264 Main, sans audio, faststart,
// 24 fps, 1280×720). Les originaux sont conservés dans public/media/.
export const FLOW: Record<"resonance" | "dissolution", FlowClip> = {
  resonance: {
    src: "/media/optimized/material-resonance.web.mp4",
    poster: "/media/posters/material-resonance.webp",
  },
  dissolution: {
    src: "/media/optimized/signal-dissolution.web.mp4",
    poster: "/media/posters/signal-dissolution.webp",
  },
};

// DÉSACTIVÉ par défaut — l'intro reste 100 % WebGL/CSS (aucune vidéo).
// Pour réactiver une arrivée vidéo plus tard : fournir un MP4 optimisé + poster
// ici et le recâbler dans components/sections/Intro.tsx.
// export const FLOW_ARRIVAL: FlowClip | null = null;
