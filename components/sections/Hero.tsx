"use client";

import { useEffect, useRef } from "react";
import Intro from "@/components/sections/Intro";
import LiquidMetalButton from "@/components/ui/LiquidMetalButton";
import { gsap } from "@/lib/gsap";

/**
 * HERO — la 3D est le héros (DESIGN.md). Une vidéo bouclée Blender (rendu
 * produit, éclairage cinématique) remplit le hero en `object-cover`, visible
 * dès l'arrivée. Le titre est lisible PAR-DESSUS grâce à un scrim obsidienne
 * (le seul calque au-dessus du rendu : un voile de contraste, pas un effet).
 * Au scroll : le hero se pin en haut d'écran (vidéo + texte), le reste du
 * site défile par-dessus ; une légère parallaxe (scale) anime la vidéo
 * pendant que le hero est pin. WebM + fallback MP4, muet, loop, playsinline.
 * Poster = le render statique (affiché tant que la vidéo charge).
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".hero-line", { yPercent: 0 });
        gsap.set(".hero-fx", { opacity: 1, y: 0 });
        return;
      }
      // Titres : révélation par masque
      gsap.set(".hero-line", { yPercent: 115 });
      gsap.utils.toArray<HTMLElement>(".hero-line").forEach((l, i) => {
        gsap.to(l, { yPercent: 0, duration: 0.9, ease: "power4.out", delay: 0.35 + i * 0.12 });
      });
      gsap.fromTo(
        ".hero-fx",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.95, stagger: 0.1 }
      );
      // Hero pin : la vidéo reste fixée en haut d'écran pendant que le reste
      // du site défile par-dessus (une fois le pin relâché, le flux normal
      // reprend). Légère parallaxe (scale) de la vidéo pendant le pin.
      gsap.to(".hero-video", {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={root} className="relative min-h-[100dvh] overflow-hidden">
      <Intro />

      {/* Rendu 3D héros : vidéo bouclée plein cadre */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#08090d]">
        <video
          className="hero-video h-full w-full object-cover"
          style={{ objectPosition: "66% center" }}
          autoPlay
          loop
          muted
          playsInline
          // eslint-disable-next-line react/no-unknown-property -- iOS Safari ancien : lu tel quel par React, redondant mais inoffensif avec playsInline.
          webkit-playsinline="true"
          preload="auto"
          poster="/projects/parfum-pedestal.webp"
          aria-hidden="true"
        >
          <source src="/hero.webm" type="video/webm" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Scrim obsidienne pour la lisibilité du titre (léger, dégradé vers la gauche) */}
        <div className="hero-scrim pointer-events-none absolute inset-0" />
      </div>

      {/* Texte lisible par-dessus, ancré à gauche */}
      <div className="relative z-10 flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-7xl px-8 sm:px-10">
          <div className="flex max-w-xl flex-col gap-5">
            <div className="overflow-hidden pb-1">
              <h1 className="hero-line text-5xl font-medium leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
                Nikita Resta
              </h1>
            </div>
            <div className="overflow-hidden">
              <p className="hero-line font-mono text-sm uppercase tracking-[0.3em] text-muted">
                Artiste 3D
              </p>
            </div>
            <p className="hero-fx max-w-md text-lg leading-relaxed text-foreground/70">
              Imagerie produit, animation et expériences visuelles.
            </p>
            <div className="hero-fx flex flex-wrap items-center gap-4 pt-3">
              <LiquidMetalButton href="#work">
                Voir les projets <span aria-hidden>&rarr;</span>
              </LiquidMetalButton>
              <LiquidMetalButton href="#contact">Contact</LiquidMetalButton>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-8 z-10 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted sm:left-10">
        Freelance&nbsp;·&nbsp;France
      </div>
    </section>
  );
}
