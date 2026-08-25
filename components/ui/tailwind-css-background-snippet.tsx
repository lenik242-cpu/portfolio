import { cn } from "@/lib/utils";

/**
 * Fond radial statique obsidienne → violet spectral. Fallback léger de
 * ShaderBackground (valley-of-the-mind.tsx) pour mobile / reduced-motion,
 * où le canvas WebGL animé n'est jamais monté (voir SelectedWork.tsx).
 */
export const RadialGlowBackground = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn("radial-glow-bg pointer-events-none absolute inset-0 -z-10", className)}
    />
  );
};
