# DESIGN.md — Constitution visuelle du site

> Document de référence. Toute décision de design doit respecter ce qui suit.
> À donner à Claude Code comme cadre permanent du projet.

---

## Direction artistique en une phrase

**Une galerie sombre et cinématique où les rendus 3D sont les stars, portés par des effets signature — jamais noyés dedans.**

Site portfolio de Nikita Resta, artiste 3D (modélisation produit, personnages, concept art).

---

## Règle d'or (hiérarchie)

**La 3D est toujours le héros.** Les effets vivent *autour* de l'œuvre (fonds, transitions, hero), jamais *par-dessus* un rendu. Si un effet gêne la lecture d'un visuel 3D, il dégage.

Ordre d'importance visuelle sur chaque écran :
1. Le rendu 3D / le travail
2. Le texte (titre, contexte du projet)
3. Les effets (shader, lignes, liquid)

---

## Palette

| Rôle | Couleur | Usage |
|------|---------|-------|
| Fond | `#08090D` (obsidienne) | Fond global, ne change jamais |
| Texte | `#F1F2F4` (blanc cassé) | Titres, corps |
| Accent | `#4C7DFF` (bleu) | **UN SEUL accent** — liens, hovers, détails rares |
| Métal | `#71859A` (platine froid) | Bordures, reflets boutons, filets |

**Règle absolue : une seule couleur d'accent.** Aucune 2e couleur vive. Le premium vient de la retenue.

---

## Typographie

- Titres : géométrique / grotesk moderne (ex. Space Grotesk, Neue Montreal)
- Corps : sans-serif lisible, même famille ou proche
- Mono : pour les labels techniques (ROLE, SOFTWARE, numéros de projet) — renforce le côté tech

---

## Rôle des effets (assignation stricte)

| Effet | Où | Réglage |
|-------|-----|---------|
| **Liquid shader** | Hero UNIQUEMENT — pièce maîtresse | opacity ~0.40 (assumé, visible) |
| **Background paths (lignes)** | Transitions entre sections SEULEMENT | fines, platine, apparition unique |
| **Liquid metal buttons** | CTA uniquement | reflet froid au repos, sheen au hover |
| **3D temps réel (R3F)** | Portfolio — rotation au scroll / drag | LE cœur du site |
| **Vidéo bouclée (Blender)** | Hero ou accents — éclairage cinématique | WebM + fallback MP4, muet, loop, playsinline, 4-8s compressée |

Ne jamais empiler deux effets lourds sur le même écran. Un seul canvas WebGL à la fois.

---

## Mouvement (ce qui fait "en jeter")

Un site premium bouge dès l'arrivée. À intégrer :
- **Hero** : rendu produit avec léger mouvement (vidéo bouclée : zoom lent + lumière qui balaie) OU parallaxe légère à la souris.
- **Parallaxe souris** : décalage subtil de l'image selon le curseur (code, pas vidéo).
- **Titres** : un mot-clé qui se révèle en micro-animation à l'entrée.
- **Scroll** : apparitions douces (GSAP), jamais brutales.

Vidéo = éclairage cinématique. Temps réel = interactivité (rotation scroll, drag). Les deux peuvent coexister sur des sections différentes.

---

## Contenu modifiable

Centraliser TOUS les textes du site dans un seul fichier `content.ts` (titres, descriptions projets, services, à propos). Objectif : pouvoir changer n'importe quel texte sans fouiller le code. Tout est modifiable à tout moment (texte, couleurs, images) sans rien casser.

---

## Structure des sections (rappel)

1. Nav flottante (liquid glass, fixe)
2. Hero (shader + rendu produit + mouvement)
3. Portfolio (3D au scroll — produits · personnages · concept arts)
4. Services
5. À propos
6. Kairon (assistant IA — API Anthropic côté serveur)
7. Contact + Footer

---

## Références cibles (rythme, transitions, ambiance)

- Active Theory
- Unseen Studio
- Hubtown
- Awwwards → collections "dark" + "3D" + "WebGL"

Étudier surtout : leurs **transitions entre sections** et le **rythme du scroll**.

---

## Anti-patterns (à ne jamais faire)

- ❌ Plus d'une couleur d'accent
- ❌ Un effet par-dessus un rendu 3D
- ❌ Deux effets WebGL lourds sur le même écran
- ❌ Hero statique et figé
- ❌ Vidéo lourde non compressée / non bouclée
- ❌ Textes en dur éparpillés dans le code
