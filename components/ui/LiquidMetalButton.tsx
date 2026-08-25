"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/**
 * Liquid Metal Button — réservé aux 2 CTA principaux (« View selected work »,
 * « Contact »). Métal froid / verre fumé (styles `.metal-btn` dans globals.css),
 * calme au repos, réaction légère au hover/focus. Pas de WebGL, pas de blur.
 * Ne pas l'appliquer aux liens/badges/menus secondaires.
 *
 *  - href commençant par "#" → scroll fluide Lenis vers la section.
 *  - autre href (mailto, externe) → ancre.
 */
export default function LiquidMetalButton({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const { scrollTo } = useLenis();

  if (href.startsWith("#")) {
    return (
      <button type="button" className="metal-btn" onClick={() => scrollTo(href)}>
        {children}
      </button>
    );
  }
  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className="metal-btn"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="metal-btn">
      {children}
    </Link>
  );
}
