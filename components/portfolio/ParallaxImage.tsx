"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/**
 * Image de galerie animée : révélation (wipe vertical + léger zoom) à l'entrée
 * dans le viewport, puis parallax doux au scroll. Pensé pour rester élégant et
 * discret (pas de crop : l'image garde son ratio naturel).
 *
 * `width`/`height` réservent l'espace réel AVANT le chargement (l'image est
 * `loading="lazy"` sauf la première) : sans ça, la hauteur du document grandit
 * pendant que l'utilisateur scrolle et déphase Lenis/ScrollTrigger — la page
 * peut sembler bloquée avant sa vraie fin (plus visible sur les galeries à
 * images hautes). `onLoad` déclenche un second filet de sécurité.
 */
export default function ParallaxImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const { lenis } = useLenis();

  useEffect(() => {
    const o = outer.current;
    const f = frame.current;
    const im = img.current;
    if (!o || !f || !im) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(f, { opacity: 1, clipPath: "inset(0% 0 0% 0 round 24px)" });
      gsap.set(im, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Révélation : wipe du bas vers le haut + zoom léger.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: o,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
      tl.fromTo(
        f,
        { opacity: 0, clipPath: "inset(0 0 100% 0 round 24px)" },
        {
          opacity: 1,
          clipPath: "inset(0% 0 0% 0 round 24px)",
          duration: 1,
          ease: "power3.out",
        }
      ).fromTo(
        im,
        { scale: 1.08 },
        { scale: 1, duration: 1.15, ease: "power3.out" },
        0
      );

      // Parallax doux du bloc entier.
      gsap.fromTo(
        o,
        { yPercent: 5 },
        {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: o,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, o);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={outer} className="will-change-transform">
      <div
        ref={frame}
        className="glass-panel overflow-hidden rounded-3xl"
        style={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 24px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={img}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => {
            // Filet de sécurité : même avec l'espace réservé, on recale
            // Lenis/ScrollTrigger si jamais une image finit de charger après
            // leur dernière mesure (connexion lente, cache froid, etc.).
            lenis?.resize();
            ScrollTrigger.refresh();
          }}
          className="mx-auto block h-auto w-full"
        />
      </div>
    </div>
  );
}
