import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import PageShaderBackground from "@/components/layout/PageShaderBackground";
import { SITE } from "@/lib/site";
import { SERVICES, PROCESS } from "@/lib/services";

export const metadata: Metadata = {
  title: `Services · ${SITE.brand}`,
  description:
    "Services 3D : modélisation, personnages, visualisation produit, texturing, real-time, et création de sites web assistée par IA.",
};

export default function ServicesPage() {
  return (
    <>
      <PageShaderBackground />
      <section className="mx-auto max-w-7xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
        <Reveal className="mb-14 flex flex-col gap-4">
          <Link
            href="/#services"
            className="text-sm text-foreground/50 transition-colors hover:text-accent"
          >
            ← Retour à l&apos;accueil
          </Link>
          <KineticText
            as="h1"
            text="Ce que je peux réaliser pour vous."
            className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl"
          />
          <p className="max-w-xl text-foreground/60">
            De la modélisation d&apos;un personnage à la visualisation d&apos;un
            produit, je couvre la chaîne 3D complète, du concept au livrable.
          </p>
        </Reveal>

        {/* Détail des services */}
        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="glass-panel glass-liquid rounded-3xl p-8 transition-transform hover:-translate-y-1"
            >
              <span className="text-sm text-foreground/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 text-2xl font-medium">{s.title}</h2>
              <p className="mt-3 text-foreground/60">{s.desc}</p>
            </div>
          ))}
        </Reveal>

        {/* Déroulé d'un projet */}
        <Reveal className="mt-24 flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-gradient">
            Comment ça se passe
          </span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Le déroulé d&apos;un projet.
          </h2>
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((p) => (
            <div
              key={p.step}
              className="rounded-2xl border border-foreground/10 bg-white/[0.02] p-6"
            >
              <span className="text-gradient text-2xl font-semibold">
                {p.step}
              </span>
              <h3 className="mt-3 text-lg font-medium">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/55">{p.desc}</p>
            </div>
          ))}
        </Reveal>

        {/* Au-delà de la 3D */}
        <Reveal className="mt-24">
          <div className="glass-panel glass-liquid rounded-3xl p-8 sm:p-10">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-foreground/40">
              Au-delà de la 3D
            </span>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SITE.otherServices.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-foreground/10 bg-white/[0.02] p-6"
                >
                  <h3 className="text-lg font-medium text-gradient">{s.title}</h3>
                  <p className="mt-2 text-sm text-foreground/60">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA contact */}
        <Reveal className="mt-16 flex justify-center">
          <Link
            href="/#contact"
            className="btn-primary glass-liquid inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
          >
            Discuter de votre projet
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
