# V4 — MATERIAL IN MOTION (direction verrouillée)

Portfolio 3D éditorial premium. Les **renders réels** sont le sujet ; shaders,
lignes et transitions créent l'atmosphère mais ne deviennent jamais le sujet.

## Abandonné (V3 → V4)
- Core SIGNAL comme personnage permanent (`SignalHero`), lore spatial, champs de
  particules omniprésents, longues intros, Kairon, accumulation de Liquid Glass.
- Section Capabilities (FORM/LIGHT/MOTION/WORLDS) → remplacée par Services.
- Interludes vidéo Flow **retirés de la page** (posters/fallbacks conservés sur
  disque ; réactivables via `lib/flow.ts`). Aucune vidéo Flow dans le hero.

## Trois systèmes visuels — les seuls autorisés
1. **Liquid Shader** — `components/three/HeroLiquidShader.tsx`. Uniquement dans le
   hero, DERRIÈRE le render du parfum. WebGL1 natif, 1 seul canvas du site, très
   faible opacité, très lent, sans curseur. Palette obsidienne / bleu froid /
   platine. DPR ≤ 1.5. Désactivé mobile + reduced-motion (fallback CSS statique),
   pause onglet caché.
2. **Background Paths** — `components/media/SignalPaths.tsx` (SVG/CSS, pas de
   WebGL). Uniquement à 2 endroits : sortie Hero → Selected work, et Services →
   About. Fines, lentes, quasi monochromes (platine + pointe `#5274FF`). Mobile :
   ligne statique.
3. **Liquid Metal Button** — `components/ui/LiquidMetalButton.tsx`. Uniquement les
   2 CTA principaux « View selected work » et « Contact ». Métal froid / verre
   fumé, calme au repos, réaction légère au hover/focus. Mobile : bouton CSS simple.

## Palette (globals.css @theme)
`--color-background #08090D` · `--color-background-2 #10131A` ·
`--color-foreground #F1F2F4` · `--color-muted #8A909A` ·
`--color-accent #4C7DFF` (bleu froid) · `--color-accent-blue #8F7CFF` (lavande rare).
Verre fumé / chrome froid / grain léger. Pas d'or, pas de violet néon, pas de cyan
saturé, pas d'aurora permanente.

## Typographie
Grotesk : Geist (texte) + Space Grotesk (display). Instrument Serif italique →
accents éditoriaux rares seulement. Hiérarchie : nom > métier > titres > méta >
descriptions > CTA.

## Architecture (app/page.tsx)
Intro (courte) → Hero (parfum + shader) → Selected work (3 projets) → Services (4)
→ About → Contact → Footer. Paths aux 2 transitions définies.

## Projets (exactement 3, honnêtes)
1. **Parfum** — étude produit personnelle (« Personal product visualization »),
   jamais présentée comme commande officielle.
2. **MacBook Pro** — visualisation produit.
3. **Xbox / manette** — visualisation produit.
Champs affichés : numéro, titre, catégorie, rôle, logiciels, description courte, lien.

## Fichiers
### Créés
- `docs/V4_DIRECTION.md`, `components/three/HeroLiquidShader.tsx`,
  `components/media/SignalPaths.tsx`, `components/ui/LiquidMetalButton.tsx`,
  `components/sections/Services.tsx` (V4).
### Réécrits
- `app/globals.css` (@theme V4), `components/sections/{Hero,Intro,SelectedWork,About,Contact}.tsx`,
  `app/page.tsx`, `lib/{projects,site,sections}.ts`.
### Conservés
- Stack (Next/React/TS/Tailwind/GSAP/Framer/R3F non utilisé en V4), `SmoothScrollProvider`,
  `FloatingNav`, `Footer`, `CustomCursor`, `Reveal`, `lib/flow.ts` + posters,
  `CinematicInterlude` (non monté). Routes `/portfolio`, `/portfolio/[slug]`, `/about`.
### Dépréciés (non montés)
- `three/SignalHero`, `sections/Capabilities`, `three/ChromeStage`, `three/Signature*`,
  `sections/Manifesto`, `sections/FeaturedShowcase`, `kairon/*`, `lab/*` (le /lab reste
  accessible mais hors site public).

## Désactiver un système depuis un seul endroit
- Liquid Shader : ne pas monter `<HeroLiquidShader/>` dans `Hero.tsx` (ou retourner
  `null` au début du composant).
- Background Paths : retirer les `<SignalPaths/>` de `app/page.tsx`.
- Liquid Metal Button : remplacer `<LiquidMetalButton/>` par un lien simple, ou
  basculer sa prop `plain`.

## Perf / responsive
1 canvas max, DPR ≤ 1.5, pause onglet caché, reduced-motion → statique, fallback CSS,
pas de vidéo Flow, pas de dépendance ajoutée. Mobile : pas de shader, paths statiques,
bouton CSS, renders prioritaires et non recadrés destructivement.
