"use client";

import { useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Séquence d'ouverture cinématique. Le site arrive presque noir, une lumière
 * se lève à l'emplacement du cristal, un trait de lumière balaie l'écran, puis
 * le voile d'obsidienne se dissout pour révéler la scène. Joué une seule fois
 * par session ; ignoré en reduced-motion. Verrouille le scroll le temps de
 * l'ouverture. La chorégraphie DOM est confiée à Framer Motion (GSAP reste sur
 * le scroll et le WebGL).
 */
export default function HeroIntro() {
  const { lenis } = useLenis();
  // Visible dès le premier rendu (SSR + hydratation) → aucun flash du hero.
  const [show, setShow] = useState(true);

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const played = sessionStorage.getItem("nr-intro");

    // Rejeu de session ou préférence « réduire les animations » → pas d'intro.
    if (reduced || played) {
      setShow(false);
      return;
    }

    sessionStorage.setItem("nr-intro", "1");
    lenis?.stop();
    document.documentElement.classList.add("intro-active");
    const t = window.setTimeout(() => setShow(false), 2000);
    return () => window.clearTimeout(t);
  }, [lenis]);

  // Rend le scroll dès que le voile s'en va.
  useLayoutEffect(() => {
    if (!show) {
      lenis?.start();
      document.documentElement.classList.remove("intro-active");
    }
  }, [show, lenis]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="hero-intro"
          className="fixed inset-0 z-[90] overflow-hidden bg-[#060708]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          {/* Lueur qui se lève là où naît le cristal (centre-droite) */}
          <motion.div
            className="hero-intro-glow absolute h-[80vmax] w-[80vmax] rounded-full"
            style={{
              top: "50%",
              left: "66%",
              x: "-50%",
              y: "-50%",
            }}
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: [0.45, 1, 1.22], opacity: [0, 0.95, 0.5] }}
            transition={{ duration: 2, ease: EASE, times: [0, 0.55, 1] }}
          />

          {/* Trait de lumière qui balaie la scène une fois */}
          <motion.div
            className="hero-intro-sweep absolute top-0 h-full w-[2px]"
            style={{ filter: "blur(1px)" }}
            initial={{ left: "-10%", opacity: 0 }}
            animate={{ left: ["-10%", "115%"], opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
          />

          {/* Signature discrète qui se dissout */}
          <motion.span
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-[0.7rem] uppercase tracking-[0.5em] text-[#e9e7df]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, ease: EASE, times: [0, 0.6, 1] }}
          >
            Nikita&nbsp;Resta
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
