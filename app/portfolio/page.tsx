import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import KineticText from "@/components/anim/KineticText";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import PageShaderBackground from "@/components/layout/PageShaderBackground";
import { SITE } from "@/lib/site";

const TITLE = `Portfolio · ${SITE.brand}`;
const DESCRIPTION =
  "Sélection complète de projets 3D de Nikita Resta : personnages, modélisation, visualisation produit et environnements.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/portfolio",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PortfolioPage() {
  return (
    <>
      <PageShaderBackground />
      <section className="mx-auto max-w-7xl px-8 pb-28 pt-32 sm:px-6 sm:pt-40">
        <Reveal className="mb-12 flex flex-col gap-4">
          <Link
            href="/#portfolio"
            className="text-sm text-foreground/50 transition-colors hover:text-accent"
          >
            ← Retour à l&apos;accueil
          </Link>
          <KineticText
            as="h1"
            text="Tous mes projets, par catégorie."
            className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl"
          />
          <p className="max-w-xl text-foreground/60">
            Personnages, modélisation, visualisation produit et environnements.
            Filtre selon ce qui t&apos;intéresse.
          </p>
        </Reveal>

        <PortfolioGallery />
      </section>
    </>
  );
}
