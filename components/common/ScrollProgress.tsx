"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/** Fine barre teal en haut de page, remplie selon la progression du scroll. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const { lenis } = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const onScroll = (e: { progress: number }) => {
      if (bar.current) bar.current.style.transform = `scaleX(${e.progress})`;
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  return <div ref={bar} className="scroll-progress" aria-hidden />;
}
