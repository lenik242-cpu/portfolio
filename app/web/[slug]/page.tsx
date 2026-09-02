import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import ParallaxImage from "@/components/portfolio/ParallaxImage";
import PageShaderBackground from "@/components/layout/PageShaderBackground";
import { WEBSITES, getWebsite } from "@/lib/websites";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return WEBSITES.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = getWebsite(slug);
  if (!site) return { title: `Site web · ${SITE.brand}` };
  return {
    title: `${site.name} · ${SITE.brand}`,
    description: site.tag,
  };
}

export default async function WebsitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getWebsite(slug);
  if (!site) notFound();

  return (
    <>
      <PageShaderBackground />
      <article className="mx-auto max-w-5xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
        <Reveal className="mb-12 flex flex-col gap-4">
          <Link
            href="/#web-experiences"
            className="text-sm text-foreground/50 transition-colors hover:text-accent"
          >
            ← Retour
          </Link>
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-gradient">
            {site.category}
          </span>
          <KineticText
            as="h1"
            text={site.name}
            className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
          />
          <p className="max-w-2xl text-lg leading-relaxed text-foreground/60">
            {site.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="btn-primary glass-liquid inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
            >
              Voir le site live
              <span aria-hidden>→</span>
            </a>
            <span className="font-mono text-sm text-foreground/40">{site.url}</span>
          </div>
        </Reveal>

        <ParallaxImage
          src={site.image}
          alt={`${site.name} — capture du site`}
          width={site.width}
          height={site.height}
          priority
        />
      </article>
    </>
  );
}
