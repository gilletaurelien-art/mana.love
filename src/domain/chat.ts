/**
 * Domain: AI conversation provider contract.
 *
 * The UI only ever talks to this interface. Real implementations call a
 * server-side route (never exposing API keys); a demo implementation
 * provides clearly-identified offline responses.
 */

import type { ChatMessage, PersonalityConfig } from "./personalities";

export type ConversationKind = "mana" | "goddess";

export interface SendContext {
  personality: PersonalityConfig;
  kind: ConversationKind;
  history: readonly ChatMessage[];
  userText: string;
}

export interface ProviderReply {
  text: string;
  /** True when the reply came from a real model; false in demo mode. */
  isSimulated: boolean;
}

export interface ChatCompletionInput {
  messages: readonly ChatMessage[];
  personality: PersonalityConfig;
}

export interface ChatProvider {
  readonly name: string;
  readonly isLive: boolean;
  complete(input: ChatCompletionInput): Promise<ProviderReply>;
}
