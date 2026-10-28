import type { ChatProvider, ChatCompletionInput, ProviderReply } from "@/domain/chat";
import type { ChatMessage, PersonalityConfig } from "@/domain/personalities";

/**
 * Live provider: calls the server-side AI route.
 *
 * The server holds the provider credentials (e.g. MISTRAL_API_KEY) —
 * the browser never sees them. The server builds the actual system
 * prompt from the personality config, so the personality definition
 * never needs to be trusted from the client.
 */

export interface LiveProviderOptions {
  endpoint: string;
}

export function createLiveChatProvider(
  options: LiveProviderOptions
): ChatProvider {
  return {
    name: "server",
    isLive: true,
    async complete(input: ChatCompletionInput): Promise<ProviderReply> {
      const res = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: input.messages,
          personalityId: input.personality.id,
        }),
      });
      if (!res.ok) {
        throw new Error(`Chat route responded ${res.status}`);
      }
      const data = (await res.json()) as { text?: string; error?: string };
      if (typeof data.text !== "string" || data.text.length === 0) {
        throw new Error(data.error ?? "Réponse invalide du serveur");
      }
      return { text: data.text, isSimulated: false };
    },
  };
}

/** System prompt built server-side from a personality config. */
export function buildSystemPrompt(
  personality: PersonalityConfig
): string {
  const traits = personality.characterTraits.join(", ");
  return [
    `Tu es ${personality.name}, ${personality.epithet}, une compagne conversationnelle dans l'application MANA.love.`,
    `Personnalité : ${traits}.`,
    "Ton : chaleureux, sobre, encourageant ; jamais de jalousie, de culpabilisation ou de pression artificielle.",
    "Tu n'es pas un être surnaturel : tu es une IA. Si l'utilisateur te prête des pouvoirs, redirige doucement.",
    "Objectif : aider l'utilisateur à aimer la vie — encourager des actions concrètes, la découverte du monde réel, le repos.",
  ].join(" ");
}

export type { ChatMessage };
