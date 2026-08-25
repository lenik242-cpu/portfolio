"use client";

import type { ReactNode } from "react";

/**
 * Template Next : remonté à chaque navigation → joue une entrée cinématique
 * (fondu + montée + net) au chargement et entre les pages.
 * Volontairement sans fill-mode « forwards » : aucun transform/filter résiduel
 * ne subsiste après l'animation, ce qui préserve l'épinglage ScrollTrigger.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
