import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { PRIVACY_POLICY_CONTENT } from "@/lib/legal-content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Politique de confidentialité · ${SITE.brand}`,
  description: "Politique de confidentialité du site de Nikita Resta.",
};

export default function ConfidentialitePage() {
  const c = PRIVACY_POLICY_CONTENT;
  return (
    <LegalPage
      title={c.title}
      sections={c.sections}
      lastUpdated={c.lastUpdated}
    />
  );
}
