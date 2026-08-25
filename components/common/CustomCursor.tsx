"use client";

import { useEffect, useRef } from "react";

/**
 * Curseur contextuel — deux états seulement (DA V3) :
 *   [data-cursor="view"] → disque « VIEW » (projets)
 *   [data-cursor="open"] → disque « OPEN » (images)
 * Sinon : point discret + anneau qui suit avec un léger retard.
 * Désactivé sur pointeur grossier (tactile).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-custom-cursor");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let state = "default";
    let raf = 0;

    const resolveState = (el: Element | null): string => {
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      const v = tagged?.dataset.cursor;
      return v === "view" || v === "open" ? v : "default";
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      const next = resolveState(e.target as Element);
      if (next !== state) {
        state = next;
        ring.dataset.state = state;
        dot.dataset.state = state;
        label.textContent = state === "view" ? "VIEW" : state === "open" ? "OPEN" : "";
      }
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => ring.classList.add("is-hidden");
    const onEnter = () => ring.classList.remove("is-hidden");

    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
