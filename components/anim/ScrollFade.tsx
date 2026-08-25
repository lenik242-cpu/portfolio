"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Fondu + léger parallax lié au scroll : le contenu monte et disparaît en
 * douceur au fur et à mesure qu'on quitte la zone (effet « le texte s'en va »).
 * `trigger` : sélecteur de l'élément déclencheur (par défaut, le wrapper).
 */
export default function ScrollFade({
  children,
  className,
  trigger,
  yPercent = -16,
}: {
  children: ReactNode;
  className?: string;
  trigger?: string;
  yPercent?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Résout le sélecteur en élément (évite « Element not found »).
    const triggerEl = (trigger && document.querySelector(trigger)) || el;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [trigger, yPercent]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
