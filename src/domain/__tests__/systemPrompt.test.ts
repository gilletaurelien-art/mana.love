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

  /* 🔴 GARDE AJOUTÉ LE 3/11/2026 : avant ce test, le vouvoiement par défaut
     (systemPrompt.ts) n'était tenu par AUCUN test — on pouvait supprimer
     la ligne entière, les autres tests restaient verts. C'est le garde-fou
     le plus direct contre le glissement vers un ton plus intime que décidé :
     il doit être visible dans toute revue qui y touche. */
  it("🔴 impose le vouvoiement par défaut, et dit que ce n'est pas au modèle de le changer", () => {
    for (const p of PERSONALITIES) {
      const prompt = buildSystemPrompt(p);
      expect(prompt).toContain("vouvoiement par défaut");
      expect(prompt).toContain("jamais tu ne le décides");
    }
  });

  it("answers in French and encourages real-life action", () => {
    const prompt = buildSystemPrompt(PERSONALITIES[0]);
    expect(prompt).toContain("français");
    expect(prompt).toContain("aimer la vie");
  });
});
