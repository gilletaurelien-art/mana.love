import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLedger, useVisitedPlaces, useConversations } from "@/infrastructure/persistence";
import { sortedPersonalities } from "@/domain/personalityRegistry";
import { unlockStatusFor, type RewardEvent, type RewardableAction } from "@/domain/progression";
import type { PersonalityConfig } from "@/domain/personalities";

export type RewardOutcome = {
  ok: boolean;
  reason: "granted" | "duplicate" | "capped";
  balance: number;
};

export interface ProgressionContextValue {
  balance: number;
  events: RewardEvent[];
  reward: (action: RewardableAction, eventId: string, subjectId?: string) => RewardOutcome;
  visited: string[];
  toggleVisited: (id: string) => void;
  conversations: ReturnType<typeof useConversations>;
  unlockedPersonalities: PersonalityConfig[];
  lockedPersonalities: PersonalityConfig[];
  isUnlocked: (p: PersonalityConfig) => boolean;
}

const ProgressionContext = createContext<ProgressionContextValue | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const { events, balance, reward } = useLedger();
  const { visited, toggleVisited } = useVisitedPlaces();
  const conversations = useConversations();

  const value = useMemo<ProgressionContextValue>(() => {
    const all = sortedPersonalities();
    const unlocked = all.filter((p) => unlockStatusFor(p, balance).unlocked);
    const locked = all.filter((p) => !unlockStatusFor(p, balance).unlocked);
    return {
      balance,
      events,
      reward,
      visited,
      toggleVisited,
      conversations,
      unlockedPersonalities: unlocked,
      lockedPersonalities: locked,
      isUnlocked: (p) => unlockStatusFor(p, balance).unlocked,
    };
  }, [events, balance, reward, visited, toggleVisited, conversations]);

  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression(): ProgressionContextValue {
  const ctx = useContext(ProgressionContext);
  if (!ctx) throw new Error("useProgression must be used within ProgressionProvider");
  return ctx;
}
