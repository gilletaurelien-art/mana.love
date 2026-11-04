/**
 * Domaine : phase de la Lune — calcul pur, sans dépendance réseau.
 *
 * ⭐ Comme `ciel.ts` : un calcul, pas une donnée récupérée. La période
 * synodique (nouvelle lune à nouvelle lune, ~29,53 jours) est une
 * constante physique, pas une mesure à renouveler.
 *
 * 🔴 VÉRIFIÉ PAR COHÉRENCE INTERNE, PAS PAR UNE DATE DE RÉFÉRENCE EXTERNE.
 * Cette session n'a pas accès à un éphéméride en ligne pour croiser une
 * date précise ("pleine lune le 15 mars 2026, vérifié contre tel
 * almanach") — plutôt que d'inventer une date de référence non vérifiée,
 * les tests portent sur des propriétés PHYSIQUES du cycle, vraies quelle
 * que soit l'époque de référence choisie : la phase se répète exactement
 * une période synodique plus tard, l'illumination est nulle à la
 * nouvelle lune et maximale à la pleine lune, et le croissant montant à
 * J jours après la nouvelle lune a la même illumination que le
 * croissant descendant à J jours avant la suivante (symétrie).
 */

/** Nouvelle lune de référence (Meeus, *Astronomical Algorithms*, ch. 49 — J2000). */
const EPOQUE_NOUVELLE_LUNE_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
/** Période synodique moyenne, en jours (Lune : nouvelle lune → nouvelle lune). */
const PERIODE_SYNODIQUE_JOURS = 29.530588861;
const JOUR_MS = 24 * 60 * 60 * 1000;

export type PhaseLunaireId =
  | "nouvelle"
  | "premier-croissant"
  | "premier-quartier"
  | "gibbeuse-croissante"
  | "pleine"
  | "gibbeuse-decroissante"
  | "dernier-quartier"
  | "dernier-croissant";

const NOMS_PHASE: readonly PhaseLunaireId[] = [
  "nouvelle",
  "premier-croissant",
  "premier-quartier",
  "gibbeuse-croissante",
  "pleine",
  "gibbeuse-decroissante",
  "dernier-quartier",
  "dernier-croissant",
];

export interface PhaseLunaire {
  /** Position dans le cycle, 0 (nouvelle lune) à 1 (nouvelle lune suivante). */
  readonly fractionCycle: number;
  /** Âge en jours depuis la dernière nouvelle lune. */
  readonly ageJours: number;
  /** Fraction du disque éclairée, 0 (nouvelle) à 1 (pleine). */
  readonly illumination: number;
  /** true du croissant montant au premier quartier jusqu'à la pleine lune. */
  readonly croissante: boolean;
  readonly id: PhaseLunaireId;
}

/**
 * La phase de la Lune à un instant donné.
 *
 * `illumination = (1 - cos(2π · fractionCycle)) / 2` — l'approximation
 * standard (l'excentricité de l'orbite lunaire introduit un écart de
 * quelques points de pourcentage selon le mois, négligeable pour un
 * affichage).
 */
export function phaseLunaire(date: Date): PhaseLunaire {
  const joursDepuisEpoque = (date.getTime() - EPOQUE_NOUVELLE_LUNE_MS) / JOUR_MS;
  const ageJours = joursDepuisEpoque % PERIODE_SYNODIQUE_JOURS;
  const age = ageJours < 0 ? ageJours + PERIODE_SYNODIQUE_JOURS : ageJours;
  const fractionCycle = age / PERIODE_SYNODIQUE_JOURS;
  const illumination = (1 - Math.cos(2 * Math.PI * fractionCycle)) / 2;
  const croissante = fractionCycle < 0.5;
  // 8 phases traditionnelles, chacune centrée sur 1/8 du cycle.
  const indexPhase = Math.round(fractionCycle * 8) % 8;

  return {
    fractionCycle,
    ageJours: age,
    illumination,
    croissante,
    id: NOMS_PHASE[indexPhase],
  };
}
