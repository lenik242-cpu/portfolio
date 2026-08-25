"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

type ScrollLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  href: `#${string}`;
  children: ReactNode;
};

/**
 * Bouton/lien qui défile en douceur (Lenis) vers une ancre de la page.
 * Sert aux CTA « Voir le portfolio », « Me contacter », etc.
 */
export default function ScrollLink({
  href,
  children,
  ...rest
}: ScrollLinkProps) {
  const { scrollTo } = useLenis();
  return (
    <button type="button" onClick={() => scrollTo(href)} {...rest}>
      {children}
    </button>
  );
}
