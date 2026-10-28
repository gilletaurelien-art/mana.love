import type { ChatProvider, ChatCompletionInput, ProviderReply } from "@/domain/chat";
import type { PersonalityConfig } from "@/domain/personalities";

/**
 * Offline demonstration provider.
 *
 * IMPORTANT: this provider produces clearly-labeled, rule-based responses.
 * It never fakes being a real model. All its replies are marked
 * `isSimulated: true`, and the UI shows the demo mode banner.
 */

function buildReply(
  personality: PersonalityConfig,
  userText: string,
  index: number
): string {
  const name = personality.name;
  const gentleOpenings = [
    "Je t'écoute.",
    "Merci de me le confier.",
    "C'est noté, doucement.",
  ];
  const opening = gentleOpenings[index % gentleOpenings.length];
  return [
    `${opening} Voici une réponse de démonstration — dans cette version, ${name} est un mode démo local : les réponses viennent d'un petit script, pas d'un modèle d'IA.`,
    "",
    `Tu as écrit : « ${userText.slice(0, 140)}${userText.length > 140 ? "…" : ""} »`,
    "",
    `Quand un fournisseur d'IA sera configuré côté serveur (voir README), ${name} répondra avec sa vraie personnalité : ${personality.characterTraits.join(", ")}.`,
  ].join("\n");
}

export const demoChatProvider: ChatProvider = {
  name: "demo",
  isLive: false,
  async complete({ messages, personality }: ChatCompletionInput): Promise<ProviderReply> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userCount = messages.filter((m) => m.role === "user").length;
    await new Promise((r) => setTimeout(r, 450));
    return {
      text: buildReply(personality, lastUser?.text ?? "", userCount),
      isSimulated: true,
    };
  },
};
