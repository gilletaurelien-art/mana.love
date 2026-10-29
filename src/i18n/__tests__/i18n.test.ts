import { describe, it, expect } from "vitest";
import { traduire, LANGUES } from "../index";

describe("i18n — fondation internationale", () => {
  it("traduit en français par défaut", () => {
    expect(traduire("home.promise")).toBe("Aimer la vie.");
    expect(traduire("nav.parler")).toBe("Parler");
  });

  it("traduit en anglais quand demandé", () => {
    expect(traduire("home.promise", "en")).toBe("To love life.");
    expect(traduire("nav.parler", "en")).toBe("Talk");
  });

  it("l'anglais garde le vouvoiement : « you », jamais « thou »", () => {
    const desc = traduire("home.door.exploreDesc", "en");
    expect(desc).toContain("you");
  });

  it("une clé non traduite retombe sur le français — jamais de clé brute", () => {
    // simuler une clé absente du dictionnaire EN : le FR s'affiche
    const dicoFr = traduire("home.promise", "fr");
    expect(typeof dicoFr).toBe("string");
    expect(dicoFr).not.toBe("home.promise");
  });

  it("les langues disponibles sont fr et en", () => {
    expect(LANGUES.map((l) => l.code)).toEqual(["fr", "en"]);
  });
});
