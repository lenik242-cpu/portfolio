"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/lib/site";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const GREETING = "Bonjour, je suis Kairon, l'assistant de Nikita. Comment puis-je vous aider ?";
const FALLBACK_ERROR = `Kairon est momentanément indisponible, contactez Nikita directement à ${SITE.email}.`;
const MAX_MESSAGE_LENGTH = 2000;

type ChatMessage = {
  role: "user" | "model";
  content: string;
  isError?: boolean;
};

/**
 * Kairon — assistant IA du site (widget flottant, présent sur toutes les
 * pages). Le front n'appelle jamais Gemini directement : uniquement notre
 * propre route /api/kairon (clé API côté serveur uniquement). Framer Motion
 * pour l'ouverture/fermeture (micro-interaction d'interface). Panneau sobre
 * et sombre, pas de Liquid Glass ici (« clean, dark, minimal »).
 */
export default function KaironWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reduced, setReduced] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "model", content: GREETING }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), reduced ? 0 : 350);
    return () => window.clearTimeout(t);
  }, [open, reduced]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || text.length > MAX_MESSAGE_LENGTH) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/kairon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.reply) {
        setMessages((cur) => [
          ...cur,
          { role: "model", content: data?.error ?? FALLBACK_ERROR, isError: true },
        ]);
        return;
      }
      setMessages((cur) => [...cur, { role: "model", content: data.reply }]);
    } catch {
      setMessages((cur) => [...cur, { role: "model", content: FALLBACK_ERROR, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60] sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Fermer Kairon" : "Ouvrir Kairon, l'assistant"}
          data-cursor="link"
          className="kairon-fab h-14 w-14"
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Kairon, assistant du site"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
            className="fixed bottom-24 right-4 left-4 z-[60] flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c12] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] sm:bottom-28 sm:left-auto sm:right-8 sm:w-[380px]"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90">
                  Kairon
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                data-cursor="link"
                className="text-muted transition-colors hover:text-foreground"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Historique */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <p
                      className={[
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-accent/15 text-foreground/95"
                          : m.isError
                            ? "border border-white/10 bg-white/[0.03] text-muted"
                            : "border border-white/5 bg-white/[0.04] text-foreground/85",
                      ].join(" ")}
                    >
                      {m.content}
                    </p>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
                      <TypingDot delay={0} />
                      <TypingDot delay={0.15} />
                      <TypingDot delay={0.3} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Saisie */}
            <form onSubmit={send} className="flex items-end gap-2 border-t border-white/10 p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
                rows={1}
                placeholder="Écrivez à Kairon…"
                aria-label="Votre message"
                className="max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
                className="kairon-fab h-9 w-9 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendIcon />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-muted"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H9l-4 4v-4H5.5C4.67 16 4 15.33 4 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M4 12L20 4L13 20L11 13L4 12Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
