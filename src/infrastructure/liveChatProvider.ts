import type { ChatProvider, ChatCompletionInput, ProviderReply } from "@/domain/chat";

/**
 * Fournisseur live : appelle la route serveur /api/chat.
 *
 * Le serveur détient les identifiants Mistral (MISTRAL_API_KEY) —
 * le navigateur ne les voit jamais. Le serveur reconstruit le prompt
 * système depuis son propre registre de personnalités ; le client
 * n'envoie que l'identifiant de personnalité et l'historique.
 */
export interface LiveProviderOptions {
  endpoint: string;
}

export function createLiveChatProvider(
  options: LiveProviderOptions
): ChatProvider {
  return {
    name: "mistral",
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
      const data = (await res.json().catch(() => null)) as
        | { text?: string; error?: string }
        | null;
      if (!res.ok || !data || typeof data.text !== "string") {
        throw new Error(data?.error ?? `Le serveur a répondu ${res.status}`);
      }
      return { text: data.text, isSimulated: false };
    },
  };
}
