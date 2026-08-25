"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Image de galerie animée : révélation (wipe vertical + léger zoom) à l'entrée
 * dans le viewport, puis parallax doux au scroll. Pensé pour rester élégant et
 * discret (pas de crop : l'image garde son ratio naturel).
 */
export default function ParallaxImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

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
          loading={priority ? "eager" : "lazy"}
          className="mx-auto block h-auto w-full"
        />
      </div>
    </div>
  );
}
