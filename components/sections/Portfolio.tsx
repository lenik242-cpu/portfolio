import Link from "next/link";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import ProjectCard from "@/components/portfolio/ProjectCard";
import { FEATURED } from "@/lib/projects";

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div className="mb-14 max-w-2xl sm:mb-20">
        <KineticText
          as="h2"
          onScroll
          text="Une sélection de mes projets."
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        />
      </div>

      <Reveal stagger className="grid gap-6 sm:grid-cols-2">
        {FEATURED.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </Reveal>

      <Reveal className="mt-14 flex justify-center">
        <Link
          href="/portfolio"
          className="btn-primary glass-liquid inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
        >
          Voir tout le portfolio
          <span aria-hidden>→</span>
        </Link>
      </Reveal>
    </section>
  );
}
