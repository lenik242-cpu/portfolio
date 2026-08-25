"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Intro courte : obsidienne → une trace bleue se dessine → le nom apparaît →
 * dissolution vers le hero. Jouée une fois par session, ignorée en
 * reduced-motion. GSAP uniquement. Aucune vidéo, aucun shader lourd.
 */
export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tl = useRef<any>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const played = sessionStorage.getItem("nr-intro-v4");
    if (reduced || played) {
      setDone(true);
      return;
    }
    sessionStorage.setItem("nr-intro-v4", "1");

    const ctx = gsap.context(() => {
      const t = gsap.timeline({ onComplete: () => setDone(true) });
      t.set(".intro-trace", { scaleX: 0, opacity: 1 });
      t.set(".intro-name", { opacity: 0, y: 8 });
      t.to(".intro-trace", { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.2);
      t.to(".intro-name", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.7);
      t.to(".intro-trace", { opacity: 0, duration: 0.6, ease: "power2.in" }, 1.4);
      t.to(".intro-name", { opacity: 0, duration: 0.6, ease: "power2.in" }, 1.7);
      t.to(root.current, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 1.9);
      tl.current = t;
    }, root);
    return () => ctx.revert();
  }, []);

  const skip = () => {
    tl.current?.progress(1);
    setDone(true);
  };

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-[#08090d]"
    >
      <div className="intro-trace h-px w-[38vw] max-w-md origin-center" />
      <span className="intro-name font-mono text-[0.7rem] uppercase tracking-[0.5em] text-foreground">
        Nikita&nbsp;Resta
      </span>
      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 right-8 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted transition-colors hover:text-foreground"
      >
        Passer
      </button>
    </div>
  );
}
