import { describe, it, expect } from "vitest";
import { phaseLunaire } from "../lune";

const JOUR_MS = 24 * 60 * 60 * 1000;
const PERIODE_SYNODIQUE_JOURS = 29.530588861;

describe("phaseLunaire — cohérence physique (pas une date de référence à croire sur parole)", () => {
  it("🔴 la phase se répète exactement une période synodique plus tard", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    const unCycleApres = new Date(date.getTime() + PERIODE_SYNODIQUE_JOURS * JOUR_MS);
    const a = phaseLunaire(date);
    const b = phaseLunaire(unCycleApres);
    expect(b.fractionCycle).toBeCloseTo(a.fractionCycle, 5);
    expect(b.illumination).toBeCloseTo(a.illumination, 5);
    expect(b.id).toBe(a.id);
  });

  it("l'illumination est nulle à la nouvelle lune (fractionCycle ≈ 0)", () => {
    // La date de référence EST une nouvelle lune par construction.
    const p = phaseLunaire(new Date(Date.UTC(2000, 0, 6, 18, 14, 0)));
    expect(p.fractionCycle).toBeCloseTo(0, 5);
    expect(p.illumination).toBeCloseTo(0, 5);
    expect(p.id).toBe("nouvelle");
  });

  it("l'illumination est maximale à la pleine lune (une demi-période plus tard)", () => {
    const demiPeriode = (PERIODE_SYNODIQUE_JOURS / 2) * JOUR_MS;
    const p = phaseLunaire(new Date(Date.UTC(2000, 0, 6, 18, 14, 0) + demiPeriode));
    expect(p.fractionCycle).toBeCloseTo(0.5, 2);
    expect(p.illumination).toBeCloseTo(1, 2);
    expect(p.id).toBe("pleine");
  });

  it("🔴 symétrie : le croissant montant à J jours a la même illumination que le croissant descendant à J jours de l'autre côté de la pleine lune", () => {
    const epoque = Date.UTC(2000, 0, 6, 18, 14, 0);
    const sept = phaseLunaire(new Date(epoque + 7 * JOUR_MS));
    const vingtDeux = phaseLunaire(new Date(epoque + (PERIODE_SYNODIQUE_JOURS - 7) * JOUR_MS));
    expect(sept.illumination).toBeCloseTo(vingtDeux.illumination, 3);
    expect(sept.croissante).toBe(true);
    expect(vingtDeux.croissante).toBe(false);
  });

  it("croissante est vrai de la nouvelle lune à la pleine lune, faux ensuite", () => {
    const epoque = Date.UTC(2000, 0, 6, 18, 14, 0);
    expect(phaseLunaire(new Date(epoque + 1 * JOUR_MS)).croissante).toBe(true);
    expect(phaseLunaire(new Date(epoque + 20 * JOUR_MS)).croissante).toBe(false);
  });

  it("l'illumination reste dans [0, 1] sur tout le cycle", () => {
    const epoque = Date.UTC(2000, 0, 6, 18, 14, 0);
    for (let j = 0; j < 30; j += 1) {
      const p = phaseLunaire(new Date(epoque + j * JOUR_MS));
      expect(p.illumination).toBeGreaterThanOrEqual(0);
      expect(p.illumination).toBeLessThanOrEqual(1);
    }
  });

  it("🔴 les 8 phases traditionnelles apparaissent dans l'ordre sur un cycle complet", () => {
    const epoque = Date.UTC(2000, 0, 6, 18, 14, 0);
    const ordreAttendu = [
      "nouvelle",
      "premier-croissant",
      "premier-quartier",
      "gibbeuse-croissante",
      "pleine",
      "gibbeuse-decroissante",
      "dernier-quartier",
      "dernier-croissant",
    ];
    const ids = ordreAttendu.map((_, i) => {
      const fraction = i / 8;
      return phaseLunaire(new Date(epoque + fraction * PERIODE_SYNODIQUE_JOURS * JOUR_MS)).id;
    });
    expect(ids).toEqual(ordreAttendu);
  });
});
