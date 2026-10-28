import { useEffect, useState } from "react";
import type { RewardEvent, RewardableAction } from "@/domain/progression";
import {
  balanceFromLedger,
  isEligible,
  ruleFor,
  REWARD_RULES_VERSION,
} from "@/domain/progression";
import type { ChatMessage, PersonalityId } from "@/domain/personalities";
import type { Place, Experience } from "@/domain/exploration";
import { SAMPLE_PLACES, SAMPLE_EXPERIENCES } from "@/infrastructure/sampleExploreData";

/**
 * Local persistence adapter. In this first version the browser's
 * localStorage is the only available storage, so it plays the role of a
 * (non-authoritative) client-side cache of the progression ledger and
 * conversation history. A future backend should own the authoritative
 * ledger server-side.
 */

const KEYS = {
  ledger: "mana.love.ledger.v1",
  balance: "mana.love.balance.v1",
  visited: "mana.love.visited.v1",
  conversations: "mana.love.conversations.v1",
  lastExploreRoute: "mana.love.explore.lastRoute.v1",
} as const;

export interface Conversation {
  personalityId: PersonalityId;
  messages: ChatMessage[];
  updatedAt: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — degradation is acceptable
  }
}

/** ---------------- Progression ledger ---------------- */

export function useLedger() {
  const [events, setEvents] = useState<RewardEvent[]>(() =>
    read<RewardEvent[]>(KEYS.ledger, [])
  );
  const balance = balanceFromLedger(events);

  useEffect(() => {
    write(KEYS.ledger, events);
  }, [events]);

  /**
   * Attempts to add a reward event with idempotency + daily caps.
   * Returns the outcome so callers can reflect it honestly in the UI.
   */
  function reward(
    action: RewardableAction,
    eventId: string,
    subjectId?: string
  ): { ok: boolean; reason: "granted" | "duplicate" | "capped"; balance: number } {
    const rule = ruleFor(action);
    const event: RewardEvent = {
      id: eventId,
      action,
      points: rule.points,
      rulesVersion: REWARD_RULES_VERSION,
      awardedAt: new Date().toISOString(),
      subjectId,
    };
    const check = isEligible(action, events, event);
    if (!check.eligible) {
      return { ok: false, reason: check.reason as "duplicate" | "capped", balance };
    }
    setEvents((prev) => [...prev, event]);
    return { ok: true, reason: "granted", balance: balance + rule.points };
  }

  return { events, balance, reward };
}

export function useVisitedPlaces() {
  const [visited, setVisited] = useState<string[]>(() =>
    read<string[]>(KEYS.visited, [])
  );
  useEffect(() => {
    write(KEYS.visited, visited);
  }, [visited]);
  return {
    visited,
    toggleVisited(id: string) {
      setVisited((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
    },
  };
}

/** ---------------- Conversations ---------------- */

type ConversationMap = Record<PersonalityId, Conversation>;

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationMap>(() =>
    read<ConversationMap>(KEYS.conversations, {})
  );

  useEffect(() => {
    write(KEYS.conversations, conversations);
  }, [conversations]);

  return {
    conversations,
    get(personalityId: PersonalityId): ChatMessage[] {
      return conversations[personalityId]?.messages ?? [];
    },
    append(personalityId: PersonalityId, message: ChatMessage) {
      setConversations((prev) => {
        const existing = prev[personalityId];
        const messages = existing ? [...existing.messages, message] : [message];
        return {
          ...prev,
          [personalityId]: {
            personalityId,
            messages,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    clear(personalityId: PersonalityId) {
      setConversations((prev) => {
        const next = { ...prev };
        delete next[personalityId];
        return next;
      });
    },
  };
}

/** ---------------- Explore ---------------- */

export interface ExploreData {
  places: readonly Place[];
  experiences: readonly Experience[];
}

export function useExploreData(): { data: ExploreData; loading: boolean } {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExploreData>({
    places: [],
    experiences: [],
  });

  useEffect(() => {
    // Simulates an async fetch boundary for future real services.
    const t = setTimeout(() => {
      setData({ places: SAMPLE_PLACES, experiences: SAMPLE_EXPERIENCES });
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  return { data, loading };
}
