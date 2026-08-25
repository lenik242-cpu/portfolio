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

export const metadata: Metadata = {
  title: `${SITE.brand} · ${SITE.role}`,
  description: SITE.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
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
