import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Background from "@/components/layout/Background";
import FloatingNav from "@/components/layout/FloatingNav";
import Footer from "@/components/layout/Footer";
import LiquidGlassFilter from "@/components/layout/LiquidGlassFilter";
import LiquidGlassController from "@/components/providers/LiquidGlassController";
import ScrollProgress from "@/components/common/ScrollProgress";
import CustomCursor from "@/components/common/CustomCursor";
import KaironWidget from "@/components/kairon/KaironWidget";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display grotesk à caractère pour les titres (sort du Geist par défaut).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Serif éditorial à fort contraste — accent italique sur les mots-clés.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const TITLE = "Nikita Resta — Artiste 3D | Imagerie produit & visualisation";
const DESCRIPTION =
  "Nikita Resta, artiste 3D freelance en France. Imagerie produit, character design, visualisation e-commerce et sites web sur-mesure — du concept au rendu final.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: SITE.brand,
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

// Données structurées (JSON-LD) : identifie Nikita Resta comme personne et
// comme prestataire de service 3D/web freelance auprès de Google.
const personId = `${SITE.url}/#person`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: SITE.brand,
      url: SITE.url,
      jobTitle: SITE.role,
      description: SITE.tagline,
      email: `mailto:${SITE.email}`,
      image: `${SITE.url}/about.jpg`,
      sameAs: SITE.socials.map((s) => s.href),
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE.url}/#service`,
      name: `${SITE.brand} — ${SITE.role}`,
      url: SITE.url,
      description: DESCRIPTION,
      areaServed: "FR",
      provider: { "@id": personId },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          // eslint-disable-next-line @typescript-eslint/naming-convention -- dangerouslySetInnerHTML est le nom imposé par React.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Background />
        <CustomCursor />
        <LiquidGlassFilter />
        <LiquidGlassController />
        <SmoothScrollProvider>
          <ScrollProgress />
          <FloatingNav />
          {children}
          <Footer />
        </SmoothScrollProvider>
        <KaironWidget />
      </body>
    </html>
  );
}
