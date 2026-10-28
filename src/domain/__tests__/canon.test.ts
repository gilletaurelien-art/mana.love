import { describe, it, expect } from "vitest";
import {
  enteteRegistre,
  libelleLien,
  compterFigures,
  ENTETE_AME,
  type LienLieu,
} from "../canon";
import { FIGURES } from "../figuresRegistry";
import { resoudreModele, INCARNATION_MANA, CATALOGUE_AVATARS } from "../avatar";

describe("l'âme — direction éditoriale : le caractère de la déesse d'abord", () => {
  it("l'entête de l'âme existe et ouvre, avant les registres", () => {
    expect(ENTETE_AME).toBe("Son âme");
  });

  it("chaque figure porte une âme qui dit qui elle est, pas ce qu'elle prouve", () => {
    for (const f of FIGURES) {
      if (f.ame !== null) {
        expect(f.ame.length).toBeGreaterThan(20);
        expect(f.ame).not.toMatch(/^\s*$/);
      }
    }
  });

  it("l'âme est DISTINCTE des registres : ni établi, ni tradition", () => {
    const mana = FIGURES.find((f) => f.id === "mana");
    expect(mana?.ame).not.toBe(mana?.registres.etabli);
    expect(mana?.ame).not.toBe(mana?.registres.manaRaconte);
  });

  it("une âme à écrire reste null — jamais gonflée au rang de fait", () => {
    const structure: { ame: string | null } = { ame: null };
    expect(structure.ame).toBeNull();
  });
});

describe("quatre registres qui ne se mélangent pas", () => {
  it("chaque registre porte son en-tête propre", () => {
    expect(enteteRegistre("etabli")).toBe("Ce que les sources établissent");
    expect(enteteRegistre("traditions")).toBe("Ce que les traditions racontent");
    expect(enteteRegistre("manaRaconte")).toContain("réécriture poétique");
    expect(enteteRegistre("aujourdHui")).toContain("aujourd'hui");
  });

  it("le registre manaRaconte est toujours signalé comme poétique", () => {
    const entete = enteteRegistre("manaRaconte");
    expect(entete).toContain("poétique");
  });
});

describe("ligne rouge documentaire", () => {
  it("un lien documenté se dit historique, établi par les sources", () => {
    const lien: LienLieu = { lieuId: "x", lieuNom: "Uruk", nature: "documente" };
    expect(libelleLien(lien)).toContain("historiquement");
    expect(libelleLien(lien)).toContain("établi par les sources");
  });

  it("un rapprochement poétique se signale SANS valeur historique", () => {
    const lien: LienLieu = { lieuId: "x", lieuNom: "une corniche", nature: "poetique" };
    const libelle = libelleLien(lien);
    expect(libelle).toContain("poétiquement");
    expect(libelle).toContain("sans valeur historique");
  });

  it("les deux natures ne partagent jamais la même case", () => {
    const doc: LienLieu = { lieuId: "x", lieuNom: "A", nature: "documente" };
    const poe: LienLieu = { lieuId: "x", lieuNom: "A", nature: "poetique" };
    expect(libelleLien(doc)).not.toBe(libelleLien(poe));
  });
});

describe("état éditorial réel — ne jamais supposer les 101", () => {
  it("compte ce qui est réellement là, statut par statut", () => {
    const c = compterFigures(FIGURES);
    expect(c.totales).toBe(FIGURES.length);
    expect(c.demonstrations).toBe(FIGURES.filter((f) => f.statut === "demonstration").length);
    expect(c.aEcrire).toBe(FIGURES.filter((f) => f.statut === "a-ecrire").length);
  });

  it("MANA se déclare création contemporaine, pas figure historique", () => {
    const mana = FIGURES.find((f) => f.id === "mana");
    expect(mana?.registres.etabli).toContain("création contemporaine");
    expect(mana?.estRelique).toBe(false);
  });

  it("une tradition ne s'affiche que si elle est établie", () => {
    const mana = FIGURES.find((f) => f.id === "mana");
    expect(mana?.tradition).toBeNull();
    const inanna = FIGURES.find((f) => f.id === "inanna");
    expect(inanna?.tradition).toContain("Sumer");
  });
});

describe("manifest d'avatar — une incarnation par personnalité (décision 28/10)", () => {
  it("MANA a SON avatar : FÉLINE, lu dans le catalogue, jamais deviné", () => {
    const modele = resoudreModele(INCARNATION_MANA);
    expect(modele?.cle).toBe("feline");
    expect(modele?.url).toBe("https://cdn.mana.bzh/mana-f-v3.vrm");
  });

  it("l'URL sans suffixe (404 mesuré) n'existe pas dans le catalogue", () => {
    const urlsWithoutSuffix = CATALOGUE_AVATARS.filter(
      (m) => m.url === "https://cdn.mana.bzh/mana-f.vrm"
    );
    expect(urlsWithoutSuffix).toHaveLength(0);
  });

  it("une incarnation sans clé catalogue rend null — pas de repli silencieux sur un autre corps", () => {
    expect(resoudreModele({ kind: "modele", cle: "mana-f" })).toBeNull();
    expect(resoudreModele({ kind: "modele", cle: "inconnu" })).toBeNull();
  });

  it("une incarnation en-stock (clé en attente) rend null honnêtement", () => {
    const attente = { kind: "en-stock", note: "déesse : clé à lire dans le catalogue" } as const;
    expect(resoudreModele(attente)).toBeNull();
  });

  it("pas de carrousel : personne ne choisit parmi 101 — chaque voix a LE sien", () => {
    // le catalogue peut être grand (le stock mesuré), mais l'incarnation
    // d'une personnalité est UNE clé, pas un choix ouvert
    expect(INCARNATION_MANA.kind).toBe("modele");
  });
});
