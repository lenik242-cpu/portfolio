import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // L'export statique a été retiré : Kairon (app/api/kairon/route.ts) est
  // une vraie route serveur (clé API Gemini côté serveur, jamais exposée au
  // client) — incompatible avec `output: "export"`, qui interdit toute
  // route API. Le site nécessite donc désormais un hébergement Node (ex.
  // Vercel), plus un simple host statique.
  images: { unoptimized: true },
  // Autorise l'accès au serveur dev depuis le téléphone (même Wi-Fi) : sans
  // ça, Next.js bloque en 403 les requêtes cross-origin vers /_next/* (JS,
  // HMR) dès que l'origine n'est pas localhost. Ajoute ton IP LAN ici si
  // elle change (ipconfig → adresse IPv4 du Wi-Fi).
  allowedDevOrigins: ["192.168.1.43"],
};

export default nextConfig;
