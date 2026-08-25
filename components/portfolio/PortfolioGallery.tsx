"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, PROJECTS, type Category } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

type Filter = "Tous" | Category;

const FILTERS: Filter[] = ["Tous", ...CATEGORIES];

export default function PortfolioGallery() {
  const [active, setActive] = useState<Filter>("Tous");

  const visible = useMemo(
    () =>
      active === "Tous"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === active),
    [active]
  );

  return (
    <div>
      {/* Filtres par catégorie */}
      <div className="mb-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              aria-pressed={isActive}
              className={[
                "relative rounded-full px-4 py-2 text-sm transition-colors",
                isActive
                  ? "glass-pill text-foreground"
                  : "text-foreground/55 hover:text-foreground/90",
              ].join(" ")}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Grille de projets */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
