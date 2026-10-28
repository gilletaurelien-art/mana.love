import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { useChatProvider, useChatStatus } from "@/app/ChatProviderContext";
import { sortedPersonalities, getPersonality } from "@/domain/personalityRegistry";
import type { ChatMessage, PersonalityConfig } from "@/domain/personalities";
import type { ProviderReply } from "@/domain/chat";
import "./chat.css";

type SendState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "error"; message: string };

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isPersonalityUnlocked(p: PersonalityConfig, balance: number): boolean {
  return p.unlock.kind === "free" || balance >= p.unlock.threshold;
}

export default function ChatScreen() {
  const { balance, conversations } = useProgression();
  const provider = useChatProvider();
  const { checked } = useChatStatus();
  const [params, setParams] = useSearchParams();

  const requestedId = params.get("avec");
  const all = sortedPersonalities();
  const requested = requestedId ? getPersonality(requestedId) : undefined;
  const active: PersonalityConfig =
    requested && isPersonalityUnlocked(requested, balance)
      ? requested
      : all[0];

  const history = conversations.get(active.id);
  const [draft, setDraft] = useState("");
  const [sendState, setSendState] = useState<SendState>({ phase: "idle" });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [history.length, sendState.phase]);

  const unlockedPersonalities = all.filter((p) =>
    isPersonalityUnlocked(p, balance)
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendState.phase === "loading") return;

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      createdAt: new Date().toISOString(),
      text: trimmed,
    };
    conversations.append(active.id, userMessage);
    setDraft("");
    setSendState({ phase: "loading" });

    try {
      let reply: ProviderReply;
      try {
        reply = await provider.complete({
          messages: [...history, userMessage],
          personality: active,
        });
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : "raison inconnue";
        throw new Error(`La conversation a échoué : ${detail}`, {
          cause: err,
        });
      }
      conversations.append(active.id, {
        id: uid(),
        role: "companion",
        createdAt: new Date().toISOString(),
        text: reply.text,
      });
      setSendState({ phase: "idle" });
    } catch (err) {
      setSendState({
        phase: "error",
        message: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    }
  }

  return (
    <div className="chat">
      <div className="chat__sidebar" aria-label="Choisir une personnalité">
        <p className="eyebrow">Personnalité active</p>
        <div role="radiogroup" aria-label="Personnalités débloquées" className="chat__personas">
          {unlockedPersonalities.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={p.id === active.id}
              className={`chat__persona${p.id === active.id ? " chat__persona--active" : ""}`}
              onClick={() => setParams({ avec: p.id === "mana" ? "" : p.id })}
            >
              <span className={`persona-orb persona-orb--${p.theme}`} aria-hidden="true" />
              <span>
                <strong>{p.name}</strong>
                <span className="quiet">{p.epithet}</span>
              </span>
            </button>
          ))}
          {all
            .filter((p) => !isPersonalityUnlocked(p, balance))
            .map((p) => (
              <div key={p.id} className="chat__persona chat__persona--locked">
                <span className="persona-orb persona-orb--locked" aria-hidden="true" />
                <span>
                  <strong>{p.name}</strong>
                  <span className="quiet">
                    🔒 {p.unlock.kind === "mana-points" ? `${p.unlock.threshold} points` : ""}
                  </span>
                </span>
              </div>
            ))}
        </div>
        {!checked ? (
          <p className="tag">Vérification du serveur…</p>
        ) : provider.isLive ? (
          <p className="tag">Mistral · connecté</p>
        ) : (
          <p className="tag">Mode démo local</p>
        )}
      </div>

      <section className="chat__main surface" aria-label={`Conversation avec ${active.name}`}>
        <header className="chat__header">
          <div>
            <h2>{active.name}</h2>
            <p className="quiet">{active.tagline}</p>
          </div>
          {history.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => conversations.clear(active.id)}
            >
              Nouvelle conversation
            </button>
          )}
        </header>

        {checked && !provider.isLive && (
          <div className="chat__demo-notice">
            <strong>Mode démonstration.</strong> Aucun fournisseur d'IA n'est
            configuré : les réponses de {active.name} sont générées par un
            script local, clairement identifiées comme telles. Ajoutez
            MISTRAL_API_KEY dans .env.local pour activer Mistral côté serveur.
          </div>
        )}

        <div className="chat__scroll" ref={listRef} aria-live="polite">
          {history.length === 0 ? (
            <div className="chat__welcome">
              <span className={`persona-orb persona-orb--lg persona-orb--${active.theme}`} aria-hidden="true" />
              <h3>{active.greeting}</h3>
              <p className="muted">
                Écrivez ce qui vous traverse — {active.name} est là pour vous
                écouter.
              </p>
            </div>
          ) : (
            <ol className="chat__messages">
              {history.map((m) => (
                <li
                  key={m.id}
                  className={`chat__msg chat__msg--${m.role === "user" ? "user" : "companion"}`}
                >
                  <span className="visually-hidden">
                    {m.role === "user" ? "Vous : " : `${active.name} : `}
                  </span>
                  {m.text}
                </li>
              ))}
            </ol>
          )}
          {sendState.phase === "loading" && (
            <div className="chat__msg chat__msg--companion chat__msg--pending" aria-label="Réponse en cours">
              <span className="skeleton-line" style={{ width: "60%" }} />
            </div>
          )}
        </div>

        {sendState.phase === "error" && (
          <p className="notice notice--error" role="alert">
            {sendState.message}{" "}
            <button className="btn btn-ghost btn-sm" onClick={() => setSendState({ phase: "idle" })}>
              Réessayer
            </button>
          </p>
        )}

        <form
          className="chat__composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <label htmlFor="chat-input" className="visually-hidden">
            Votre message à {active.name}
          </label>
          <textarea
            id="chat-input"
            className="text-input chat__input"
            placeholder={`Écrire à ${active.name}…`}
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            disabled={sendState.phase === "loading"}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sendState.phase === "loading" || draft.trim().length === 0}
          >
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}
