# NIKITA RESTA — SITE V3 · PRODUCTION PLAN

> DA verrouillée : **SIGNAL** — une impulsion qui transforme le vide en image,
> matière et mouvement. Cinématique, éditorial, premium, maîtrisé, mystérieux.
> Priorité absolue : **court, fini, beau, lisible, stable** > ambitieux mais incomplet.

## 1. Architecture

One-page (`app/page.tsx`) :

```
Intro (skippable)  →  Hero (Core SIGNAL)  →  Capabilities (FORM/LIGHT/MOTION/WORLDS)
   →  Selected work (3 projets, éditorial)  →  About (court)  →  Contact  →  Footer (dissolution)
```

- **WebGL (R3F) uniquement** dans le Hero et sa transition vers Capabilities.
  Le reste = HTML/CSS accessible + GSAP reveals. Le canvas se démonte quand le
  Hero sort du viewport (perf).
- **GSAP + ScrollTrigger** : timelines, scroll, narrative du Core, reveals.
- **Framer Motion** : micro-interactions d'interface uniquement (menu). Jamais le
  même élément piloté par GSAP *et* Framer Motion.
- **Liquid Glass** : header + CTA principal seulement.
- **Curseur** : deux états seulement — `VIEW` (projets) et `OPEN` (images).

## 2. Narrative du Core (règle)

`SILENCE → PERCEPTION → RÉSONANCE → TRACE`, piloté par le scroll du Hero :

- **SILENCE** : arrivée presque noire, une impulsion de lumière.
- **PERCEPTION** : le Core se résout — matière minérale, veines lumineuses.
  (Le Core est **présent et lisible**, jamais « cristal sombre invisible ».)
- **RÉSONANCE** : au seuil de sortie du Hero, l'**onde de choc** part du Core et
  amorce la révélation de Capabilities. Onde rare (idle ~20s) + onde de transition.
- **TRACE** : le Core reflue, le canvas se dissout ; Capabilities prend le relais.

## 3. Fichiers

### Nouveaux
- `components/three/SignalHero.tsx` — Core hero-scoped (dérivé du lab v2,
  productionisé : scroll narrative, present-not-invisible, reduced-motion, mobile).
- `components/sections/Capabilities.tsx` — FORM / LIGHT / MOTION / WORLDS (éditorial).
- `components/sections/SelectedWork.tsx` — 3 projets réels, présentation éditoriale.
- `docs/V3_PRODUCTION_PLAN.md` — ce fichier.

### Réécrits
- `components/sections/Hero.tsx` — Core à droite, texte à gauche, CTA Liquid Glass,
  intro skippable, narrative.
- `components/sections/About.tsx` — section « À propos » courte pour l'accueil.
- `components/sections/Contact.tsx` — conservé (retouché).
- `components/layout/Background.tsx` — simplifié : obsidienne + grain + vignette
  (auroras/pool décoratifs retirés).
- `components/common/CustomCursor.tsx` — limité à VIEW + OPEN.
- `app/page.tsx` — assemblage V3.
- `app/layout.tsx` — retrait de `ChromeStage` global (WebGL hero-scoped désormais).
- `lib/sections.ts` — sections : hero / capabilities / work / about / contact.

### Conservés tels quels
- `components/lab/*` (source des systèmes SIGNAL, réutilisée), `rig.tsx`.
- `SmoothScrollProvider`, `FloatingNav` (labels mis à jour), `Footer`,
  `LiquidGlassFilter`, `LiquidGlassController`, `ScrollProgress`, `Reveal`, `KineticText`.
- `lib/projects.ts`, `lib/site.ts`. Routes `/portfolio`, `/portfolio/[slug]`, `/about`, `/services`.

### Dépréciés (non importés, à nettoyer plus tard)
- `three/ChromeStage`, `three/SignatureForm`, `three/HeroScene`, `three/HeroModel`,
  `three/PortfolioModel`, `three/PortfolioScene`, `sections/Manifesto`, `sections/FeaturedShowcase`,
  `sections/Services`.

## 4. Selected work — 3 projets

Xbox Elite & Series X · Dior Sauvage (Eau de Parfum) · La guitare d'Ellie (TLOU II).
(Le 4ᵉ, MacBook Pro 14, reste sur `/portfolio`.)

## 5. Risques techniques
- **WebGL non vérifiable dans la pane** (pas de compositing) → réglages matière
  conservateurs, validation visuelle par l'utilisateur.
- **Deux moteurs de motion** → séparation stricte GSAP (scroll/hero) / Framer (menu).
- **Perf mobile** → pas de post-processing, particules réduites, pas de bloom mobile.
- **Démontage du canvas** hors Hero → via état togglé par ScrollTrigger.
- **reduced-motion** → Core statique, pas d'onde auto, reveals instantanés.

## 6. Ordre de réalisation
1. Plan + CLAUDE.md (décisions verrouillées).
2. Vertical slice : intro → hero(Core) → transition → capabilities → 1 projet → contact.
3. Propagation : 2 autres projets, about, footer (dissolution).
4. Simplifs transverses : Background, curseur, nav, sections.
5. Build + TS + console + responsive.
