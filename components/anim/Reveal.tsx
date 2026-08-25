"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  /** Balise HTML de rendu (div par défaut). */
  as?: ElementType;
  className?: string;
  /** Délai avant l'animation (s). */
  delay?: number;
  /** Décalage vertical de départ (px). */
  y?: number;
  /**
   * Si vrai, anime les enfants directs en cascade (stagger)
   * plutôt que le conteneur d'un bloc.
   */
  stagger?: boolean;
}

/**
 * Enveloppe un bloc et déclenche son apparition quand il entre dans le viewport,
 * piloté par ScrollTrigger (donc synchronisé avec le smooth scroll Lenis).
 */
export default function Reveal({
  children,
  as: Component = "div",
  className,
  delay = 0,
  y = 40,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Balise polymorphe : typée en permissif pour accepter ref/className/style.
  // (limite connue de TS : une union d'ElementType résout ses props en `never`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = stagger
      ? (Array.from(el.children) as HTMLElement[])
      : [el];

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1 });
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // En mode stagger, le conteneur reste masqué en markup (anti-flash) :
      // on le révèle et on masque ses enfants dans le même tick avant animation.
      if (stagger) gsap.set(el, { opacity: 1 });

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay,
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <Tag
      ref={ref}
      className={className}
      // état initial pour éviter le flash avant l'hydratation de GSAP
      style={{ opacity: 0 }}
    >
      {children}
    </Tag>
  );
}
