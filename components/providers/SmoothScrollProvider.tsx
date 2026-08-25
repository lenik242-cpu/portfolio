"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface LenisContextValue {
  lenis: Lenis | null;
  /** Scroll fluide vers une cible (sélecteur, élément ou offset). */
  scrollTo: (
    target: string | HTMLElement | number,
    options?: { offset?: number; duration?: number }
  ) => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Respecte la préférence système « réduire les animations ».
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const instance = new Lenis({
      duration: 1.1,
      // easing exponentiel doux, proche des références Awwwards
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: 1.5,
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Lenis pilote la mise à jour de ScrollTrigger.
    instance.on("scroll", ScrollTrigger.update);

    // Un seul rAF partagé : le ticker GSAP fait avancer Lenis.
    const raf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  // Next.js échange le contenu de la page côté client sans recharger le
  // document : ni Lenis (limite de scroll) ni ScrollTrigger (positions des
  // triggers) ne savent que la hauteur réelle a changé. Sans ce recalcul,
  // Lenis peut bloquer le scroll avant la vraie fin d'une page plus courte
  // ou plus longue que la précédente.
  useEffect(() => {
    const recalc = () => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    };
    const raf = requestAnimationFrame(recalc);
    // Filet de sécurité : images/fonts qui finissent de se poser un peu
    // après la première peinture de la nouvelle page (galeries projet).
    const t = window.setTimeout(recalc, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname]);

  const scrollTo: LenisContextValue["scrollTo"] = (target, options) => {
    lenisRef.current?.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.4,
    });
  };

  return (
    <LenisContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
