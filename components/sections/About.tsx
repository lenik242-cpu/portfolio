"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ABOUT_CONTENT } from "@/lib/content";
import { RadialGlowBackground } from "@/components/ui/tailwind-css-background-snippet";
import { ShaderBackground } from "@/components/ui/valley-of-the-mind";

const EASE = "power3.out";

/**
 * ABOUT — se lit d'abord (pas de CTA imposant, pas d'effet par-dessus la
 * photo). Deux points d'entrée discrets vers /about pour qui veut en savoir
 * plus : la photo (cursor VIEW, comme les projets) et un lien texte sobre en
 * bas de colonne. Le contenu affiché ici ne change pas.
 *
 * Transition depuis Services : même fond shader discret que Selected
 * Work/Services (continuité d'un même monde), mais son opacité part de 0 et
 * remonte doucement au scroll — la section démarre dans l'obscurité laissée
 * par la fin de Services et la lumière revient progressivement. Transition
 * par la lumière uniquement, aucun élément graphique ajouté.
 *
 * Révélation d'entrée : un seul déclenchement (once) à l'arrivée de la
 * section, pas un Reveal par élément — label → titre → photo (clip-path,
 * « rideau » qui se lève du bas vers le haut) → paragraphes, en cascade
 * légèrement chevauchée. Rejoué une seule fois, jamais en sens inverse.
 *
 * Parallaxe : photo et texte se déplacent à des vitesses légèrement
 * différentes au scroll (±14px / ±6px) — sur un wrapper distinct de
 * l'élément animé à l'entrée, pour ne jamais piloter la même propriété deux
 * fois sur le même nœud (parallaxe continue vs. révélation ponctuelle).
 */
export default function About() {
  const { label, titleBefore, titleAccent, titleAfter, photoAlt, paragraphs } =
    ABOUT_CONTENT;

  const root = useRef<HTMLElement>(null);
  const shaderWrapRef = useRef<HTMLDivElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLAnchorElement>(null);
  const [useShader, setUseShader] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setReduced(r);
    setUseShader(!r && !mobile);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const paras = el.querySelectorAll<HTMLElement>(".about-para");

    const ctx = gsap.context(() => {
      if (reduced) {
        if (shaderWrapRef.current) gsap.set(shaderWrapRef.current, { opacity: 0.35 });
        gsap.set([labelRef.current, titleRef.current, photoRef.current, ...paras], {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
        });
        return;
      }

      // Révélation d'entrée — un « rideau » qui se lève : label, titre,
      // photo (clip-path bas → haut) puis paragraphes, en cascade souple.
      gsap.set([labelRef.current, titleRef.current], { y: 26 });
      gsap.set(photoRef.current, { y: 18 });
      gsap.set(paras, { y: 24 });

      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true } })
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.6, ease: EASE })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.75, ease: EASE }, "-=0.4")
        .to(
          photoRef.current,
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: EASE },
          "-=0.35"
        )
        .to(paras, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.12 }, "-=0.55");

      // Fondu de matière : le fond remonte de l'obscurité pendant que la
      // section entre à l'écran, puis se stabilise à une opacité discrète.
      if (shaderWrapRef.current) {
        gsap.fromTo(
          shaderWrapRef.current,
          { opacity: 0 },
          {
            opacity: 0.55,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: true },
          }
        );
      }

      // Parallaxe légère, avant-plan : photo et texte à des vitesses
      // différentes, quelques dizaines de pixels au grand maximum.
      if (photoWrapRef.current) {
        gsap.fromTo(
          photoWrapRef.current,
          { y: -14 },
          { y: 14, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
      if (textWrapRef.current) {
        gsap.fromTo(
          textWrapRef.current,
          { y: -6 },
          { y: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={root} className="relative overflow-hidden py-24 sm:py-32">
      <div ref={shaderWrapRef} className="absolute inset-0 -z-20 bg-[#08090d]" style={{ opacity: 0 }}>
        {useShader ? <ShaderBackground className="absolute inset-0" /> : <RadialGlowBackground />}
      </div>
      <div className="section-fade-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 sm:h-56" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-6">
        <div className="mb-16 max-w-2xl sm:mb-20">
          <p
            ref={labelRef}
            style={{ opacity: 0 }}
            className="mb-5 font-mono text-xs uppercase tracking-[0.32em] text-muted"
          >
            {label}
          </p>
          <h2
            ref={titleRef}
            style={{ opacity: 0 }}
            className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-6xl"
          >
            {titleBefore}
            <span className="font-serif italic font-normal text-gradient">{titleAccent}</span>
            {titleAfter}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div ref={photoWrapRef} className="lg:col-span-5">
            <Link
              ref={photoRef}
              href="/about"
              data-cursor="view"
              style={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
              className="block aspect-[4/5] max-w-md overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/about.jpg"
                alt={photoAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Link>
          </div>

          <div ref={textWrapRef} className="flex flex-col gap-6 lg:col-span-7 lg:max-w-xl lg:pt-2">
            {paragraphs.map((p, i) => (
              <p key={i} style={{ opacity: 0 }} className="about-para text-lg leading-relaxed text-muted">
                {p}
              </p>
            ))}
            <Link
              href="/about"
              data-cursor="link"
              style={{ opacity: 0 }}
              className="about-para group inline-flex items-center gap-2 self-start border-b border-white/25 pb-1 text-base text-foreground/90 transition-colors hover:border-accent hover:text-accent"
            >
              En savoir plus
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
