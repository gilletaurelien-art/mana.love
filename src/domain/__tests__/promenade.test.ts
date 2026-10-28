import { describe, it, expect } from "vitest";
import {
  parseGraphe,
  noeudDepartLePlusProche,
  composerBoucle,
  entreeDuLieu,
  dureeNaismith,
  lireDistanceMer,
  avertissementsMaree,
  distanceMetres,
  type GrapheBrut,
} from "../promenade";

/**
 * Graphe de test minimal — un carré avec une diagonale, un lieu accroché
 * à une arête. Reproduit les structures du fichier de graphe du pipeline.
 *
 *        n1 ──── n2
 *        │  ╲      │
 *        │    ╲    │
 *        n0 ──── n3
 *
 * Le lieu « Point de vue » est accroché à l'arête n1→n2 (le haut).
 */
function grapheTest(): GrapheBrut {
  return {
    territoire: "test",
    attribution: "© les contributeurs d'OpenStreetMap — ODbL",
    voies: ["path", "footway"],
    surfaces: ["ground", "asphalt"],
    schema_arete: [
      "a", "b", "metres", "agrement", "points",
      "voie", "surface|null", "dist_mer_m|null", "dz_m|null", "maree|null",
    ],
    // n : TOUS les points — dont un point isolé (n4) SANS arête.
    n: [
      [0.0, 0.0], // 0
      [0.0, 0.1], // 1
      [0.1, 0.1], // 2
      [0.1, 0.0], // 3
      [0.05, 0.05], // 4 : centre — point isolé, PIÈGE Crozon
    ],
    a: [
      // [a, b, m, agrement, points, voie, surface|null, distMer|null, dz|null, maree|null]
      [0, 1, 11100, 3, [0, 1], 0, 0, 500, 10, null],
      [1, 2, 7400, 4, [1, 2], 1, 1, 300, 15, null],
      [2, 3, 11100, 3, [2, 3], 0, null, 400, 5, null],
      [3, 0, 7400, 3, [3, 0], 0, 0, 600, 0, null],
      [0, 2, 15700, 2, [0, 4, 2], 0, null, null, null, null], // dz=null : pas de MNT
    ],
    l: [[1, 0.5, "Point de vue", "panorama"]],
  };
}

