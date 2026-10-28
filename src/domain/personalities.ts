/**
 * Domain: conversation messages and personality contracts.
 * Presentation never manipulates these structures directly;
 * it goes through the conversation service.
 */

export type MessageRole = "user" | "companion";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  /** ISO-8601 timestamp. */
  createdAt: string;
  text: string;
}

export type PersonalityId = string;

export type UnlockRequirement =
  | { kind: "free" }
  | { kind: "mana-points"; threshold: number };

/**
 * A conversational personality. Goddesses are personalities with their own
 * identity, voice and lore. MANA is the always-available central companion.
 */
export interface PersonalityConfig {
  id: PersonalityId;
  /** Version of this personality definition (for future migrations). */
  version: number;
  name: string;
  epithet: string;
  /** Short teaser shown on cards; not shown during conversations. */
  tagline: string;
  /** One-line greeting used as the first companion message. */
  greeting: string;
  /** Fictional lore, clearly distinct from any documented cultural content. */
  lore: string;
  /** Visual identity key within the MANA design system. */
  theme: "mana" | "luna" | "selene" | "thalassa" | "eos";
  /** Base persona used to build the system prompt server-side. */
  characterTraits: string[];
  unlock: UnlockRequirement;
  /** Stable sort order in the pantheon. */
  order: number;
  isFictional: true;
}
