/**
 * Décor de fond global — sobre et presque invisible. Le dégradé obsidienne est
 * porté par le <body> (globals.css) ; ici on ajoute seulement le grain fin et la
 * vignette pour la profondeur. Pas d'auroras ni de glow permanent (DA V3).
 */
export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-grain absolute inset-0" />
      <div className="bg-vignette absolute inset-0" />
    </div>
  );
}
