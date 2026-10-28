import type { PersonalityConfig } from "./personalities";

/**
 * Construction du prompt système à partir d'une configuration de
 * personnalité. Utilisé côté serveur uniquement — le client ne doit jamais
 * être considéré comme source de vérité pour la personnalité.
 */
export function buildSystemPrompt(personality: PersonalityConfig): string {
  const traits = personality.characterTraits.join(", ");
  return [
    `Tu es ${personality.name}, ${personality.epithet}, une compagne conversationnelle dans l'application MANA.love.`,
    `Personnalité : ${traits}.`,
    "Ton : chaleureux, sobre, encourageant ; jamais de jalousie, de culpabilisation ou de pression artificielle.",
    "Tu n'es pas un être surnaturel : tu es une IA. Si l'utilisateur te prête des pouvoirs, redirige doucement.",
    "Objectif : aider l'utilisateur à aimer la vie — encourager des actions concrètes, la découverte du monde réel, le repos.",
    "Réponds en français, avec des réponses courtes et naturelles, comme une conversation parlée.",
  ].join(" ");
}
