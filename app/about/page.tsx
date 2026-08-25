import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import PageShaderBackground from "@/components/layout/PageShaderBackground";
import { SITE } from "@/lib/site";
import { ABOUT_PAGE_CONTENT, HOME_SERVICES, SOFTWARE } from "@/lib/content";
import { PROCESS } from "@/lib/services";

export const metadata: Metadata = {
  title: `À propos · ${SITE.brand}`,
  description:
    "Artiste 3D freelance spécialisé en imagerie produit et character design, aussi à l'aise sur un site web que sur un rendu.",
};

export default function AboutPage() {
  const c = ABOUT_PAGE_CONTENT;

  return (
    <>
      <PageShaderBackground />
      <section className="mx-auto max-w-7xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
        <Reveal className="mb-14 flex flex-col gap-5">
          <Link href="/" className="text-sm text-foreground/50 transition-colors hover:text-accent">
            ← {c.backLabel}
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-muted">{c.label}</p>
          <KineticText
            as="h1"
            text={`${c.titleBefore}${c.titleAccent}${c.titleAfter}`}
            className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl"
          />
          <p className="max-w-xl text-lg text-foreground/60">{c.intro}</p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <Reveal>
            <div className="glass-panel glass-liquid relative aspect-[3/4] overflow-hidden rounded-3xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/about.jpg" alt={c.photoAlt} className="h-full w-full object-cover" />
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-6">
            {c.bio.map((p, i) => (
              <p
                key={i}
                className={i === 0 ? "text-lg leading-relaxed text-foreground/70" : "text-lg leading-relaxed text-foreground/60"}
              >
                {p}
              </p>
            ))}

            <div>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-foreground/40">
                {c.toolsLabel}
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                {SOFTWARE.map((tool) => (
                  <span key={tool} className="glass-pill rounded-full px-4 py-2 text-sm text-foreground/70">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Valeurs */}
        <Reveal stagger className="mt-24 grid gap-4 sm:grid-cols-3">
          {c.values.map((v) => (
            <div
              key={v.title}
              className="glass-panel glass-liquid rounded-3xl p-8 transition-transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-medium text-gradient">{v.title}</h2>
              <p className="mt-3 text-foreground/60">{v.desc}</p>
            </div>
          ))}
        </Reveal>

        {/* Ce que ça couvre — écho discret des 4 disciplines de l'accueil */}
        <Reveal className="mt-24">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-foreground/40">
            {c.includedLabel}
          </span>
          <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {HOME_SERVICES.map((s) => (
              <li key={s.n} className="flex items-baseline gap-4 border-t border-white/10 py-4">
                <span className="font-mono text-xs text-foreground/35">{s.n}</span>
                <div>
                  <h3 className="font-medium tracking-tight">{s.name}</h3>
                  <p className="mt-1 text-sm text-foreground/55">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Comment je travaille */}
        <Reveal className="mt-24 flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-foreground/40">
            {c.processLabel}
          </span>
        </Reveal>
        <Reveal stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((p) => (
            <div key={p.step} className="rounded-2xl border border-foreground/10 bg-white/[0.02] p-6">
              <span className="text-gradient text-2xl font-semibold">{p.step}</span>
              <h3 className="mt-3 text-lg font-medium">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/55">{p.desc}</p>
            </div>
          ))}
        </Reveal>

        {/* CTA contact */}
        <Reveal className="mt-24 flex flex-col items-center gap-5 text-center">
          <p className="text-lg text-foreground/60">{c.ctaText}</p>
          <Link
            href="/#contact"
            className="btn-primary glass-liquid inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
          >
            {c.ctaButton}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
