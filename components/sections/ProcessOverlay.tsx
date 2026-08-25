"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROCESS } from "@/lib/services";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/**
 * PROCESS = comment je travaille (distinct de Services = ce que j'offre).
 * Panneau plein écran en matière Liquid Glass, ouvert depuis le CTA de
 * Services. Jamais affiché par défaut — on choisit d'aller le voir.
 */
export default function ProcessOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lenis } = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Comment je travaille"
          className="menu-overlay fixed inset-0 overflow-y-auto px-8 py-24 sm:px-10"
          data-open="true"
          style={{ zIndex: 70 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-14">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.32em] text-muted">
                  Process
                </p>
                <h2 className="max-w-xl text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
                  Comment je{" "}
                  <span className="font-serif italic font-normal text-gradient">travaille</span>.
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 font-mono text-xs uppercase tracking-[0.24em] text-muted transition-colors hover:text-foreground"
                data-cursor="link"
              >
                Fermer
              </button>
            </div>

            <ol className="flex flex-col">
              {PROCESS.map((p, i) => (
                <motion.li
                  key={p.step}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: reduced ? 0 : 0.08 + i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
                  className="grid grid-cols-[3.5rem_1fr] gap-x-6 gap-y-2 border-t border-white/10 py-7 last:border-b sm:grid-cols-[5rem_auto_1fr] sm:items-baseline sm:gap-x-10"
                >
                  <span className="font-mono text-sm text-accent">{p.step}</span>
                  <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{p.title}</h3>
                  <p className="col-span-2 mt-1 max-w-md text-muted sm:col-auto sm:mt-0 sm:justify-self-end sm:text-right">
                    {p.desc}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
