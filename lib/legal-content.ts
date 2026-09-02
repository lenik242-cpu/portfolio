// Contenu des pages légales (mentions légales + politique de confidentialité).
// Les deux valeurs ci-dessous sont les SEULES à surveiller/mettre à jour :

/** ⚠️ À COMPLÉTER avant mise en ligne définitive (14 chiffres). */
export const SIRET = "[SIRET — À COMPLÉTER : 14 chiffres]";

/** ⚠️ À mettre à jour à chaque révision de la politique de confidentialité. */
export const PRIVACY_LAST_UPDATED = "[DATE — à mettre à jour lors de la mise en ligne]";

export interface LegalField {
  label: string;
  value: string;
}

export interface LegalBlock {
  heading: string;
  intro?: string;
  fields: LegalField[];
}

export interface LegalSubItem {
  title: string;
  paragraphs: string[];
}

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Paragraphe affiché après la liste à puces (le cas échéant). */
  closing?: string;
  items?: LegalSubItem[];
}

export const MENTIONS_LEGALES_CONTENT = {
  title: "Mentions légales",
  blocks: [
    {
      heading: "Éditeur du site",
      intro: "Le présent site est édité par :",
      fields: [
        { label: "Nom", value: "Nikita Resta" },
        { label: "Statut", value: "Entrepreneur Individuel (EI)" },
        { label: "Adresse", value: "68b rue de Malhourtet, 12100 Millau, France" },
        { label: "Téléphone", value: "07 82 55 40 62" },
        { label: "Email", value: "nikita.resta.pro@gmail.com" },
        { label: "SIRET", value: SIRET },
        { label: "TVA", value: "Non applicable, article 293 B du CGI." },
        { label: "Directeur de la publication", value: "Nikita Resta" },
      ],
    },
    {
      heading: "Hébergeur",
      intro: "Le site est hébergé par :",
      fields: [
        { label: "Société", value: "Vercel Inc." },
        { label: "Adresse", value: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis" },
        { label: "Site", value: "https://vercel.com" },
      ],
    },
  ] satisfies LegalBlock[],
  sections: [
    {
      heading: "Propriété intellectuelle",
      paragraphs: [
        "L'ensemble des contenus présents sur ce site (visuels 3D, rendus, textes, illustrations, éléments graphiques et leur agencement) sont, sauf mention contraire, la propriété exclusive de Nikita Resta. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite.",
        "Certains rendus présentés dans le portfolio représentent des produits de marques tierces (à titre d'études de modélisation et de démonstration de savoir-faire). Les marques et produits concernés restent la propriété de leurs détenteurs respectifs. Ces visuels sont présentés à des fins strictement démonstratives et non commerciales.",
      ],
    },
    {
      heading: "Responsabilité",
      paragraphs: [
        "Nikita Resta s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne saurait être tenu responsable des erreurs ou omissions, ni de l'usage qui pourrait en être fait par un tiers.",
      ],
    },
    {
      heading: "Droit applicable",
      paragraphs: [
        "Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.",
      ],
    },
  ] satisfies LegalSection[],
};

export const PRIVACY_POLICY_CONTENT = {
  title: "Politique de confidentialité",
  lastUpdated: PRIVACY_LAST_UPDATED,
  sections: [
    {
      heading: "Préambule",
      paragraphs: [
        "La présente politique de confidentialité décrit la manière dont les données des visiteurs du site sont traitées. Nikita Resta attache une importance particulière au respect de la vie privée et à la protection des données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.",
      ],
    },
    {
      heading: "Responsable du traitement",
      paragraphs: [
        "Le responsable du traitement des données est :",
        "Nikita Resta — nikita.resta.pro@gmail.com",
      ],
    },
    {
      heading: "Quelles données sont collectées ?",
      paragraphs: [
        "Ce site est un portfolio. Il ne collecte pas de données personnelles à votre insu et n'utilise pas de cookies publicitaires ni de traceurs marketing.",
        "Les seules données susceptibles d'être traitées sont :",
      ],
      items: [
        {
          title: "1. Les messages envoyés à l'assistant Kairon",
          paragraphs: [
            "Le site propose un assistant conversationnel (« Kairon »). Lorsque vous échangez avec lui, le contenu de vos messages est transmis à un service d'intelligence artificielle tiers, Google Gemini (fourni par Google), afin de générer une réponse. Ces messages ne sont pas conservés durablement par Nikita Resta et servent uniquement à faire fonctionner la conversation en cours. Nous vous invitons à ne pas communiquer d'informations sensibles ou confidentielles via cet assistant.",
            "Le traitement effectué par Google Gemini est soumis à la politique de confidentialité de Google : https://policies.google.com/privacy",
          ],
        },
        {
          title: "2. Les données de contact que vous transmettez volontairement",
          paragraphs: [
            "Si vous choisissez de contacter Nikita Resta par email (via l'adresse indiquée sur le site), les informations que vous communiquez (nom, adresse email, contenu du message) sont utilisées uniquement pour répondre à votre demande et ne sont pas transmises à des tiers.",
          ],
        },
      ],
    },
    {
      heading: "Hébergement et données techniques",
      paragraphs: [
        "Le site est hébergé par Vercel Inc. Comme la plupart des hébergeurs, Vercel peut collecter des données techniques automatiques (adresse IP, type de navigateur, pages consultées) à des fins de fonctionnement et de sécurité du service. Ces données sont traitées conformément à la politique de confidentialité de Vercel : https://vercel.com/legal/privacy-policy",
      ],
    },
    {
      heading: "Finalité des traitements",
      paragraphs: ["Les données sont traitées uniquement pour :"],
      list: [
        "permettre le fonctionnement de l'assistant Kairon ;",
        "répondre aux demandes de contact ;",
        "assurer le bon fonctionnement et la sécurité du site.",
      ],
      closing: "Aucune donnée n'est vendue, louée ou cédée à des tiers à des fins commerciales.",
    },
    {
      heading: "Vos droits",
      paragraphs: [
        "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition concernant vos données personnelles. Pour exercer ces droits, vous pouvez contacter : nikita.resta.pro@gmail.com",
        "Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés — www.cnil.fr).",
      ],
    },
    {
      heading: "Modification",
      paragraphs: [
        "La présente politique de confidentialité peut être mise à jour à tout moment. La date de dernière mise à jour est indiquée ci-dessous.",
      ],
    },
  ] satisfies LegalSection[],
};
