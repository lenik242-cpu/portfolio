# V4 — Audit des trois effets (état AVANT correction)

Constat factuel (code + DOM vérifié : 1 seul canvas WebGL, 3 boutons métal, 48
paths SVG, aucune erreur console sur onglet neuf).

## 1. Liquid Shader — status : **PARTIAL** (actif mais hors cible)
- **Fichier de rendu** : `components/ui/liquid-shader.tsx` (Three.js `WebGLRenderer`, fullscreen plane, fragment ray-marché recoloré).
- **Emplacement** : `components/sections/Hero.tsx`, dans le wrapper de fond du hero (`absolute inset-0 z-0`), DERRIÈRE le render du parfum, au-dessus d'un dégradé CSS statique.
- **Condition de visibilité** : desktop + `!prefers-reduced-motion` ; sinon `return null` → dégradé CSS.
- **Dépendances** : `three` (déjà installée). Aucun 2ᵉ canvas.
- **Problème** : `opacity` conteneur = **0.6** (hors cible 0.18–0.30) ; base un peu plus sombre que `#08090D` ; **pas de pause quand le hero est hors viewport** (le loop tourne même en bas de page).

## 2. Background Paths — status : **PARTIAL** (actif mais trop faible + mauvais modèle d'anim)
- **Fichier de rendu** : `components/ui/background-paths.tsx` (SVG + Framer Motion).
- **Emplacement** : `app/page.tsx`, exactement 2 bandes — Hero → Selected work, et Services → About.
- **Condition de visibilité** : desktop + `!reduced` ; sinon ligne statique. Bandes en flux normal, fond transparent, non masquées (pas de z-index négatif, pas d'élément opaque au-dessus).
- **Dépendances** : `framer-motion` (déjà installée). Pas de WebGL.
- **Problème** : `strokeOpacity` ≈ **0.08–0.30** (sous la cible 0.25–0.45 → trop faible) ; **boucle infinie** (`repeat: Infinity` + `pathOffset`) au lieu d'un **dessin lent une seule fois** à l'apparition.

## 3. Liquid Metal Button — status : **ACTIVE** (conforme)
- **Fichier de rendu** : `components/ui/LiquidMetalButton.tsx` + classe `.metal-btn` dans `app/globals.css`.
- **Emplacement** : Hero (« View selected work », « Contact ») + section Contact (email). 3 instances.
- **Condition** : toujours rendu (CSS, pas de WebGL). Texte = `var(--color-foreground)` = **#F1F2F4** (jamais #666666). Sheen au hover/focus, réaction au press via ombres.
- **Dépendances** : aucune. `@paper-design/shaders` **non installée** (volontaire : elle créerait un canvas WebGL par bouton → viole « un seul canvas »).
- **Point mineur** : ajouter un anneau de focus clavier explicite (a11y).

## Décision (contrôlée, sans changer la DA)
1. Liquid Shader → `opacity` 0.6 **→ 0.26**, palette calée sur `#08090D / #101A2B / #71859A / #4C7DFF`, **pause quand le hero sort du viewport**.
2. Background Paths → **dessin unique** (`whileInView`, `once`) + opacité relevée à ~0.3–0.4.
3. Liquid Metal Button → focus clavier explicite ; reste en CSS (pas de dépendance).
4. Nettoyage : suppression des composants morts (0 import) — voir liste finale.
