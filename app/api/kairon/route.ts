import { NextResponse } from "next/server";
import { KAIRON_SYSTEM_PROMPT } from "@/lib/kairon-prompt";

// Route serveur uniquement : GEMINI_API_KEY ne quitte jamais cet environnement
// d'exécution (jamais envoyée au client, jamais dans le bundle JS).
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_MESSAGE_LENGTH = 2000; // caractères par message
const MAX_HISTORY = 30; // messages par requête
// gemini-3.6-flash consomme une partie du budget en "thinking" interne avant
// la réponse visible ; un budget trop court tronque la réponse en plein
// milieu. Le prompt système garde déjà les réponses courtes (2-4 phrases).
const MAX_OUTPUT_TOKENS = 1024;

// Rate limit basique en mémoire (best-effort) : selon l'hébergement (ex.
// fonctions serverless multi-instances), l'état peut ne pas être partagé
// entre toutes les requêtes — c'est un frein contre le spam simple, pas une
// garantie absolue. Pour un site perso à faible trafic, largement suffisant.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 15; // requêtes / fenêtre / IP
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(ip, timestamps);
  // Nettoyage occasionnel pour éviter une fuite mémoire lente.
  if (hits.size > 5000) {
    for (const [key, values] of hits) {
      if (values.every((t) => t <= windowStart)) hits.delete(key);
    }
  }
  return timestamps.length > RATE_LIMIT_MAX;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

type ChatMessage = { role: "user" | "model"; content: string };

const FRIENDLY_ERROR =
  "Kairon est momentanément indisponible, contactez Nikita directement à nikita.resta.pro@gmail.com.";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (messages.length > MAX_HISTORY) {
    return NextResponse.json({ error: "Conversation trop longue." }, { status: 400 });
  }

  const cleaned: ChatMessage[] = [];
  for (const m of messages) {
    const role = (m as Partial<ChatMessage>)?.role;
    const content = (m as Partial<ChatMessage>)?.content;
    if (
      (role !== "user" && role !== "model") ||
      typeof content !== "string" ||
      content.length === 0 ||
      content.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ error: "Message invalide." }, { status: 400 });
    }
    cleaned.push({ role, content });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[kairon] GEMINI_API_KEY manquante dans l'environnement serveur.");
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 500 });
  }

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: KAIRON_SYSTEM_PROMPT }] },
        contents: cleaned.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      console.error("[kairon] Gemini API error", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 502 });
    }

    const data = await res.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      // Réponse coupée par les filtres de sécurité Gemini ou vide.
      const finishReason = data?.candidates?.[0]?.finishReason;
      console.error("[kairon] Réponse vide", finishReason);
      return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 502 });
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (err) {
    console.error("[kairon] Erreur réseau vers Gemini", err);
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 502 });
  }
}
