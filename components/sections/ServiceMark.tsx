import type { ReactNode } from "react";

/**
 * Marques abstraites (ligne, monochrome, `currentColor`) — une par service
 * de HOME_SERVICES (lib/content.ts). Pas d'icônes en grille : un seul trait,
 * grand, éditorial, posé dans le panneau verre de son chapitre. Aucune
 * photo/mockup inventée.
 *
 * `fill`/`stroke` passent par les classes .mark-stroke/.mark-fill (globals.css)
 * plutôt que par les attributs SVG fill=/stroke= : une extension navigateur
 * (Dark Reader) réécrit ces attributs avant l'hydratation React, ce qui
 * déclenche un faux positif d'hydratation à chaque chargement.
 */
const STROKE = { strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", className: "mark-stroke" } as const;

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

// 01 — Modélisation 3D : cube isométrique en fil de fer.
function ModelingMark() {
  return (
    <Mark>
      <path d="M100 38 L162 74 L100 110 L38 74 Z" {...STROKE} />
      <path d="M38 74 L100 110 L100 168 L38 132 Z" {...STROKE} opacity={0.55} />
      <path d="M162 74 L100 110 L100 168 L162 132 Z" {...STROKE} opacity={0.85} />
      <path d="M100 110 L100 38 M100 110 L38 74 M100 110 L162 74" {...STROKE} opacity={0.3} />
    </Mark>
  );
}

// 02 — Character design : buste contour, minimal.
function CharacterMark() {
  return (
    <Mark>
      <circle cx="100" cy="70" r="36" {...STROKE} />
      <path d="M42 176 C42 128 158 128 158 176" {...STROKE} />
      <path d="M76 66 C80 62 120 62 124 66" {...STROKE} opacity={0.5} />
    </Mark>
  );
}

// 03 — Visualisation produit : objet sur socle, lumière studio.
function ProductMark() {
  return (
    <Mark>
      <circle cx="100" cy="88" r="32" {...STROKE} />
      <path d="M62 162 L138 162 L124 186 L76 186 Z" {...STROKE} />
      <path d="M100 12 L100 50 M60 30 L82 60 M140 30 L118 60" {...STROKE} opacity={0.5} />
    </Mark>
  );
}

// 04 — Sites web & expériences 3D : fenêtre navigateur + étincelle.
function WebMark() {
  return (
    <Mark>
      <rect x="32" y="52" width="136" height="100" rx="8" {...STROKE} />
      <path d="M32 78 L168 78" {...STROKE} opacity={0.6} />
      <circle cx="48" cy="65" r="3" className="mark-fill" opacity={0.6} />
      <circle cx="60" cy="65" r="3" className="mark-fill" opacity={0.6} />
      <path d="M100 96 L84 122 L98 122 L92 146 L118 114 L102 114 Z" {...STROKE} opacity={0.85} />
    </Mark>
  );
}

const MARKS = [ModelingMark, CharacterMark, ProductMark, WebMark];

export default function ServiceMark({ index }: { index: number }) {
  const C = MARKS[index] ?? ModelingMark;
  return <C />;
}
