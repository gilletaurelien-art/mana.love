import { describe, it, expect } from "vitest";
import { classifierIntention, momentDepuisHeure } from "../intentRouter";

const MIDI = 14; // après-midi, hors ambiguïté matin/soir

describe("classifierIntention — les cas triviaux évitent le modèle", () => {
  it("classe un acquiescement court", () => {
    expect(classifierIntention("ok", MIDI).type).toBe("acquiescement");
    expect(classifierIntention("D'accord", MIDI).type).toBe("acquiescement");
    expect(classifierIntention("Ça marche !", MIDI).type).toBe("acquiescement");
  });

  it("classe une clôture", () => {
    expect(classifierIntention("non merci", MIDI).type).toBe("cloture");
    expect(classifierIntention("Bonne soirée", MIDI).type).toBe("cloture");
  });

  it("classe une salutation, et varie la relance par moment du jour", () => {
    const matin = classifierIntention("Bonjour", 8);
    const soir = classifierIntention("bonjour", 21);
    expect(matin.type).toBe("salutation");
    expect(soir.type).toBe("salutation");
    if (matin.type === "salutation" && soir.type === "salutation") {
      expect(matin.reponseScriptee).not.toBe(soir.reponseScriptee);
    }
  });

  it("est insensible à la casse, aux diacritiques et à la ponctuation finale", () => {
    expect(classifierIntention("SALUT", MIDI).type).toBe("salutation");
    expect(classifierIntention("à bientôt.", MIDI).type).toBe("cloture");
    // "Trés" (faute, è→é) normalise comme "très" : l'insensibilité aux
    // diacritiques ne distingue pas les accents entre eux, volontairement.
    expect(classifierIntention("Trés bien", MIDI).type).toBe("acquiescement");
  });
});

describe("classifierIntention — tout le reste part vers le modèle", () => {
  it("un message substantiel est « intime », même s'il commence par un mot déclencheur", () => {
    const r = classifierIntention(
      "Ok, mais en fait je voulais vous parler d'un souci avec mon travail en ce moment",
      MIDI
    );
    expect(r.type).toBe("intime");
  });

  it("🔴 un message trop long ne se court-circuite JAMAIS, quel que soit son contenu", () => {
    const long = "bonjour " + "x".repeat(40);
    expect(classifierIntention(long, MIDI).type).toBe("intime");
  });

  it("un message vide est « intime » (laisse le reste du flux gérer le cas vide)", () => {
    expect(classifierIntention("", MIDI).type).toBe("intime");
    expect(classifierIntention("   ", MIDI).type).toBe("intime");
  });

  it("une phrase ordinaire, non déclenchante, est « intime »", () => {
    expect(classifierIntention("Quelle est votre couleur préférée ?", MIDI).type).toBe("intime");
  });
});

describe("momentDepuisHeure", () => {
  it("couvre les trois tranches sans trou ni chevauchement, heure par heure", () => {
    for (let h = 0; h < 24; h++) {
      const m = momentDepuisHeure(h);
      expect(["matin", "apres-midi", "soir"]).toContain(m);
    }
    expect(momentDepuisHeure(0)).toBe("soir");
    expect(momentDepuisHeure(5)).toBe("matin");
    expect(momentDepuisHeure(11)).toBe("matin");
    expect(momentDepuisHeure(12)).toBe("apres-midi");
    expect(momentDepuisHeure(17)).toBe("apres-midi");
    expect(momentDepuisHeure(18)).toBe("soir");
    expect(momentDepuisHeure(23)).toBe("soir");
  });
});
