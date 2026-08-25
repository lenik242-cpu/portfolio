"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE } from "@/lib/site";

/**
 * Footer-scène : dernière manifestation de la matière. Grande signature
 * typographique en dégradé chrome qui déborde du cadre, contact minimal,
 * fondu vers le noir. Le site termine son histoire plutôt que de s'arrêter.
 *
 * Signature : fondu discret à l'entrée dans le viewport (une fois, sur le
 * texte lui-même) + très légère parallaxe continue (sur le wrapper — jamais
 * la même propriété animée deux fois sur le même nœud).
 */
export default function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mark = markRef.current;
    if (!wrap || !mark) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(mark, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(mark, { y: 22 });
      gsap.to(mark, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: mark, start: "top 90%", once: true },
      });

      gsap.fromTo(
        wrap,
        { y: 8 },
        {
          y: -8,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="relative overflow-hidden">
      {/* Fondu vers le noir en bas de scène */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />

      <div className="relative mx-auto max-w-7xl px-8 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-10 border-t border-foreground/10 pt-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/40">
              Disponible en freelance
            </p>
            <a
              href={`mailto:${SITE.email}`}
              data-cursor="link"
              className="mt-3 inline-block text-xl text-foreground transition-colors hover:text-accent"
            >
              {SITE.email}
            </a>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/55">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="transition-colors hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Signature géante — dégradé chrome, débordement contrôlé */}
        <div ref={wrapRef} className="relative mt-12 sm:mt-14">
          <h2
            ref={markRef}
            style={{ opacity: 0 }}
            className="text-chrome select-none whitespace-nowrap text-center text-[clamp(3.5rem,15vw,13rem)] font-semibold leading-[0.85] tracking-tighter"
          >
            Nikita Resta
          </h2>
        </div>

        <div className="flex flex-col gap-2 py-10 text-xs text-foreground/35 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} · {SITE.role}
          </span>
          <span className="font-mono uppercase tracking-[0.2em]">
            Conçu &amp; développé par {SITE.brand}
          </span>
        </div>
      </div>
    </footer>
  );
}
