"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HOME_SERVICES, type HomeService } from "@/lib/content";
import { RadialGlowBackground } from "@/components/ui/tailwind-css-background-snippet";
import { ShaderBackground } from "@/components/ui/valley-of-the-mind";
import ServiceMark from "@/components/sections/ServiceMark";
import ProcessOverlay from "@/components/sections/ProcessOverlay";
import Reveal from "@/components/anim/Reveal";

/**
 * SERVICES = ce que j'offre (jamais confondu avec PROCESS = comment je
 * travaille, qui vit dans ProcessOverlay). Chapitres pin-scrubbés d'un même
 * monde (nombre défini par HOME_SERVICES, voir lib/content.ts) : un fond
 * shader continu, une seule vision qui progresse plutôt que des cartes
 * indépendantes. Reduced-motion : pile lisible, sans pin.
 */
const N = HOME_SERVICES.length;

// Couleur dynamique par service via variable CSS (.service-accent dans
// globals.css) plutôt que style={{color}} direct — voir la note dans
// globals.css sur Dark Reader et les attributs de couleur inline.
const accentStyle = (accent: string): CSSProperties =>
  ({ "--service-accent": accent }) as CSSProperties;

function chapterState(i: number, progress: number) {
  const slice = 1 / N;
  const local = (progress - i * slice) / slice;
  if (local <= 0) return { opacity: 0, y: 22 };
  if (local >= 1) return { opacity: 0, y: -22 };
  if (local < 0.18) {
    const t = local / 0.18;
    return { opacity: t, y: 22 * (1 - t) };
  }
  if (local > 0.82) {
    const t = (1 - local) / 0.18;
    return { opacity: t, y: -22 * (1 - t) };
  }
  return { opacity: 1, y: 0 };
}

export default function Services() {
  const pinRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const railRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [useShader, setUseShader] = useState(false);
  // Sur mobile, la pile de chapitres pin-scrubbés dépasserait la hauteur de
  // l'écran (contenu + visuel empilés) : on garde le pin pour desktop
  // uniquement et on traite mobile comme reduced-motion (liste lisible).
  // Défaut = liste accessible (SSR-safe), upgrade vers le pin une fois le
  // viewport/la préférence connus (même logique que HeroFrameSequence).
  const [stacked, setStacked] = useState(true);
  const [processOpen, setProcessOpen] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setStacked(reduced || mobile);
    setUseShader(!reduced && !mobile);
  }, []);

  useEffect(() => {
    if (stacked) return;
    const el = pinRef.current;
    if (!el) return;
    const panels = panelRefs.current.filter((p): p is HTMLDivElement => !!p);
    const rail = railRefs.current.filter((r): r is HTMLSpanElement => !!r);
    if (panels.length !== N) return;

    const ctx = gsap.context(() => {
      gsap.set(panels, { opacity: 0, y: 22 });
      gsap.set(panels[0], { opacity: 1, y: 0 });
      gsap.set(rail, { opacity: 0.4, scale: 1 });
      if (rail[0]) gsap.set(rail[0], { opacity: 1, scale: 1.2 });

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${N * 85}%`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(N - 1, Math.floor(self.progress * N));
          panels.forEach((p, i) => {
            const { opacity, y } = chapterState(i, self.progress);
            gsap.set(p, { opacity, y });
          });
          rail.forEach((r, i) => {
            gsap.set(r, { opacity: i === idx ? 1 : 0.4, scale: i === idx ? 1.2 : 1 });
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [stacked]);

  return (
    <section id="services" className="relative">
      <div className="mx-auto max-w-7xl px-8 pt-24 sm:px-6 sm:pt-32">
        <div className="mb-16 max-w-2xl sm:mb-20">
          <Reveal as="p" className="mb-5 font-mono text-xs uppercase tracking-[0.32em] text-muted">
            Services
          </Reveal>
          <Reveal as="h2" delay={0.08} className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Quatre disciplines, une seule{" "}
            <span className="font-serif italic font-normal text-gradient">vision</span>.
          </Reveal>
        </div>
      </div>

      {stacked ? (
        <div className="mx-auto flex max-w-7xl flex-col gap-20 px-8 pb-24 sm:px-6 sm:pb-32">
          {HOME_SERVICES.map((s, i) => (
            <Reveal key={s.n} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <ServiceChapterContent s={s} i={i} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div ref={pinRef} className="relative flex min-h-[100vh] items-center overflow-hidden py-16">
          <div className="absolute inset-0 -z-20 bg-[#08090d]">
            {useShader ? <ShaderBackground className="absolute inset-0" /> : <RadialGlowBackground />}
          </div>
          <div className="section-fade-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 sm:h-48" />
          <div className="section-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 sm:h-56" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-8 sm:px-6 lg:grid-cols-[3rem_1fr] lg:gap-12">
            <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-6 lg:pt-3">
              {HOME_SERVICES.map((s, i) => (
                <span
                  key={s.n}
                  ref={(node) => {
                    railRefs.current[i] = node;
                  }}
                  className="service-accent font-mono text-[0.68rem] tracking-[0.16em]"
                  style={accentStyle(s.accent)}
                >
                  {s.n}
                </span>
              ))}
            </div>

            <div className="relative min-h-[720px] sm:min-h-[640px] lg:min-h-[460px]">
              {HOME_SERVICES.map((s, i) => (
                <div
                  key={s.n}
                  ref={(node) => {
                    panelRefs.current[i] = node;
                  }}
                  style={i === 0 ? undefined : { opacity: 0 }}
                  className="absolute inset-0 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14"
                >
                  <ServiceChapterContent s={s} i={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl justify-center px-8 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-20">
        <button
          type="button"
          onClick={() => setProcessOpen(true)}
          data-cursor="link"
          className="group inline-flex items-center gap-2 border-b border-white/25 pb-1 text-base text-foreground/90 transition-colors hover:border-accent hover:text-accent"
        >
          Voir comment je travaille
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </button>
      </div>

      <ProcessOverlay open={processOpen} onClose={() => setProcessOpen(false)} />
    </section>
  );
}

function ServiceChapterContent({ s, i }: { s: HomeService; i: number }) {
  return (
    <>
      <div className="lg:col-span-7">
        <span className="service-accent mb-4 block font-mono text-sm tracking-[0.2em]" style={accentStyle(s.accent)}>
          {s.n}
        </span>
        <h3 className="text-3xl font-medium leading-[1.05] tracking-tight sm:text-5xl">{s.name}</h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{s.desc}</p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted/70">
          Inclus <span className="normal-case tracking-normal text-foreground/70">— {s.includes}</span>
        </p>
      </div>
      <div className="lg:col-span-5">
        <div
          className="service-accent glass-panel glass-liquid relative mx-auto aspect-square w-full max-w-[280px] rounded-2xl p-10"
          style={accentStyle(s.accent)}
        >
          <ServiceMark index={i} />
        </div>
      </div>
    </>
  );
}
