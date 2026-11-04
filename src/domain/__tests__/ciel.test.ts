import { describe, it, expect } from "vitest";
import {
  positionHorizon,
  projeterSurDome,
  etoilesVisibles,
  tempsSideralLocal,
  type Etoile,
} from "../ciel";

/**
 * 🔴 L'INVARIANT VÉRIFIABLE SANS TABLE EXTERNE : pour un observateur dans
 * l'hémisphère nord, une étoile de déclinaison ≈ 90° (quasi au pôle
 * céleste nord — comme Polaris, dec ≈ 89.26°) a une ALTITUDE ≈ LATITUDE
 * de l'observateur, à N'IMPORTE QUELLE heure. C'est de la géométrie pure
 * (l'axe de rotation de la Terre pointe vers le pôle céleste), pas une
 * valeur mesurée qu'il faudrait croire sur parole — et ça couvre
 * plusieurs latitudes et plusieurs heures d'un coup, sans dépendre d'un
 * almanach.
 */
describe("positionHorizon — invariant du pôle céleste", () => {
  const polaris: Pick<Etoile, "ra" | "dec"> = { ra: 37.95, dec: 89.26 };

  it.each([
    { latitude: 48.8, heure: "2026-01-01T00:00:00Z" }, // Paris, minuit
    { latitude: 48.8, heure: "2026-06-15T12:00:00Z" }, // Paris, midi (sous l'horizon visuellement, mais le calcul tient)
    { latitude: 60, heure: "2026-03-20T18:30:00Z" },
    { latitude: 10, heure: "2026-11-04T06:00:00Z" },
  ])("altitude ≈ latitude ($latitude°) à $heure, quelle que soit l'heure", ({ latitude, heure }) => {
    const pos = positionHorizon(polaris, { latitude, longitude: 2.35 }, new Date(heure));
    expect(pos.altitude).toBeCloseTo(latitude, 0); // à 0.5° près (Polaris n'est pas exactement au pôle)
  });
});

describe("positionHorizon — bornes et cohérence", () => {
  it("l'altitude reste dans [-90, 90] et l'azimut dans [0, 360)", () => {
    const etoile = { ra: 101.2872, dec: -16.7161 }; // Sirius, vérifiée contre le HIP catalogue
    const pos = positionHorizon(etoile, { latitude: 43, longitude: 5 }, new Date("2026-01-15T22:00:00Z"));
    expect(pos.altitude).toBeGreaterThanOrEqual(-90);
    expect(pos.altitude).toBeLessThanOrEqual(90);
    expect(pos.azimut).toBeGreaterThanOrEqual(0);
    expect(pos.azimut).toBeLessThan(360);
  });

  it("🔴 l'azimut à l'est du méridien et à l'ouest sont symétriques (somme ≈ 360°) — lève l'ambiguïté de acos()", () => {
    // Même déclinaison, de part et d'autre du méridien (angle horaire ±3h) :
    // géométriquement, les deux azimuts doivent être le miroir l'un de
    // l'autre par rapport à l'axe nord-sud. acos() seul rendrait la MÊME
    // valeur des deux côtés — c'est exactement le défaut que la correction
    // de signe (Duffett-Smith) répare.
    const date = new Date("2026-05-01T20:00:00Z");
    const longitude = 3;
    const lst = tempsSideralLocal(date, longitude);
    const dec = 20;
    const lieu = { latitude: 45, longitude };
    // angleHoraire = LST - ra : ra = lst - 45 donne H = +45° (après le méridien, à
    // l'ouest) ; ra = lst + 45 donne H = -45° (avant le méridien, à l'est).
    const ouest = positionHorizon({ ra: (lst - 45 + 360) % 360, dec }, lieu, date);
    const est = positionHorizon({ ra: (lst + 45) % 360, dec }, lieu, date);
    expect((est.azimut + ouest.azimut) % 360).toBeCloseTo(0, 1);
    expect(est.azimut).toBeLessThan(180);
    expect(ouest.azimut).toBeGreaterThan(180);
  });

  it("🔴 une étoile au zénith (dec = latitude, angle horaire nul) a une altitude de 90°", () => {
    // Construire un instant où le temps sidéral local vaut exactement la RA choisie.
    const date = new Date("2026-05-01T20:00:00Z");
    const longitude = 3;
    const ra = tempsSideralLocal(date, longitude);
    const latitude = 45;
    const pos = positionHorizon({ ra, dec: latitude }, { latitude, longitude }, date);
    expect(pos.altitude).toBeCloseTo(90, 1);
  });
});

describe("projeterSurDome", () => {
  it("le zénith (altitude 90°) se projette au centre", () => {
    const p = projeterSurDome({ altitude: 90, azimut: 123 }, 200);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(0, 5);
    expect(p!.y).toBeCloseTo(0, 5);
  });

  it("l'horizon (altitude 0°) se projette exactement sur le bord du dôme", () => {
    const p = projeterSurDome({ altitude: 0, azimut: 90 }, 200);
    expect(p).not.toBeNull();
    expect(Math.hypot(p!.x, p!.y)).toBeCloseTo(200, 5);
  });

  it("🔴 une altitude négative (sous l'horizon) ne se projette PAS — null, pas un point faux", () => {
    expect(projeterSurDome({ altitude: -5, azimut: 0 }, 200)).toBeNull();
  });

  it("nord (azimut 0) est en haut (y négatif, x nul)", () => {
    const p = projeterSurDome({ altitude: 0, azimut: 0 }, 200)!;
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeLessThan(0);
  });

  it("est (azimut 90) est à droite (x positif, y nul)", () => {
    const p = projeterSurDome({ altitude: 0, azimut: 90 }, 200)!;
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBeCloseTo(0, 5);
  });
});

describe("etoilesVisibles", () => {
  it("ne garde que les étoiles au-dessus de l'horizon, et leur attache altitude/azimut", () => {
    const polaris: Etoile = { id: 1, mag: 1.98, ra: 37.95, dec: 89.26 };
    // Une étoile de déclinaison très négative, invisible depuis l'hémisphère nord.
    const austral: Etoile = { id: 2, mag: 1, ra: 37.95, dec: -85 };
    const visibles = etoilesVisibles([polaris, austral], { latitude: 48.8, longitude: 2.35 }, new Date());
    const ids = visibles.map((e) => e.id);
    expect(ids).toContain(1);
    expect(ids).not.toContain(2);
    const p = visibles.find((e) => e.id === 1)!;
    expect(typeof p.altitude).toBe("number");
    expect(typeof p.azimut).toBe("number");
  });
});
