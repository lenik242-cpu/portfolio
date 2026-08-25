import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import ParallaxImage from "@/components/portfolio/ParallaxImage";
import PageShaderBackground from "@/components/layout/PageShaderBackground";
import { PROJECTS, getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: `Projet · ${SITE.brand}` };
  return {
    title: `${project.title} · ${SITE.brand}`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <PageShaderBackground />
      <article className="mx-auto max-w-5xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
        <Reveal className="mb-12 flex flex-col gap-4">
          <Link
            href="/portfolio"
            className="text-sm text-foreground/50 transition-colors hover:text-accent"
          >
            ← Tous les projets
          </Link>
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-gradient">
            {project.category} · {project.year}
          </span>
          <KineticText
            as="h1"
            text={project.title}
            className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
          />
          <p className="max-w-2xl text-lg leading-relaxed text-foreground/60">
            {project.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="glass-pill rounded-full px-4 py-2 text-sm text-foreground/70"
              >
                {tool}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Galerie animée */}
        <div className="flex flex-col gap-8">
          {project.images.map((image, i) => (
            <ParallaxImage
              key={image.src}
              src={image.src}
              width={image.width}
              height={image.height}
              alt={`${project.title}, visuel ${i + 1}`}
              priority={i === 0}
            />
          ))}
        </div>

        {/* CTA */}
        <Reveal className="mt-16 flex flex-col items-center gap-6 text-center">
          <p className="text-lg text-foreground/60">
            Un projet similaire en tête ?
          </p>
          <Link
            href="/#contact"
            className="btn-primary glass-liquid inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
          >
            Discutons-en
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </article>
    </>
  );
}