describe("contrat de fichier de graphe", () => {
  it("parse un fichier conforme et porte l'attribution ODbL DANS l'artefact", () => {
    const g = parseGraphe(grapheTest());
    expect(g.territoire).toBe("test");
    expect(g.attribution).toContain("OpenStreetMap");
    expect(g.attribution).toContain("ODbL");
    expect(g.a).toHaveLength(5);
    expect(g.l).toHaveLength(1);
  });

  it("refuse un schéma d'arête non reconnu", () => {
    const brut = grapheTest();
    brut.schema_arete = ["a", "b", "metres"];
    expect(() => parseGraphe(brut)).toThrow(/Schéma d'arête non reconnu/);
  });

  it("préserve surface=null : l'absence est l'état dominant (61,9 % mesuré)", () => {
    const g = parseGraphe(grapheTest());
    expect(g.a[2].surface).toBeNull();
    expect(g.a[4].surface).toBeNull();
    expect(g.a[0].surface).toBe(0);
  });
});

describe("piège Crozon : le départ se cherche parmi les nœuds qui portent des arêtes", () => {
  it("ne retourne JAMAIS le point isolé le plus proche", () => {
    const g = parseGraphe(grapheTest());
    // Le point isolé n4 est au centre — le plus proche de (0.05, 0.05).
    // Mais il porte zéro arête : le départ doit tomber sur une jonction.
    const depart = noeudDepartLePlusProche(g, [0.05, 0.05]);
    expect(depart).not.toBe(4);
    expect(depart).not.toBeNull();
    if (depart === null) return;
    const porte = g.a.some((ar) => ar.a === depart || ar.b === depart);
    expect(porte).toBe(true);
  });

  it("compose une boucle non vide depuis ce départ", () => {
    const g = parseGraphe(grapheTest());
    const depart = noeudDepartLePlusProche(g, [0.05, 0.05]);
    const lieu = g.l[0];
    const boucle = depart === null ? null : composerBoucle(g, depart, lieu);
    expect(boucle).not.toBeNull();
    expect(boucle?.aretes.length).toBeGreaterThan(0);
  });
});

describe("la boucle en trois parties — vers l'entrée, l'arête du lieu, le retour", () => {
  it("parcourt BIEN l'arête du lieu (pas seulement son extrémité)", () => {
    const g = parseGraphe(grapheTest());
    const lieu = g.l[0];
    const boucle = composerBoucle(g, 0, lieu);
    expect(boucle).not.toBeNull();
    // l'arête du lieu (index 1) doit être PARCOURUE au milieu de la boucle
    expect(boucle?.aretes).toContain(1);
  });

  it("choisit l'entrée du lieu selon la fraction (clé d'ordre)", () => {
    const g = parseGraphe(grapheTest());
    const lieuProcheDeA = { ...g.l[0], fraction: 0.2 };
    const lieuProcheDeB = { ...g.l[0], fraction: 0.8 };
    expect(entreeDuLieu(g, lieuProcheDeA).entree).toBe(1);
    expect(entreeDuLieu(g, lieuProcheDeB).entree).toBe(2);
  });

  it("retourne null honnêtement si le lieu n'est pas atteignable", () => {
    const g = parseGraphe(grapheTest());
    const lieu = { arete: 99, fraction: 0.5, nom: "Nulle part", categorie: "x" };
    expect(composerBoucle(g, 0, lieu)).toBeNull();
  });
});

describe("signaux : null ≠ 0 ≠ plat ≠ sans marée", () => {
  it("sans dénivelé, la durée est un PLANCHER et se dit comme tel", () => {
    const boucle = composerBoucle(
      parseGraphe(grapheTest()),
      0,
      parseGraphe(grapheTest()).l[0]
    );
    expect(boucle?.monteeM).toBeNull(); // l'arête 4 porte dz=null
    if (!boucle) return;
    const d = dureeNaismith(boucle.metres, boucle.monteeM);
    expect(d.plancher).toBe(true);
    // Naismith : 1 m de montée ≡ 5 m de plat ; sans montée, moitié d'équation
    expect(d.heures).toBeCloseTo(boucle.metres / 3000, 3);
  });

  it("avec dénivelé, Naismith applique l'équation complète", () => {
    const d = dureeNaismith(3000, 600);
    expect(d.plancher).toBe(false);
    expect(d.heures).toBeCloseTo(2, 3); // 3 km plat + 600 m montée = 2 h
  });

  it("« loin de la mer » est une VALEUR, pas une absence", () => {
    expect(lireDistanceMer(2000)).toBe("au moins 2 km de la mer");
    expect(lireDistanceMer(2500)).toBe("au moins 2 km de la mer");
    expect(lireDistanceMer(300)).toBe("300 m de la mer");
    expect(lireDistanceMer(null)).toBe("distance à la mer inconnue");
    // 2000 (je sais que c'est loin) ≠ null (je ne sais pas) : cases distinctes
    expect(lireDistanceMer(2000)).not.toBe(lireDistanceMer(null));
  });

  it("un territoire sans source de marée ne reçoit AUCUN avertissement — jamais simulé", () => {
    const g = parseGraphe(grapheTest());
    expect(avertissementsMaree(g)).toEqual([]);
    // Un avertissement de marée inventé serait un risque physique, pas un défaut d'affichage
  });

  it("un territoire AVEC source de marée avertit vers les sources officielles", () => {
    const brut = grapheTest();
    brut.a[0][9] = 0; // la première arête porte une info de marée
    const g = parseGraphe(brut);
    const avertissements = avertissementsMaree(g);
    expect(avertissements.length).toBeGreaterThan(0);
    expect(avertissements[0]).toContain("officielles");
  });
});

describe("fraction le long de l'arête : clé d'ordre, pas distance", () => {
  it("distanceMetres calcule une vraie distance haversine", () => {
    const d = distanceMetres([0, 0], [0, 0.01]);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1120); // ~1,11 km pour 0,01° de latitude
  });
});
