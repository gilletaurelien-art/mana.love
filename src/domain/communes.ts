/**
 * Domaine : la recherche par commune — le point d'entrée réel des visiteurs.
 *
 * Cadrage §4 (socle) : IndexCommunes, chercher_le_pays. L'app neuve
 * reconstruit ce point d'entrée. Ici : le contrat de recherche, avec
 * la correction qui va avec — le routeur maison de mana.bzh n'emploie
 * pas les motifs habituels, un comptage par motif rend zéro :
 * ⭐ un comptage qui rend zéro doit d'abord prouver qu'il sait compter.
 */

export interface Commune {
  /** Code INSEE — identifiant stable. */
  code: string;
  nom: string;
  /** Coordonnées du centre, pour amorcer la promenade. */
  lat: number;
  lng: number;
  /** Code postal principal, si connu. null = inconnu. */
  codePostal: string | null;
}

export type ResultatRecherche =
  | { kind: "vides"; requete: string }
  | { kind: "uniques"; commune: Commune }
  | { kind: "multiples"; communes: Commune[]; requete: string };

/**
 * Normalisation de requête : accents pliés, tirets/espaces uniformisés,
 * minuscules. « Saint-Brieuc » et « saintbrieuc » doivent se retrouver.
 */
export function normaliserRequete(requete: string): string {
  return requete
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Recherche par préfixe normalisé — le réflexe du visiteur est de taper
 * les premières lettres de sa commune.
 */
export function chercherCommunes(
  communes: readonly Commune[],
  requete: string,
  limite = 8
): ResultatRecherche {
  const q = normaliserRequete(requete);
  if (q.length < 2) return { kind: "vides", requete };

  const trouvees = communes
    .filter((c) => normaliserRequete(c.nom).startsWith(q))
    .slice(0, limite);

  if (trouvees.length === 0) {
    // le préfixe échoue : essayer la correspondance partielle (contient)
    const partielles = communes
      .filter((c) => normaliserRequete(c.nom).includes(q))
      .slice(0, limite);
    if (partielles.length === 0) return { kind: "vides", requete };
    if (partielles.length === 1) return { kind: "uniques", commune: partielles[0] };
    return { kind: "multiples", communes: partielles, requete };
  }

  if (trouvees.length === 1) return { kind: "uniques", commune: trouvees[0] };
  return { kind: "multiples", communes: trouvees, requete };
}

/** Libellé d'une commune : « Saint-Brieuc (22010) » — jamais juste le nom. */
export function libelleCommune(c: Commune): string {
  return `${c.nom} (${c.code})`;
}
