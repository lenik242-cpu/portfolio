@AGENTS.md

# PROJECT NIKITA SITE — V3 (décisions verrouillées)

Portfolio one-page premium d'un artiste 3D. DA **SIGNAL** verrouillée : une
impulsion qui transforme le vide en image, matière et mouvement. Cinématique,
éditorial, premium, maîtrisé, mystérieux. **Jamais** dashboard futuriste,
template SaaS, ni démo Three.js sans contenu.

Plan de production : `docs/V3_PRODUCTION_PLAN.md`.

## Palette
- Fond obsidienne bleutée `#05070e`.
- Matière : platine, argent froid, verre fumé.
- Accent : bleu électrique / violet spectral, **très rare**.
- Pas d'or dominant. Pas de glow permanent, néons excessifs ni auroras décoratives.

## Typographie
- Grotesk nette pour l'information principale (Space Grotesk display / Geist texte).
- Instrument Serif italique **seulement** pour quelques accents éditoriaux.
- Lisible, direct, professionnel.

## Règles techniques
- Conserver la stack (Next 16 / R3F / drei / GSAP+ScrollTrigger / Lenis / Framer Motion).
  Ne pas ajouter de dépendance sans nécessité (`@react-three/postprocessing` sert
  UNIQUEMENT au `/lab`, pas au site public).
- **R3F / shaders : hero + transition vers Capabilities uniquement.**
- **GSAP + ScrollTrigger** : grandes timelines, scroll, caméra.
- **Framer Motion** : micro-interactions d'interface seulement.
- Ne jamais faire modifier le même élément par GSAP **et** Framer Motion.
- **Liquid Glass** : header + CTA principal seulement.
- Contenu / navigation / textes en HTML/CSS accessibles.
- Implémenter `reduced-motion`. Fallback mobile léger (pas de post-processing coûteux,
  pas de particules massives ni bloom agressif).
- Pas de vidéo IA. **Pas de Kairon dans la V3.**

## Narrative du Core
Le Core n'est pas un objet qui tourne en permanence. Il évolue :
`SILENCE → PERCEPTION → RÉSONANCE → TRACE`. L'onde de choc est la signature :
elle révèle les contenus et amorce une transition, jamais un pulse décoratif.

## Interdits
- Cristal sombre presque invisible sur fond sombre.
- Cartes SaaS, badges inutiles, glassmorphism partout.
- Grille portfolio standard, fade-up génériques comme animation principale.
- Pseudo-UI technique (« status », « frequency », « system active »…).
- Plus de deux états de curseur (VIEW, OPEN uniquement).
- Refactor complet inutile ou changement de DA. Effets WebGL qui dégradent la perf.

## Vérification (pane sans compositing)
La pane d'aperçu ne composite pas les frames → WebFL/animations/re-renders gelés,
`getComputedStyle` peu fiable pour l'animé. Vérifier via : `npm run build`, absence
d'erreurs console, structure DOM. Le rendu visuel se valide sur l'écran réel de
l'utilisateur (`http://192.168.1.43:3000`).
