/**
 * Filtre SVG de réfraction pour le « vrai » verre liquide.
 * `backdrop-filter: url(#liquid-glass)` distord réellement l'arrière-plan
 * derrière l'élément (feTurbulence → feDisplacementMap), pour un effet de
 * réfraction proche des références Apple / Awwwards.
 * Rendu une seule fois (invisible) dans le layout.
 */
export default function LiquidGlassFilter() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute" }}
    >
      <filter
        id="liquid-glass"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.009"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="1.1" result="softNoise" />

        {/* Aberration chromatique : on déplace le canal rouge plus fort que
            le vert/bleu, puis on recombine → léger arc-en-ciel sur les bords
            réfractés (effet « verre » type Vision Pro). */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="20"
          xChannelSelector="R"
          yChannelSelector="G"
          result="dispR"
        />
        <feColorMatrix
          in="dispR"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="chanR"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="12"
          xChannelSelector="R"
          yChannelSelector="G"
          result="dispGB"
        />
        <feColorMatrix
          in="dispGB"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="chanGB"
        />
        <feBlend in="chanR" in2="chanGB" mode="screen" />
      </filter>
    </svg>
  );
}
