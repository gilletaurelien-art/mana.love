import { describe, it, expect } from "vitest";
import { meilleureFenetre, decrireFenetre, SEUIL_PLUIE_POURCENT } from "../meteo";
import type { PointMeteo } from "../meteo";

function point(heureISO: string, probabilitePluie: number, temperatureC = 15): PointMeteo {
  return { heureISO, probabilitePluie, temperatureC };
}

describe("meilleureFenetre", () => {
  it("choisit l'heure la plus sèche dans l'horizon", () => {
    const points = [
      point("2026-11-03T14:00", 60),
      point("2026-11-03T15:00", 10),
      point("2026-11-03T16:00", 40),
    ];
    const fenetre = meilleureFenetre(points, "2026-11-03T13:00");
    expect(fenetre?.heureISO).toBe("2026-11-03T15:00");
    expect(fenetre?.seche).toBe(true);
  });

  it("à égalité de probabilité, choisit la plus proche dans le temps", () => {
    const points = [
      point("2026-11-03T14:00", 10),
      point("2026-11-03T18:00", 10),
    ];
    const fenetre = meilleureFenetre(points, "2026-11-03T13:00");
    expect(fenetre?.heureISO).toBe("2026-11-03T14:00");
  });

  it("🔴 null si même la meilleure heure dépasse le seuil de pluie", () => {
    const points = [point("2026-11-03T14:00", SEUIL_PLUIE_POURCENT + 1)];
    expect(meilleureFenetre(points, "2026-11-03T13:00")).toBeNull();
  });

  it("une heure exactement au seuil est acceptée (seuil inclusif)", () => {
    const points = [point("2026-11-03T14:00", SEUIL_PLUIE_POURCENT)];
    expect(meilleureFenetre(points, "2026-11-03T13:00")?.seche).toBe(true);
  });

  it("ignore les points hors de l'horizon (passés ou trop lointains)", () => {
    const points = [
      point("2026-11-03T10:00", 0), // passé
      point("2026-11-04T10:00", 0), // trop loin (horizon par défaut 6h)
    ];
    expect(meilleureFenetre(points, "2026-11-03T13:00")).toBeNull();
  });

  it("l'horizon est paramétrable", () => {
    const points = [point("2026-11-03T22:00", 5)];
    expect(meilleureFenetre(points, "2026-11-03T13:00", 6)).toBeNull();
    expect(meilleureFenetre(points, "2026-11-03T13:00", 12)?.heureISO).toBe(
      "2026-11-03T22:00"
    );
  });

  it("aucun point dans la liste → null", () => {
    expect(meilleureFenetre([], "2026-11-03T13:00")).toBeNull();
  });
});

describe("decrireFenetre", () => {
  it("décrit une fenêtre trouvée avec heure, température et probabilité", () => {
    const texte = decrireFenetre({
      heureISO: "2026-11-03T15:00",
      probabilitePluie: 10,
      temperatureC: 14.6,
      seche: true,
    });
    expect(texte).toContain("15h00");
    expect(texte).toContain("15°C");
    expect(texte).toContain("10% de pluie");
  });

  it("🔴 une absence de fenêtre dit explicitement qu'il n'y a rien de bon, pas un silence", () => {
    expect(decrireFenetre(null)).toContain("pas de fenêtre sèche");
  });
});
