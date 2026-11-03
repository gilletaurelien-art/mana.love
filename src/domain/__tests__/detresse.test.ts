import { describe, it, expect } from "vitest";
import { detecterDetresse } from "../detresse";

describe("détection de détresse", () => {
  it("ne déclenche rien sur une conversation ordinaire", () => {
    expect(detecterDetresse("Quelle est votre couleur préférée ?")).toBeNull();
    expect(detecterDetresse("Je cherche une balade pour ce week-end.")).toBeNull();
  });

  it("détecte la détresse vitale et rend le 3114", () => {
    const r = detecterDetresse("je n'ai plus envie de vivre");
    expect(r).not.toBeNull();
    expect(r!.famille).toBe("vital");
    expect(r!.texte).toContain("3114");
    expect(r!.ressources.some((x) => x.numero === "3114")).toBe(true);
  });

  it("détecte les violences conjugales et rend le 3919", () => {
    const r = detecterDetresse("mon conjoint me frappe régulièrement");
    expect(r).not.toBeNull();
    expect(r!.famille).toBe("violence_conjugale");
    expect(r!.ressources.some((x) => x.numero === "3919")).toBe(true);
  });

  it("détecte la maltraitance et rend le 3977", () => {
    const r = detecterDetresse("ma grand-mère est maltraitée en EHPAD");
    expect(r).not.toBeNull();
    expect(r!.famille).toBe("maltraitance");
    expect(r!.ressources.some((x) => x.numero === "3977")).toBe(true);
  });

  it("détecte l'enfance en danger et rend le 119", () => {
    const r = detecterDetresse("un enfant est en danger chez mon voisin");
    expect(r).not.toBeNull();
    expect(r!.famille).toBe("enfance_danger");
    expect(r!.ressources.some((x) => x.numero === "119")).toBe(true);
  });

  it("est insensible à la casse et aux diacritiques", () => {
    expect(detecterDetresse("JE VEUX ME TUER")).not.toBeNull();
    expect(detecterDetresse("Je veux SUICIDER")).not.toBeNull();
  });

  it("🔴 priorise la famille la plus grave quand plusieurs correspondent", () => {
    // un texte qui touche à la fois le vital et les violences conjugales :
    // vital doit l'emporter — c'est la hiérarchie, pas un mélange.
    const r = detecterDetresse("mon conjoint me frappe et je veux me tuer");
    expect(r!.famille).toBe("vital");
  });

  it("⛔ ne porte aucun mécanisme pour être désarmée — pas de second paramètre", () => {
    // Garde de régression : la fonction ne prend qu'un seul argument. Si un
    // jour un paramètre de type « leverLaCaptation » ou « surface » est
    // ajouté pour contourner la détection sur certains écrans, ce test
    // échoue et le force à être visible dans la revue.
    expect(detecterDetresse.length).toBe(1);
  });
});
