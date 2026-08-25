import Link from "next/link";
import type { Project } from "@/lib/projects";

/**
 * Pièce de galerie — image forte + typographie éditoriale (pas une « carte »).
 * L'image est le sujet ; le cadre disparaît. Hover : léger zoom + voile chrome.
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      data-cursor="view"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.hero}
          alt={project.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
        {/* voile chrome au survol */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
        <span className="absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.18em] text-white/75">
          {project.category}
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <span className="shrink-0 font-mono text-sm text-foreground/40">
          {project.year}
        </span>
      </div>
      <p className="mt-1 text-sm text-foreground/50">{project.summary}</p>
    </Link>
  );
}
