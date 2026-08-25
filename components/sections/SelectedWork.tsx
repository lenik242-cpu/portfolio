"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PROJECTS } from "@/lib/projects";
import { RadialGlowBackground } from "@/components/ui/tailwind-css-background-snippet";
import { ShaderBackground } from "@/components/ui/valley-of-the-mind";

/**
 * SELECTED WORK — exactement trois projets, en grandes sections éditoriales.
 * Numéro / titre / catégorie / rôle / logiciels / description courte / lien.
 * Reveal d'image par masque + zoom lent (les renders restent propres et nets).
 * Formulations honnêtes (le parfum est une étude produit personnelle).
 * Fond : shader WebGL animé (palette du site), fondu en haut/bas pour une
 * transition continue avec Hero/Services. Mobile / reduced-motion : fond
 * radial statique (RadialGlowBackground), pas de canvas WebGL monté.
 */
const hero = (slug: string) => PROJECTS.find((p) => p.slug === slug)?.hero ?? "";

const WORK = [
  {
    n: "01",
    slug: "dior-sauvage",
    title: "Eau de Parfum",
    category: "Visualisation produit",
    role: "Étude produit personnelle",
    software: "Maya · Substance 3D · V-Ray",
    blurb:
      "Une étude personnelle d'un flacon de parfum — verre, métal et liquide, éclairés et rendus comme un packshot produit épuré.",
    image: hero("dior-sauvage"),
  },
  {
    n: "02",
    slug: "macbook-pro-14",
    title: "MacBook Pro 14",
    category: "Visualisation produit",
    role: "Modélisation & rendu",
    software: "Maya · Substance 3D · V-Ray",
    blurb:
      "Modélisation hard-surface et rendu studio du MacBook Pro, avec une passe wireframe de topologie.",
    image: hero("macbook-pro-14"),
  },
  {
    n: "03",
    slug: "xbox-elite-series-x",
    title: "Xbox Elite & Series X",
    category: "Visualisation produit",
    role: "Modélisation & rendu",
    software: "Maya · Substance 3D · V-Ray · Nuke",
    blurb:
      "Modélisation hard-surface détaillée de la manette Elite et de la Series X, avec matériaux PBR et éclairage studio.",
    image: hero("xbox-elite-series-x"),
  },
];

export default function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setUseShader(!reduced && !mobile);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".work-mask", { scaleY: 0 });
        gsap.set(".work-line", { yPercent: 0 });
        gsap.set(".work-meta", { opacity: 1, y: 0 });
        return;
      }
      gsap.utils.toArray<HTMLElement>(".work-row").forEach((row) => {
        gsap.fromTo(
          row.querySelector(".work-mask"),
          { scaleY: 1 },
          {
            scaleY: 0,
            transformOrigin: "top",
            duration: 1.1,
            ease: "power4.inOut",
            scrollTrigger: { trigger: row, start: "top 78%" },
          }
        );
        gsap.fromTo(
          row.querySelector(".work-img"),
          { scale: 1.14 },
          {
            scale: 1,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%" },
          }
        );
        const line = row.querySelector(".work-line");
        if (line) {
          gsap.set(line, { yPercent: 115 });
          gsap.to(line, {
            yPercent: 0,
            duration: 0.9,
            ease: "power4.out",
            scrollTrigger: { trigger: row, start: "top 74%" },
          });
        }
        gsap.fromTo(
          row.querySelectorAll(".work-meta"),
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: { trigger: row, start: "top 72%" },
          }
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="work" className="relative overflow-hidden py-24 sm:py-32">
      {useShader ? (
        <ShaderBackground className="absolute inset-0 -z-20" />
      ) : (
        <RadialGlowBackground className="-z-20" />
      )}
      {/* Fondus haut/bas : dissolution continue depuis/vers le fond obsidienne
          du site (transition Hero → Selected work → Services). */}
      <div className="section-fade-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 sm:h-48" />
      <div className="section-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 sm:h-96" />
      <div className="relative mx-auto max-w-7xl px-8 sm:px-6">
        <div className="mb-16 max-w-2xl sm:mb-24">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.32em] text-muted">
            Projets sélectionnés
          </p>
          <h2 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Trois produits, rendus comme des{" "}
            <span className="font-serif italic font-normal text-gradient">objets</span>.
          </h2>
        </div>

        <div className="flex flex-col gap-24 sm:gap-36">
          {WORK.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                data-cursor="view"
                className="work-row group grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14"
              >
                <div className={`relative lg:col-span-7 ${flip ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="work-img h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40" />
                    <div className="work-mask absolute inset-0 z-10 bg-[#08090d]" />
                  </div>
                </div>

                <div className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}>
                  <p className="work-meta mb-4 font-mono text-xs uppercase tracking-[0.22em] text-muted">
                    {p.n} / 03 &nbsp;·&nbsp; {p.category}
                  </p>
                  <div className="overflow-hidden pb-1">
                    <h3 className="work-line text-3xl font-medium tracking-tight transition-colors group-hover:text-accent sm:text-4xl">
                      {p.title}
                    </h3>
                  </div>
                  <dl className="work-meta mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Rôle</dt>
                    <dd className="text-foreground/80">{p.role}</dd>
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Logiciels</dt>
                    <dd className="text-foreground/80">{p.software}</dd>
                  </dl>
                  <p className="work-meta mt-5 max-w-sm text-muted">{p.blurb}</p>
                  <span className="work-meta mt-6 inline-flex items-center gap-2 text-sm text-foreground/85 transition-colors group-hover:text-accent">
                    Voir le projet
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-20 flex justify-center sm:mt-28">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-base text-foreground/90 transition-colors hover:border-accent hover:text-accent"
          >
            Tous les projets
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
