"use client";

import { useEffect } from "react";

/**
 * Pilote le reflet spéculaire « verre liquide » sur tout élément portant la
 * classe `.glass-liquid`. Un seul écouteur délégué sur le document met à jour
 * les variables CSS --glx/--gly (position du curseur) et --glare (intensité)
 * de l'élément survolé — pas besoin de handler par carte.
 */
export default function LiquidGlassController() {
  useEffect(() => {
    let current: HTMLElement | null = null;

    const clear = () => {
      if (current) current.style.setProperty("--glare", "0");
      current = null;
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".glass-liquid"
      ) as HTMLElement | null;

      if (target !== current) {
        if (current) current.style.setProperty("--glare", "0");
        current = target;
      }
      if (target) {
        const r = target.getBoundingClientRect();
        target.style.setProperty("--glx", `${e.clientX - r.left}px`);
        target.style.setProperty("--gly", `${e.clientY - r.top}px`);
        target.style.setProperty("--glare", "1");
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", clear);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", clear);
    };
  }, []);

  return null;
}
