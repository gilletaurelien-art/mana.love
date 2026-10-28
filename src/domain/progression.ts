/**
 * Domain: progression (ludic MANA points) and unlocks.
 *
 * These are game progression points only. They are not money, not
 * cryptocurrency, and are entirely unrelated to Alliance MANA units.
 *
 * Reward rules reward meaningful, varied real-world engagement — never
 * message volume, time on screen, or app-opening frequency.
 */

import type { PersonalityConfig } from "./personalities";

/** Version of the reward rule set; bump when rules change semantics. */
export const REWARD_RULES_VERSION = 1;

export const MANA_POINTS_NAME = "MANA";

/**
 * Domain events eligible for a reward. The list is intentionally small
 * and quality-oriented: each one represents a real-world or discovery action,
 * not an attention metric.
 */
export type RewardableAction =
  | "explore:place-opened" // user opened a place detail in Explore
  | "explore:experience-opened" // user opened an experience detail
  | "explore:place-visited" // user marked a place as visited (self-declared for now)
  | "action:committed" // user committed to a real-world MANA Action
  | "sleep:session-completed" // user completed a wind-down session
  | "radio:listened" // user actively started a listening session (no reward for duration);

export interface RewardRule {
  action: RewardableAction;
  points: number;
  /** Max times this action can be rewarded per rolling day. */
  dailyCap: number;
}

export const REWARD_RULES: readonly RewardRule[] = [
  { action: "explore:place-opened", points: 2, dailyCap: 3 },
  { action: "explore:experience-opened", points: 2, dailyCap: 3 },
  { action: "explore:place-visited", points: 8, dailyCap: 2 },
  { action: "action:committed", points: 10, dailyCap: 1 },
  { action: "sleep:session-completed", points: 6, dailyCap: 1 },
  { action: "radio:listened", points: 3, dailyCap: 1 },
] as const;

export function ruleFor(action: RewardableAction): RewardRule {
  const rule = REWARD_RULES.find((r) => r.action === action);
  if (!rule) throw new Error(`No reward rule for action: ${action}`);
  return rule;
}

/**
 * An immutable ledger entry. Balances are always derived from the ledger,
 * never stored as a client-authoritative number.
 */
export interface RewardEvent {
  /** Unique id; used for idempotency (same id never rewarded twice). */
  id: string;
  action: RewardableAction;
  points: number;
  rulesVersion: number;
  /** ISO-8601 timestamp. */
  awardedAt: string;
  /** Id of the subject (place id, action id, …) for auditability. */
  subjectId?: string;
}

export interface RewardResult {
  status: "granted" | "duplicate" | "capped";
  event?: RewardEvent;
  balance: number;
}

/** Pure function: compute balance from a ledger. */
export function balanceFromLedger(events: readonly RewardEvent[]): number {
  return events.reduce((sum, e) => sum + e.points, 0);
}

/** Pure function: how many times an action was awarded on a given day. */
export function countForDay(
  events: readonly RewardEvent[],
  action: RewardableAction,
  dayIsoDate: string
): number {
  return events.filter(
    (e) => e.action === action && e.awardedAt.slice(0, 10) === dayIsoDate
  ).length;
}

export function isSameDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

/** Pure eligibility check used by both UI and future server logic. */
export function isEligible(
  action: RewardableAction,
  ledger: readonly RewardEvent[],
  event: RewardEvent
): { eligible: boolean; reason: "ok" | "duplicate" | "capped" } {
  if (ledger.some((e) => e.id === event.id)) {
    return { eligible: false, reason: "duplicate" };
  }
  const rule = ruleFor(action);
  const today = event.awardedAt.slice(0, 10);
  if (countForDay(ledger, action, today) >= rule.dailyCap) {
    return { eligible: false, reason: "capped" };
  }
  return { eligible: true, reason: "ok" };
}

export interface UnlockStatus {
  unlocked: boolean;
  /** Points still needed, 0 when unlocked. */
  remaining: number;
}

export function unlockStatusFor(
  personality: PersonalityConfig,
  balance: number
): UnlockStatus {
  if (personality.unlock.kind === "free" || balance >= personality.unlock.threshold) {
    return { unlocked: true, remaining: 0 };
  }
  return {
    unlocked: false,
    remaining: personality.unlock.threshold - balance,
  };
}
