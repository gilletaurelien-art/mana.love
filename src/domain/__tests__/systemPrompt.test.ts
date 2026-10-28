import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../systemPrompt";
import { PERSONALITIES, getPersonality } from "../personalityRegistry";

describe("system prompt construction", () => {
  it("builds a persona prompt for MANA with safety rules", () => {
    const mana = getPersonality("mana")!;
    const prompt = buildSystemPrompt(mana);
    expect(prompt).toContain("Tu es MANA");
    expect(prompt).toContain("jamais de jalousie");
    expect(prompt).toContain("tu es une IA");
  });

  it("uses the personality's own traits for each goddess", () => {
    for (const p of PERSONALITIES) {
      const prompt = buildSystemPrompt(p);
      expect(prompt).toContain(`Tu es ${p.name}`);
      expect(prompt).toContain(p.characterTraits.join(", "));
    }
  });

  it("answers in French and encourages real-life action", () => {
    const prompt = buildSystemPrompt(PERSONALITIES[0]);
    expect(prompt).toContain("français");
    expect(prompt).toContain("aimer la vie");
  });
});
