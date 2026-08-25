# Flow videos — intégration (interludes cinématiques)

Trois vidéos Google Flow (1280×720, 10 s) intégrées comme **interludes rares et
secondaires**. Elles n'altèrent ni le Core SIGNAL, ni le contenu, ni la DA.

## Placement
| Vidéo | Emplacement | Composant | Déclenchement |
|---|---|---|---|
| `signal-arrival.mp4` | Intro (sous le glow) | `sections/Intro.tsx` | 1×/session, autoplay muet, ~2,8 s (durée de l'intro), fallback = glow CSS/WebGL |
| `material-resonance.mp4` | Bande entre Capabilities et Selected work | `media/CinematicInterlude.tsx` | à l'entrée du viewport, 1×, coupée à 4,5 s, fond obsidienne |
| `signal-dissolution.mp4` | Bande après Contact, avant le footer | `media/CinematicInterlude.tsx` | à l'entrée du viewport, 1×, coupée à 5 s, fondu vers `#05070e` |

## Composant réutilisable
`CinematicInterlude` (résonance + dissolution) : `<video muted playsInline
preload="metadata">`, sans contrôles, sans boucle. La source n'est chargée que
lorsque la bande approche (IntersectionObserver, `rootMargin 40%`). Lecture unique
à > 50 % de visibilité, coupée après `maxDuration`, **pause + reset** à la sortie.
Fondu (opacity) vers l'obsidienne via overlay dégradé. Config des chemins :
`lib/flow.ts` (swap facile, posters inclus).

## Fallback
- **reduced-motion** : aucune lecture auto. Intro sautée (Core immédiat) ;
  interludes → **poster statique** discret (opacity .22) sur fond obsidienne.
- **mobile (< 768px)** : vidéos Flow désactivées. Intro = glow CSS seul ;
  interludes → poster statique discret. Contenu HTML et lisibilité intacts.
- **chargement lent / échec** : l'intro et les sections restent fonctionnelles ;
  la vidéo est ignorée, jamais bloquante (aucun loader).

## Posters
Générés via ffmpeg (déjà présent, aucune dépendance ajoutée), frame ≈ 1 s,
WebP optimisé dans `public/media/posters/` :
`signal-arrival.webp` (8 Ko), `material-resonance.webp` (40 Ko),
`signal-dissolution.webp` (28 Ko).

## Garanties
- Jamais plus d'une vidéo à la fois (régions de scroll disjointes).
- Les trois vidéos ne sont pas préchargées au chargement initial.
- Aucune vidéo en fond global, ni derrière les projets/textes.
- Aucune dépendance npm. GSAP/Framer inchangés (aucun élément partagé).
