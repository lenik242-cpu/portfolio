"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { SITE } from "@/lib/site";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/**
 * Navigation éditoriale minimale (wordmark / Menu) + menu plein écran en
 * matière LIQUID GLASS qui se matérialise dans l'espace (surface translucide,
 * réfraction, profondeur). Plus de pilule flottante.
 */
export default function FloatingNav() {
  const { scrollTo, lenis } = useLenis();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  // Verrouille le scroll quand le menu est ouvert.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  // Fermeture au clavier (Échap).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: SectionId) => {
    setOpen(false);
    // Le menu vient de stopper Lenis (voir effet ci-dessus) ; le relancer
    // n'arrivera qu'au prochain effet, après ce clic. Sans ce start()
    // explicite ici, le scrollTo ci-dessous serait ignoré (Lenis stoppé).
    lenis?.start();
    if (isHome) {
      scrollTo(id === "hero" ? "#hero" : `#${id}`);
    } else {
      window.location.href = id === "hero" ? "/" : `/#${id}`;
    }
  };

  return (
    <>
      {/* Barre éditoriale minimale */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#08090d]/85 px-8 py-6 backdrop-blur-md sm:border-none sm:bg-transparent sm:px-10 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={() => go("hero")}
          className="pointer-events-auto inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-foreground/90 transition-colors hover:text-foreground"
          data-cursor="link"
        >
          <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          {SITE.brand}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="pointer-events-auto text-xs font-medium uppercase tracking-[0.24em] text-foreground/70 transition-colors hover:text-foreground"
          data-cursor="link"
        >
          {open ? "Fermer" : "Menu"}
        </button>
      </header>

      {/* Menu plein écran — matière Liquid Glass */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        data-open={open}
        className="menu-overlay fixed inset-0 z-40 flex flex-col justify-center px-8 sm:px-10"
      >
        <nav
          aria-label="Menu principal"
          className="mx-auto flex w-full max-w-7xl flex-col gap-1"
        >
          {SECTIONS.map(({ id, label }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              className="menu-link group flex w-fit items-baseline gap-4 py-2 text-left"
              data-cursor="link"
            >
              <span className="font-mono text-xs text-foreground/35 transition-colors group-hover:text-accent">
                0{i + 1}
              </span>
              <span className="text-4xl font-medium tracking-tight text-foreground/70 transition-all duration-300 group-hover:translate-x-2 group-hover:text-foreground sm:text-6xl">
                {label}
              </span>
            </button>
          ))}
        </nav>

        {/* Pied du menu : identité + contact */}
        <div
          className="menu-foot mx-auto mt-14 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-foreground/45 sm:flex-row sm:items-center sm:justify-between"
          style={{ transitionDelay: open ? "440ms" : "0ms" }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.24em]">
            3D&nbsp;·&nbsp;Web&nbsp;·&nbsp;IA&nbsp;·&nbsp;Temps réel
          </span>
          <a
            href={`mailto:${SITE.email}`}
            className="transition-colors hover:text-accent"
            data-cursor="link"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </>
  );
}
