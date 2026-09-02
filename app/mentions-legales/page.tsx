import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { MENTIONS_LEGALES_CONTENT } from "@/lib/legal-content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Mentions légales · ${SITE.brand}`,
  description: "Mentions légales du site de Nikita Resta.",
};

export default function MentionsLegalesPage() {
  const c = MENTIONS_LEGALES_CONTENT;
  return <LegalPage title={c.title} blocks={c.blocks} sections={c.sections} />;
}
