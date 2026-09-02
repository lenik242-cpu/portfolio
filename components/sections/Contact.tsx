import Reveal from "@/components/anim/Reveal";
import LiquidMetalButton from "@/components/ui/LiquidMetalButton";
import { SITE } from "@/lib/site";

/**
 * CONTACT — simple et premium. Email, réseaux et CTA clairs. Entièrement
 * compréhensible sans WebGL, shader ou vidéo. Le CTA métal est le dernier
 * moment tactile du site. Padding haut/bas asymétrique : l'arrivée respire,
 * la sortie vers le footer est resserrée pour ne pas laisser un vide noir.
 * Lueur statique très discrète (pas de shader, aucun mouvement) pour que le
 * bas de section ne se sente pas vide.
 */
export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden pb-12 pt-28 text-center sm:pb-16 sm:pt-40">
      <div className="contact-glow pointer-events-none absolute inset-0 -z-10" />
      <div className="relative mx-auto max-w-5xl px-8 sm:px-6">
        <Reveal className="flex flex-col items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-muted">Contact</p>
          <h2 className="max-w-3xl text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            Créons la prochaine{" "}
            <span className="font-serif italic font-normal text-gradient">image</span>.
          </h2>
          <p className="max-w-xl text-lg text-muted">
            Visuels produit, assets 3D ou une collaboration — studios, marques
            et créateurs sont les bienvenus.
          </p>

          <div className="mt-6">
            <LiquidMetalButton href={`mailto:${SITE.email}`}>
              {SITE.email}
            </LiquidMetalButton>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
