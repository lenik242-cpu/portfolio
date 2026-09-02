"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import Reveal from "@/components/anim/Reveal";
import { WEBSITES } from "@/lib/websites";
import { RadialGlowBackground } from "@/components/ui/tailwind-css-background-snippet";
import { ShaderBackground } from "@/components/ui/valley-of-the-mind";

/**
 * WEB EXPERIENCES — entre Selected Work et Services. Moment signature : la
 * section démarre comme un espace vide (deux panneaux obsidienne pleine
 * hauteur, indiscernables du fond) qui s'ouvrent comme des portes au scroll,
 * révélant le titre et un carousel qui défile seul en continu. Fond : même
 * shader WebGL que Selected Work (continuité visuelle), fondu haut/bas
 * identique — réutilisé tel quel, aucun nouveau système. Mobile/reduced-
 * motion : fond radial statique, pas de canvas WebGL monté.
 */
const LOOP_DURATION = 32; // s, une boucle complète du train de cartes

export default function WebExperiences() {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);
  const [reduced, setReduced] = useState(true);
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setReduced(r);
    setUseShader(!r && !mobile);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([leftDoorRef.current, rightDoorRef.current], { xPercent: (i) => (i === 0 ? -100 : 100) });
        return;
      }

      gsap.set(leftDoorRef.current, { xPercent: 0 });
      gsap.set(rightDoorRef.current, { xPercent: 0 });

      const startMarquee = () => {
        if (!trackRef.current || marqueeTween.current) return;
        marqueeTween.current = gsap.to(trackRef.current, {
          xPercent: -50,
          duration: LOOP_DURATION,
          ease: "none",
          repeat: -1,
        });
      };

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        .to(leftDoorRef.current, { xPercent: -100, duration: 1.2, ease: "power4.inOut" }, 0)
        .to(rightDoorRef.current, { xPercent: 100, duration: 1.2, ease: "power4.inOut" }, 0)
        .call(startMarquee, [], "-=0.3");
    }, el);

    return () => {
      marqueeTween.current = null;
      ctx.revert();
    };
  }, [reduced]);

  const pause = () => marqueeTween.current?.pause();
  const resume = () => marqueeTween.current?.play();

  const cards = [...WEBSITES, ...WEBSITES];

  return (
    <section id="web-experiences" ref={root} className="relative overflow-hidden py-24 sm:py-32">
      {useShader ? (
        <ShaderBackground className="absolute inset-0 -z-20" />
      ) : (
        <RadialGlowBackground className="-z-20" />
      )}
      <div className="section-fade-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 sm:h-48" />
      <div className="section-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 sm:h-96" />

      <div ref={stageRef} className="relative">
        <div className="mx-auto max-w-7xl px-8 sm:px-6">
          <div className="mb-14 max-w-2xl sm:mb-20">
            <Reveal as="p" className="mb-5 font-mono text-xs uppercase tracking-[0.32em] text-muted">
              Expériences web
            </Reveal>
            <Reveal
              as="h2"
              delay={0.08}
              className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-6xl"
            >
              Des marques, pensées comme des{" "}
              <span className="font-serif italic font-normal text-gradient">expériences</span>.
            </Reveal>
          </div>
        </div>

        <div
          ref={trackWrapRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          className={reduced ? "overflow-x-auto py-8" : "overflow-hidden py-8"}
        >
          <div ref={trackRef} className="flex w-max gap-6 px-8 sm:gap-8 sm:px-6">
            {cards.map((site, i) => (
              <Link
                key={`${site.slug}-${i}`}
                href={`/web/${site.slug}`}
                data-cursor="view"
                aria-hidden={i >= WEBSITES.length}
                tabIndex={i >= WEBSITES.length ? -1 : 0}
                className="group relative block w-[280px] shrink-0 origin-center transition-transform duration-500 ease-out hover:z-10 hover:scale-[1.3] sm:w-[380px]"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] transition-shadow duration-500 group-hover:ring-accent/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={site.image}
                    alt={site.name}
                    width={site.width}
                    height={site.height}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <div>
                      <p className="text-base font-medium tracking-tight text-foreground">{site.name}</p>
                      <p className="mt-0.5 text-xs text-foreground/60">{site.tag}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Portes obsidienne : espace fermé au repos, s'ouvrent une fois au scroll */}
      <div
        ref={leftDoorRef}
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-20 w-1/2 bg-[#05070e]"
      />
      <div
        ref={rightDoorRef}
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-20 w-1/2 bg-[#05070e]"
      />
    </section>
  );
}
