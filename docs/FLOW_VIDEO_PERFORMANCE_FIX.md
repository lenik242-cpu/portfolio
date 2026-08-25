# Flow videos — correctif de performance

## Cause la plus probable du freeze (certitude : moyenne-élevée)
Les MP4 Flow d'origine étaient en **H.264 High profile + piste audio AAC**, et
la lecture était **déclenchée pendant le scroll Lenis** (`preload="metadata"`,
play dès l'entrée dans le viewport). Le coût d'initialisation du décodeur
(High profile, pipeline audio) sur le **thread principal**, en concurrence avec
le rAF de Lenis et le repaint du scroll, provoque le gel observé sur Opera au
moment où la bande devient visible.

Facteurs aggravants écartés / secondaires :
- **WebGL/R3F** : le Canvas du Core est **hero-scoped** et **démonté** dès que le
  hero quitte le viewport (`Hero.tsx` → ScrollTrigger `onLeave`). Aux positions
  des interludes (bien plus bas), **aucun canvas ne tourne** → pas de contention
  WebGL. C'est la « réduction WebGL » la plus forte possible : il n'y a rien à
  réduire, le canvas est déjà libéré.
- **Postprocessing** : présent uniquement dans `/lab`, jamais sur le site public.
- **CSS filters/blur/blend sur la vidéo** : aucun (les fondus sont en opacity).

## Correctifs appliqués
1. **Médias ré-encodés** (web-optimisés, originaux conservés) :
   `public/media/optimized/*.web.mp4` — H.264 **Main**, **sans audio**, **24 fps**,
   1280×720, **faststart**, CRF 21.
2. **Lecture performance-first** (`CinematicInterlude.tsx`) :
   - `preload="none"` ; source montée seulement à ~450px de la section.
   - Lecture **uniquement** si section ≥ 55 % visible **et** scroll stabilisé
     (~200ms sans mouvement) → jamais pendant un scroll rapide.
   - Sortie avant/pendant → pause, reset, **libération de la source** (`load()`),
     retour au poster.
   - **Une seule** vidéo montée/active à la fois (garde-fou module `ACTIVE`).
   - Lecture **unique par session** (`sessionStorage`), pas de loop.
   - Fondu **opacity** seul, aucun filtre GPU.
3. **Poster instantané** toujours affiché en base → jamais de zone vide ; si la
   vidéo ne joue jamais, la bande reste belle et lisible.
4. **Arrivée retirée** : plus aucune référence active à `signal-arrival.mp4`.
   L'intro est 100 % WebGL Core + glow CSS. Réactivation possible via `lib/flow.ts`.

## Métadonnées avant / après
| Fichier | Avant | Après (`.web.mp4`) |
|---|---|---|
| material-resonance | H.264 **High**, **+audio AAC**, 24fps, 720p, **2,52 Mo**, ~2019 kb/s | H.264 **Main**, **sans audio**, 24fps, 720p, **1,76 Mo**, ~1406 kb/s, **faststart** |
| signal-dissolution | H.264 **High**, **+audio AAC**, 24fps, 720p, **2,19 Mo**, ~1750 kb/s | H.264 **Main**, **sans audio**, 24fps, 720p, **1,94 Mo**, ~1550 kb/s, **faststart** |
| signal-arrival | 3,08 Mo (existait) | **retirée** (aucune référence active) |

## Comportement
- **Desktop** : poster instantané → à l'approche (~450px) la source se monte
  (preload none, aucun réseau) → au repos + ≥55% visible, la vidéo joue une fois
  (fondu opacity), coupée à `maxDuration`, puis revient au poster. Scroll rapide
  = pas de lecture.
- **Mobile (<768px)** : aucune vidéo, aucun MP4 chargé, poster discret (opacity .22).
- **reduced-motion** : aucune lecture auto, poster statique ; intro WebGL/CSS réduite.
- **Échec / lenteur** : poster conservé, aucun loader, aucune erreur, aucune zone vide.

## Activer / désactiver (un seul endroit)
`lib/flow.ts` : retirer/ajouter une entrée de `FLOW` désactive/active l'interlude
correspondant (les posters restent le fallback). `maxDuration` et la hauteur des
bandes se règlent dans `app/page.tsx`.
