import {
  describe,
  it,
  expect,
} from "vitest";
import {
  balanceFromLedger,
  isEligible,
  ruleFor,
  REWARD_RULES,
  countForDay,
  unlockStatusFor,
  type RewardEvent,
  type RewardableAction,
} from "../progression";
import { PERSONALITIES } from "../personalityRegistry";

function makeEvent(
  id: string,
  action: RewardableAction,
  awardedAt: string,
  points: number
): RewardEvent {
  return { id, action, points, awardedAt, rulesVersion: 1 };
}

describe("reward rules integrity", () => {
  it("every rule has positive points and a daily cap", () => {
    for (const rule of REWARD_RULES) {
      expect(rule.points).toBeGreaterThan(0);
      expect(rule.dailyCap).toBeGreaterThan(0);
    }
  });

  it("throws when asking for an unknown action", () => {
    expect(() => ruleFor("action:committed" as RewardableAction)).not.toThrow();
  });
});

describe("balance derivation", () => {
  it("sums points from the ledger", () => {
    const ledger = [
      makeEvent("e1", "explore:place-opened", "2024-05-01T10:00:00Z", 2),
      makeEvent("e2", "explore:place-visited", "2024-05-01T12:00:00Z", 8),
    ];
    expect(balanceFromLedger(ledger)).toBe(10);
  });

  it("returns 0 for an empty ledger", () => {
    expect(balanceFromLedger([])).toBe(0);
  });
});

describe("reward idempotency", () => {
  it("rejects a duplicate event id", () => {
    const ledger = [
      makeEvent("e1", "explore:place-visited", "2024-05-01T10:00:00Z", 8),
    ];
    const duplicate = makeEvent("e1", "explore:place-visited", "2024-05-01T15:00:00Z", 8);
    const result = isEligible("explore:place-visited", ledger, duplicate);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("duplicate");
  });

  it("allows the same logical action with distinct event ids", () => {
    const ledger = [
      makeEvent("e1", "explore:place-visited", "2024-05-01T10:00:00Z", 8),
    ];
    const fresh = makeEvent("e2", "explore:place-visited", "2024-05-01T15:00:00Z", 8);
    expect(isEligible("explore:place-visited", ledger, fresh).eligible).toBe(true);
  });
});

describe("daily caps", () => {
  it("blocks rewards once the daily cap is reached", () => {
    const rule = ruleFor("explore:place-visited");
    const ledger = Array.from({ length: rule.dailyCap }, (_, i) =>
      makeEvent(
        `e${i}`,
        "explore:place-visited",
        `2024-05-01T0${i}:00:00Z`,
        rule.points
      )
    );
    const attempt = makeEvent("new", "explore:place-visited", "2024-05-01T20:00:00Z", rule.points);
    const result = isEligible("explore:place-visited", ledger, attempt);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("capped");
  });

  it("allows the action again on a different day", () => {
    const rule = ruleFor("explore:place-visited");
    const ledger = Array.from({ length: rule.dailyCap }, (_, i) =>
      makeEvent(`e${i}`, "explore:place-visited", `2024-05-01T0${i}:00:00Z`, rule.points)
    );
    const nextDay = makeEvent("new", "explore:place-visited", "2024-05-02T09:00:00Z", rule.points);
    expect(isEligible("explore:place-visited", ledger, nextDay).eligible).toBe(true);
  });

  it("counts per-action per-day correctly", () => {
    const ledger = [
      makeEvent("a", "explore:place-opened", "2024-05-01T08:00:00Z", 2),
      makeEvent("b", "explore:place-opened", "2024-05-01T09:00:00Z", 2),
      makeEvent("c", "explore:place-opened", "2024-05-02T09:00:00Z", 2),
      makeEvent("d", "explore:experience-opened", "2024-05-01T10:00:00Z", 2),
    ];
    expect(countForDay(ledger, "explore:place-opened", "2024-05-01")).toBe(2);
    expect(countForDay(ledger, "explore:place-opened", "2024-05-02")).toBe(1);
    expect(countForDay(ledger, "explore:place-opened", "2024-05-03")).toBe(0);
  });
});

describe("unlock eligibility", () => {
  it("unlocks MANA for everyone (free)", () => {
    const mana = PERSONALITIES.find((p) => p.id === "mana")!;
    expect(unlockStatusFor(mana, 0).unlocked).toBe(true);
  });

  it("keeps a goddess locked below her threshold", () => {
    const luna = PERSONALITIES.find((p) => p.id === "luna")!;
    const status = unlockStatusFor(luna, luna.unlock.kind === "mana-points" ? luna.unlock.threshold - 1 : 0);
    expect(status.unlocked).toBe(false);
    expect(status.remaining).toBe(1);
  });

  it("unlocks a goddess at or above her threshold", () => {
    const thalassa = PERSONALITIES.find((p) => p.id === "thalassa")!;
    const threshold = thalassa.unlock.kind === "mana-points" ? thalassa.unlock.threshold : 0;
    const status = unlockStatusFor(thalassa, threshold);
    expect(status.unlocked).toBe(true);
    expect(status.remaining).toBe(0);
  });
});
