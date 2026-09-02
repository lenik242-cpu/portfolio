import Link from "next/link";
import Reveal from "@/components/anim/Reveal";
import type { LegalBlock, LegalSection } from "@/lib/legal-content";

/**
 * Page légale (mentions légales / confidentialité) : texte pur, très lisible,
 * espacement généreux, largeur de lecture confortable. Pas d'effet, pas de
 * fond animé, pas de motif italique/accent — ce sont des pages utilitaires,
 * pas éditoriales. Un seul fondu d'entrée discret, cohérent avec le reste du
 * site sans être une « expérience ».
 */
export default function LegalPage({
  title,
  blocks,
  sections,
  lastUpdated,
}: {
  title: string;
  blocks?: LegalBlock[];
  sections: LegalSection[];
  lastUpdated?: string;
}) {
  return (
    <section className="mx-auto max-w-2xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
      <Reveal className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-foreground/50 transition-colors hover:text-accent">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        </div>

        {blocks?.map((block) => (
          <div key={block.heading} className="flex flex-col gap-4">
            <h2 className="text-lg font-medium tracking-tight">{block.heading}</h2>
            {block.intro && <p className="text-foreground/70">{block.intro}</p>}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
              {block.fields.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {f.label}
                  </dt>
                  <dd className="mb-2 text-foreground/80 sm:mb-0">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        {sections.map((s) => (
          <div key={s.heading} className="flex flex-col gap-4">
            <h2 className="text-lg font-medium tracking-tight">{s.heading}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i} className="leading-relaxed text-foreground/70">
                {p}
              </p>
            ))}
            {s.items && (
              <div className="flex flex-col gap-5 pl-1">
                {s.items.map((item) => (
                  <div key={item.title} className="flex flex-col gap-2">
                    <h3 className="font-medium text-foreground/90">{item.title}</h3>
                    {item.paragraphs.map((p, i) => (
                      <p key={i} className="leading-relaxed text-foreground/70">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {s.list && (
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-foreground/70">
                {s.list.map((li, i) => (
                  <li key={i} className="leading-relaxed">
                    {li}
                  </li>
                ))}
              </ul>
            )}
            {s.closing && <p className="leading-relaxed text-foreground/70">{s.closing}</p>}
          </div>
        ))}

        {lastUpdated && (
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Dernière mise à jour : {lastUpdated}
          </p>
        )}
      </Reveal>
    </section>
  );
}
