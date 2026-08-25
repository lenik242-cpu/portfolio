"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Typographie cinétique : chaque mot est masqué puis « monte » à la révélation
 * (au chargement pour le hero, au scroll pour les titres de section).
 * Split maison par mots (pas de plugin payant), accessible (aria-label).
 */
export default function KineticText({
  text,
  as: Component = "span",
  className,
  onScroll = false,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  onScroll?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inners = el.querySelectorAll<HTMLElement>("[data-word]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(inners, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(inners, {
        yPercent: 115,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.07,
        delay,
        scrollTrigger: onScroll
          ? {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          : undefined,
      });
    }, el);

    return () => ctx.revert();
  }, [onScroll, delay]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i}>
          <span
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <span data-word className="inline-block will-change-transform">
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
