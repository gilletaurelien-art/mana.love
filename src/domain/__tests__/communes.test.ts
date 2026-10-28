import { describe, it, expect } from "vitest";
import {
  chercherCommunes,
  normaliserRequete,
  libelleCommune,
  type Commune,
} from "../communes";

const COMMUNES: Commune[] = [
  { code: "22010", nom: "Saint-Brieuc", lat: 48.514, lng: -2.765, codePostal: "22000" },
  { code: "29019", nom: "Brest", lat: 48.389, lng: -4.485, codePostal: "29200" },
  { code: "29232", nom: "Quimper", lat: 47.997, lng: -4.497, codePostal: "29000" },
  { code: "56121", nom: "Vannes", lat: 47.655, lng: -2.761, codePostal: "56000" },
  { code: "22221", nom: "Ploufragan", lat: 48.494, lng: -2.767, codePostal: "22440" },
  { code: "22286", nom: "Saint-Pol-de-Léon", lat: 48.689, lng: -4.053, codePostal: "29250" },
];

describe("normalisation de requête", () => {
  it("plie les accents : « Saint-Brieuc » = « saintbrieuc »", () => {
    expect(normaliserRequete("Saint-Brieuc")).toBe("saintbrieuc");
    expect(normaliserRequete("saintbrieuc")).toBe("saintbrieuc");
    expect(normaliserRequete("SAINT-BRIEUC")).toBe("saintbrieuc");
  });

  it("ignore tirets, espaces et apostrophes", () => {
    expect(normaliserRequete("Quimper")).toBe(normaliserRequete("Quim per"));
    expect(normaliserRequete("Saint-Brieuc")).toBe(normaliserRequete("Saint Brieuc"));
  });
});

describe("recherche par commune — le point d'entrée réel", () => {
  it("trouve par préfixe exact", () => {
    const r = chercherCommunes(COMMUNES, "quim");
    expect(r.kind).toBe("uniques");
    if (r.kind === "uniques") expect(r.commune.nom).toBe("Quimper");
  });

  it("distingue les homonymes : « saint » est multiple", () => {
    const r = chercherCommunes(COMMUNES, "saint");
    expect(r.kind).toBe("multiples");
    if (r.kind === "multiples") expect(r.communes.length).toBe(2);
    if (r.kind === "multiples") {
      expect(r.communes.map((c) => c.nom)).toContain("Saint-Brieuc");
      expect(r.communes.map((c) => c.nom)).toContain("Saint-Pol-de-Léon");
    }
  });

  it("retombe sur la correspondance partielle quand le préfixe échoue", () => {
    // « rest » n'est pas un préfixe de Brest, mais Brest contient « rest »
    const r = chercherCommunes(COMMUNES, "rest");
    expect(r.kind).toBe("uniques");
    if (r.kind === "uniques") expect(r.commune.nom).toBe("Brest");
  });

  it("une requête trop courte rend VIDE, pas une erreur", () => {
    expect(chercherCommunes(COMMUNES, "q").kind).toBe("vides");
    expect(chercherCommunes(COMMUNES, "").kind).toBe("vides");
  });

  it("une requête sans résultat rend VIDE honnêtement", () => {
    expect(chercherCommunes(COMMUNES, "zzzzz").kind).toBe("vides");
  });
});

describe("libellé — jamais juste le nom", () => {
  it("porte le code INSEE : « Brest (29019) »", () => {
    expect(libelleCommune(COMMUNES[1])).toBe("Brest (29019)");
  });
});
