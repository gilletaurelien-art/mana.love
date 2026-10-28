import { useEffect, useState } from "react";
import type { RewardEvent, RewardableAction } from "@/domain/progression";
import {
  balanceFromLedger,
  isEligible,
  ruleFor,
  REWARD_RULES_VERSION,
} from "@/domain/progression";
import type { ChatMessage, PersonalityId } from "@/domain/personalities";
import type { Coordinates, Place, Experience } from "@/domain/exploration";
import { SAMPLE_PLACES, SAMPLE_EXPERIENCES } from "@/infrastructure/sampleExploreData";
import { osmGeoService } from "@/infrastructure/osmExploreService";

/**
 * Persistance locale. localStorage joue le rôle de cache client
 * (non-autoritaire) pour le registre de progression, l'historique de
 * conversations et les données d'exploration.
 */

const KEYS = {
  ledger: "mana.love.ledger.v1",
  visited: "mana.love.visited.v1",
  conversations: "mana.love.conversations.v1",
  lastCoords: "mana.love.explore.coords.v1",
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
    // stockage plein ou indisponible — dégradation acceptable
  }
}

/** ---------------- Registre de progression ---------------- */

export function useLedger() {
  const [events, setEvents] = useState<RewardEvent[]>(() =>
    read<RewardEvent[]>(KEYS.ledger, [])
  );
  const balance = balanceFromLedger(events);

  useEffect(() => {
    write(KEYS.ledger, events);
  }, [events]);

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

/** ---------------- Exploration ---------------- */

export type ExploreSource = "openstreetmap" | "sample";

export interface ExploreData {
  places: readonly Place[];
  experiences: readonly Experience[];
  source: ExploreSource;
  locality: string | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_DATA: ExploreData = {
  places: [],
  experiences: [],
  source: "sample",
  locality: null,
  loading: true,
  error: null,
};

/**
 * Récupère des lieux réels autour de l'utilisateur (OSM) ; bascule
 * explicitement sur les données de démonstration en cas d'absence de
 * géolocalisation ou d'échec — toujours clairement étiqueté.
 */
export function useExploreData(): ExploreData & {
  useRealLocation: () => void;
  realLocation: boolean;
} {
  const [data, setData] = useState<ExploreData>(EMPTY_DATA);
  const [realLocation, setRealLocation] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!requested) {
      // Tant que l'utilisateur n'a pas demandé la géolocalisation :
      // données de démonstration, sans appel réseau.
      const t = setTimeout(() => {
        setData({
          places: SAMPLE_PLACES,
          experiences: SAMPLE_EXPERIENCES,
          source: "sample",
          locality: null,
          loading: false,
          error: null,
        });
      }, 200);
      return () => clearTimeout(t);
    }
  }, [requested]);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;

    function load(coords: Coordinates) {
      write(KEYS.lastCoords, coords);
      Promise.all([
        osmGeoService.nearbyPlaces(coords),
        osmGeoService.reverseGeocode(coords),
      ])
        .then(([places, locality]) => {
          if (cancelled) return;
          setData({
            places,
            experiences: SAMPLE_EXPERIENCES,
            source: "openstreetmap",
            locality,
            loading: false,
            error: null,
          });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setData({
            places: SAMPLE_PLACES,
            experiences: SAMPLE_EXPERIENCES,
            source: "sample",
            locality: null,
            loading: false,
            error:
              err instanceof Error
                ? `Lieux réels indisponibles : ${err.message}`
                : "Lieux réels indisponibles.",
          });
        });
    }

    const start = () =>
      navigator.geolocation.getCurrentPosition(
      (pos) =>
        load({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (cancelled) return;
        setData({
          places: SAMPLE_PLACES,
          experiences: SAMPLE_EXPERIENCES,
          source: "sample",
          locality: null,
          loading: false,
          error: `Géolocalisation refusée ou indisponible (${err.message}). Contenu de démonstration affiché.`,
        });
      },
        { timeout: 10_000, maximumAge: 300_000 }
      );

    Promise.resolve().then(() => {
      if (cancelled) return;
      setData((d) => ({ ...d, loading: true, error: null }));
      start();
    });

    return () => {
      cancelled = true;
    };
  }, [requested]);

  return {
    ...data,
    realLocation,
    useRealLocation: () => {
      if (typeof navigator !== "undefined" && !navigator.geolocation) {
        setData({
          ...EMPTY_DATA,
          loading: false,
          error: "La géolocalisation n'est pas disponible sur cet appareil.",
        });
        return;
      }
      setRealLocation(true);
      setRequested(true);
    },
  };
}
