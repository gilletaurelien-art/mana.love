import type { ChatProvider, ChatCompletionInput, ProviderReply } from "@/domain/chat";
import type { PersonalityConfig } from "@/domain/personalities";
import { detecterDetresse } from "@/domain/detresse";

/**
 * Offline demonstration provider.
 *
 * IMPORTANT: this provider produces clearly-labeled, rule-based responses.
 * It never fakes being a real model. All its replies are marked
 * `isSimulated: true`, and the UI shows the demo mode banner.
 *
 * 🔴 Ce fournisseur ne passe jamais par le serveur (c'est tout son intérêt :
 * aucun backend requis). La détection de détresse de server/chat.ts n'est
 * donc jamais atteinte ici — elle est répétée ci-dessous. Elle doit rester
 * identique dans les deux fournisseurs : le mode démo n'est pas une raison
 * pour qu'un message de crise reste sans réponse.
 */

function buildReply(
  personality: PersonalityConfig,
  userText: string,
  index: number
): string {
  const name = personality.name;
  const gentleOpenings = [
    "Je vous écoute.",
    "Merci de me le dire.",
    "Je suis là.",
  ];
  const opening = gentleOpenings[index % gentleOpenings.length];
  return [
    `${opening} (Mode démo — script local, pas la vraie voix de ${name}.)`,
    "",
    `Vous avez écrit : « ${userText.slice(0, 140)}${userText.length > 140 ? "…" : ""} »`,
    "",
    `Avec sa vraie voix, ${name} serait : ${personality.characterTraits.join(", ")}.`,
  ].join("\n");
}

export const demoChatProvider: ChatProvider = {
  name: "demo",
  isLive: false,
  async complete({ messages, personality }: ChatCompletionInput): Promise<ProviderReply> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userCount = messages.filter((m) => m.role === "user").length;
    await new Promise((r) => setTimeout(r, 450));

    const crise = lastUser ? detecterDetresse(lastUser.text) : null;
    if (crise) {
      return { text: crise.texte, isSimulated: true };
    }

    return {
      text: buildReply(personality, lastUser?.text ?? "", userCount),
      isSimulated: true,
    };
  },
};
