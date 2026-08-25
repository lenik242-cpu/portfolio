"use client";

import { useEffect, useState } from "react";
import { RadialGlowBackground } from "@/components/ui/tailwind-css-background-snippet";
import { ShaderBackground } from "@/components/ui/valley-of-the-mind";

/**
 * Même monde que Selected Work/Services/About sur l'accueil, porté sur les
 * pages secondaires (/about, /portfolio, /portfolio/[slug], /services) —
 * celles atteintes depuis « En savoir plus »/« Tous les projets ». Fixe (pas
 * de restructuration de page nécessaire), opacité discrète en continu : ces
 * pages sont denses en texte, la lisibilité prime. Mobile / reduced-motion :
 * fallback statique, comme partout ailleurs.
 */
export default function PageShaderBackground() {
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setUseShader(!reduced && !mobile);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-45"
    >
      {useShader ? <ShaderBackground className="absolute inset-0" /> : <RadialGlowBackground />}
    </div>
  );
}
