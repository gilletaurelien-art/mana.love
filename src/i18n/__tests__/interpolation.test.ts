import { describe, it, expect } from "vitest";
import { traduire, FR, LANGUES, type CleI18n, type Langue } from "../index";

/**
 * Garde-fou d'interpolation : pour TOUTE clé, dans TOUTE langue
 * supportée, les placeholders ({nom}, {points}, {n}…) doivent être
 * identiques — sinon le rendu d'une langue afficherait une variable
 * brute ou perdrait une information.
 *
 * Ce test échoue si une future langue ou une future clé désaligne
 * les variables entre traductions.
 */

/** Extrait les placeholders {x} d'une chaîne triés. */
function placeholders(texte: string): string[] {
  return [...texte.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

/** Toutes les chaînes FR, depuis le dictionnaire interne. */
const FR_COMPLET = FR;

describe("interpolation : variables identiques dans toutes les langues", () => {
  const langues: Langue[] = LANGUES.map((l) => l.code);

  it("toute clé FR avec variables a la même signature dans chaque langue", () => {
    const problemes: string[] = [];

    for (const [cle, frVal] of Object.entries(FR_COMPLET) as [
      CleI18n,
      string
    ][]) {
      const phFr = placeholders(frVal);
      if (phFr.length === 0) continue;

      for (const langue of langues) {
        const traduction = traduire(cle, langue);
        const ph = placeholders(traduction);
        // la traduction retombant sur FR quand elle manque, une traduction
        // manquante passe ce test — mais une traduction PRÉSENTE avec des
        // variables différentes échoue :
        if (ph.join(",") !== phFr.join(",")) {
          problemes.push(
            `${cle} [${langue}] : variables ${ph.join(",")} ≠ FR ${phFr.join(",")}`
          );
        }
        // aucune variable ne doit rester non interpolée après traduction
        // avec les variables fournies
      }
    }

    expect(problemes).toEqual([]);
  });

  it("l'interpolation remplace TOUTES les variables fournies", () => {
    for (const langue of langues) {
      const texte = traduire(
        "home.progression.suivante",
        langue,
        { nom: "Luna", points: 30 }
      );
      expect(texte).not.toMatch(/\{(nom|points)\}/);
      expect(texte).toContain("Luna");
      expect(texte).toContain("30");
    }
  });

  it("une variable non fournie reste visible — jamais disparaître en silence", () => {
    // si l'appelant oublie une variable, le placeholder reste affiché :
    // c'est un signal à l'écran, pas une donnée perdue
    const texte = traduire("home.progression.suivante", "fr", { nom: "Luna" });
    expect(texte).toContain("{points}");
  });

  it("les valeurs interpolées acceptent nombres et chaînes", () => {
    expect(
      traduire("home.progression.rencontrees", "fr", { n: 4 })
    ).toContain("4");
    expect(
      traduire("home.progression.rencontrees", "en", { n: 4 })
    ).toContain("4");
  });
});
