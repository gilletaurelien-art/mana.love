import { describe, it, expect } from "vitest";
import {
  longitudeSoleil,
  longitudePlanete,
  longitudeLune,
  signeDepuisLongitude,
  themeAstral,
} from "../themeAstral";

/**
 * 🔴 VÉRIFIÉ PAR DES PROPRIÉTÉS PHYSIQUES, PAS PAR UNE ÉPHÉMÉRIDE
 * EXTERNE CONSULTÉE CETTE SESSION. Voir l'en-tête de themeAstral.ts.
 */

describe("longitudeSoleil — invariant des équinoxes et solstices", () => {
  // Dates calendaires approximatives (±1 jour de l'exactitude réelle,
  // qui varie légèrement d'une année à l'autre) — la longitude du
  // Soleil change d'environ 1°/jour, donc une tolérance de 3° absorbe
  // cette imprécision de date sans masquer une vraie erreur de calcul.
  it.each([
    { date: "2026-03-20T00:00:00Z", attendu: 0, nom: "équinoxe de printemps → Bélier 0°" },
    { date: "2026-06-21T00:00:00Z", attendu: 90, nom: "solstice d'été → Cancer 0°" },
    { date: "2026-09-23T00:00:00Z", attendu: 180, nom: "équinoxe d'automne → Balance 0°" },
    { date: "2026-12-21T00:00:00Z", attendu: 270, nom: "solstice d'hiver → Capricorne 0°" },
  ])("$nom", ({ date, attendu }) => {
    const lon = longitudeSoleil(new Date(date));
    const diff = Math.min(Math.abs(lon - attendu), 360 - Math.abs(lon - attendu));
    expect(diff).toBeLessThan(3);
  });
});

describe("longitudePlanete — élongation maximale de Mercure et Vénus", () => {
  /**
   * 🔴 Mercure et Vénus, planètes inférieures (orbite à l'intérieur de
   * celle de la Terre), ne peuvent JAMAIS s'écarter du Soleil au-delà
   * d'une élongation maximale fixe — une conséquence géométrique directe
   * de leur orbite, pas une coïncidence. Testé sur toute une année,
   * tous les 10 jours : si le calcul des positions est faux, cette borne
   * serait violée au moins une fois.
   */
  it("Mercure reste à moins de 28° d'élongation du Soleil, toute l'année", () => {
    for (let j = 0; j < 365; j += 10) {
      const date = new Date(Date.UTC(2026, 0, 1) + j * 24 * 60 * 60 * 1000);
      const soleil = longitudeSoleil(date);
      const mercure = longitudePlanete("mercure", date);
      const diff = Math.min(Math.abs(mercure - soleil), 360 - Math.abs(mercure - soleil));
      expect(diff).toBeLessThan(28);
    }
  });

  it("Vénus reste à moins de 48° d'élongation du Soleil, toute l'année", () => {
    for (let j = 0; j < 365; j += 10) {
      const date = new Date(Date.UTC(2026, 0, 1) + j * 24 * 60 * 60 * 1000);
      const soleil = longitudeSoleil(date);
      const venus = longitudePlanete("venus", date);
      const diff = Math.min(Math.abs(venus - soleil), 360 - Math.abs(venus - soleil));
      expect(diff).toBeLessThan(48);
    }
  });

  it("🔴 contrôle : Mars n'a PAS d'élongation maximale — il peut être à l'opposé exact du Soleil", () => {
    // Planète supérieure : à l'opposition, élongation ≈ 180°. Si la borne
    // de Mercure/Vénus s'appliquait par erreur à toutes les planètes, ce
    // test l'attraperait.
    let maxDiff = 0;
    for (let j = 0; j < 365 * 2; j += 10) {
      const date = new Date(Date.UTC(2026, 0, 1) + j * 24 * 60 * 60 * 1000);
      const soleil = longitudeSoleil(date);
      const mars = longitudePlanete("mars", date);
      const diff = Math.min(Math.abs(mars - soleil), 360 - Math.abs(mars - soleil));
      maxDiff = Math.max(maxDiff, diff);
    }
    expect(maxDiff).toBeGreaterThan(48);
  });
});

describe("longitudeLune", () => {
  it("reste dans [0, 360) et change significativement sur une semaine (~13°/jour)", () => {
    const d1 = new Date("2026-05-01T00:00:00Z");
    const d2 = new Date("2026-05-08T00:00:00Z");
    const l1 = longitudeLune(d1);
    const l2 = longitudeLune(d2);
    expect(l1).toBeGreaterThanOrEqual(0);
    expect(l1).toBeLessThan(360);
    const diff = Math.min(Math.abs(l2 - l1), 360 - Math.abs(l2 - l1));
    expect(diff).toBeGreaterThan(60); // ~13°/j × 7j ≈ 91°, large marge
  });
});

describe("signeDepuisLongitude", () => {
  it("🔴 0° = Bélier, et chaque tranche de 30° est le signe suivant, dans l'ordre", () => {
    const ordre = [
      "belier",
      "taureau",
      "gemeaux",
      "cancer",
      "lion",
      "vierge",
      "balance",
      "scorpion",
      "sagittaire",
      "capricorne",
      "verseau",
      "poissons",
    ];
    ordre.forEach((signe, i) => {
      expect(signeDepuisLongitude(i * 30 + 1)).toBe(signe);
    });
  });

  it("une longitude juste avant 30° reste dans le signe précédent", () => {
    expect(signeDepuisLongitude(29.9)).toBe("belier");
    expect(signeDepuisLongitude(30.1)).toBe("taureau");
  });

  it("360° se ramène à 0° (Bélier), pas une erreur d'index", () => {
    expect(signeDepuisLongitude(360)).toBe("belier");
    expect(signeDepuisLongitude(725)).toBe(signeDepuisLongitude(5));
  });
});

describe("themeAstral", () => {
  it("rend les 7 astres classiques, chacun avec un signe et un degré valides", () => {
    const theme = themeAstral(new Date("2026-07-14T12:00:00Z"));
    expect(theme).toHaveLength(7);
    const corps = theme.map((p) => p.corps);
    expect(corps).toEqual(["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"]);
    for (const p of theme) {
      expect(p.degreDansSigne).toBeGreaterThanOrEqual(0);
      expect(p.degreDansSigne).toBeLessThan(30);
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
    }
  });
});
