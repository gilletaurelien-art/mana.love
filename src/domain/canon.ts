/**
 * Domaine : le canon des figures — MANA et les déesses comme contenu éditorial.
 *
 * Arbitrage du 13/10/2026 : un seul avatar récurrent pour MANA, stable et
 * reconnaissable. PAS 101 modèles 3D à choisir ou collectionner. Les 101
 * figures deviennent le sujet de récits documentés et illustrés.
 *
 * « L'image est la porte d'entrée d'une histoire, pas un simple objet
 *   à collectionner. »
 *
 * Ligne rouge documentaire : un lien géographique figure ↔ lieu n'est
 * présenté comme historique que s'il est DOCUMENTÉ. Sinon il est signalé
 * explicitement comme rapprochement poétique. ⛔ Jamais inventer un lien
 * historique pour enjoliver une balade.
 *
 * Quatre registres qui ne se mélangent pas :
 * 1. etabli      — ce que les sources permettent d'établir (faits, datations, limites) ;
 * 2. traditions   — ce que les traditions racontent (mythes, variantes, sans version unique) ;
 * 3. manaRaconte — ce que MANA raconte (réécriture poétique, signalée comme telle) ;
 * 4. aujourdHui  — ce que nous en faisons aujourd'hui (réflexion contemporaine, séparée).
 */

/** Les quatre registres, distincts par construction. */
export interface Registres {
  /** Faits établis par les sources, avec leurs limites. null = à écrire. */
  etabli: string | null;
  /** Mythes et variantes — jamais une version unique imposée. */
  traditions: string | null;
  /** Réécriture poétique de MANA — TOUJOURS signalée comme telle. */
  manaRaconte: string | null;
  /** Réflexion contemporaine, séparée du récit. */
  aujourdHui: string | null;
}

/** État éditorial réel d'une figure — jamais supposé. */
export type StatutEditorial =
  | "canon-recu" // texte du canon reçu
  | "demonstration" // figure de démonstration de l'app, hors canon
  | "a-ecrire"; // récit documenté à écrire

/** Lien géographique figure ↔ lieu. */
export interface LienLieu {
  /** Identifiant du lieu (fiche d'exploration). */
  lieuId: string;
  /** Nom lisible du lieu. */
  lieuNom: string;
  /**
   * "documente" : établi par les sources — présenté comme historique.
   * "poetique" : rapprochement de MANA — signalé explicitement comme tel.
   */
  nature: "documente" | "poetique";
}

/** Une figure du canon — sujet d'un récit documenté. */
export interface Figure {
  /** Clé stable, JAMAIS réassignée (cassera silencieusement les choix sauvegardés). */
  id: string;
  nom: string;
  /**
   * L'ÂME de la déesse — direction éditoriale du fondateur (28/10/2026) :
   * le discours s'oriente vers l'âme et le caractère de chaque figure.
   * C'est la porte d'entrée de l'histoire, AVANT les registres : une à
   * trois phrases qui disent qui elle est, pas ce qu'elle prouve.
   * null = à écrire — jamais gonflé au rang de fait.
   */
  ame: string | null;
  /** Tradition d'origine (ex. « Sumer, ~3000 av. J.-C. ») — seulement si établi. */
  tradition: string | null;
  /** Section du canon (sur XV annoncées). */
  section: number | null;
  /** L'un des cinq noms reliques — écho phonétique du Nom. */
  estRelique: boolean;
  statut: StatutEditorial;
  registres: Registres;
  /** Liens vers des lieux, typés documenté/poétique. */
  liens: readonly LienLieu[];
}

/**
 * Légende affichée pour un registre : nomme le registre, jamais mélangé.
 * Un registre null ne s'affiche pas comme vide : il s'affiche comme à écrire.
 */
export function enteteRegistre(registre: keyof Registres): string {
  switch (registre) {
    case "etabli":
      return "Ce que les sources établissent";
    case "traditions":
      return "Ce que les traditions racontent";
    case "manaRaconte":
      return "Ce que MANA raconte — réécriture poétique";
    case "aujourdHui":
      return "Ce que nous en faisons aujourd'hui";
  }
}

/** L'en-tête de l'âme : la porte d'entrée, AVANT les registres. */
export const ENTETE_AME = "Son âme";

/** Libellé honnête d'un lien : « historique documenté » ou « rapprochement poétique ». */
export function libelleLien(lien: LienLieu): string {
  return lien.nature === "documente"
    ? `lié historiquement à ${lien.lieuNom} — établi par les sources`
    : `rapproché poétiquement de ${lien.lieuNom} — par MANA, sans valeur historique`;
}

/**
 * Le canon annonce 101 figures et XV sections ; les données en portent moins.
 * Ne jamais supposer que les 101 existent : compter ce qui est réellement là.
 */
export function compterFigures(figures: readonly Figure[]): {
  totales: number;
  reliques: number;
  recitsEcrits: number;
  aEcrire: number;
  demonstrations: number;
} {
  return {
    totales: figures.length,
    reliques: figures.filter((f) => f.estRelique).length,
    recitsEcrits: figures.filter(
      (f) => f.statut === "canon-recu" && f.registres.etabli !== null
    ).length,
    aEcrire: figures.filter((f) => f.statut === "a-ecrire").length,
    demonstrations: figures.filter((f) => f.statut === "demonstration").length,
  };
}
