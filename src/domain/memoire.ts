/**
 * Domain: mémoire déclarée — ce que MANA retient d'une personne, entre deux
 * conversations.
 *
 * ⭐ ARBITRAGE DU 3/11/2026 (docs/cadrage-mana-love.md, dépôt mana) : « ce que
 * vous déclarez reste à vous, ce qui s'en déduit n'est écrit nulle part ».
 * Le modèle mesuré sur l'ancien site tient cette promesse par construction,
 * pas par discipline : un souvenir n'est jamais une transcription brute de
 * ce qui a été dit, c'est un FAIT DÉCLARÉ, d'un genre précis, avec une date
 * de péremption fixée par son genre — jamais par décision au cas par cas.
 *
 * ⛔ CE MODULE N'ÉCRIT RIEN. C'est un contrat de domaine pur : les types, la
 * règle de péremption par genre, et les fonctions de calcul. L'écriture
 * réelle (table Postgres, RLS, accès réseau) vit dans
 * src/infrastructure/memoireStore.ts — qui n'existe pas encore dans ce
 * dépôt : voir le dossier de migrations SQL à la racine (schéma applicatif,
 * hors arborescence src/) et le README pour ce qui reste à provisionner.
 */

/**
 * Les quatre genres de souvenir, et leur durée de vie en jours.
 * `null` = pas d'expiration (le genre « contexte »).
 *
 * 🔴 CES DURÉES SONT LA MINIMISATION RGPD DU PRODUIT, PAS UN DÉTAIL
 * D'IMPLÉMENTATION — elles ne se changent pas au cas par cas dans le code
 * applicatif. Mesurées sur le build servi de l'ancien site, reprises à
 * l'identique : preference 365 j, intention 30 j, rappel 30 j, contexte
 * sans expiration.
 */
export type GenreSouvenir = "preference" | "intention" | "rappel" | "contexte";

export const DUREE_JOURS_PAR_GENRE: Readonly<Record<GenreSouvenir, number | null>> = {
  preference: 365,
  intention: 30,
  rappel: 30,
  contexte: null,
};

const JOUR_MS = 24 * 60 * 60 * 1000;

/**
 * Un souvenir déclaré. `confirmeLe` est la dernière confirmation — c'est elle
 * qui fait repartir le compteur de péremption, pas la création initiale : un
 * souvenir qu'on reconfirme régulièrement ne périme jamais.
 */
export interface SouvenirDeclare {
  id: string;
  genre: GenreSouvenir;
  texte: string;
  /** ISO-8601. Horodatage de la dernière confirmation. */
  confirmeLe: string;
  /** ISO-8601, ou null si le genre n'expire pas. Dérivé de confirmeLe + genre — jamais stocké indépendamment, pour qu'il ne puisse pas diverger. */
  expireLe: string | null;
  /** ISO-8601, ou null si actif. Un souvenir désactivé reste visible et réactivable — contrairement à une suppression. */
  desactiveLe: string | null;
}

/** Calcule la date de péremption d'un souvenir confirmé à `confirmeLe`. */
export function calculerExpiration(genre: GenreSouvenir, confirmeLe: string): string | null {
  const dureeJours = DUREE_JOURS_PAR_GENRE[genre];
  if (dureeJours === null) return null;
  const confirmeMs = Date.parse(confirmeLe);
  return new Date(confirmeMs + dureeJours * JOUR_MS).toISOString();
}

/** Un souvenir est opérant s'il n'est ni désactivé, ni périmé à `maintenant`. */
export function estOperant(souvenir: SouvenirDeclare, maintenant: string): boolean {
  if (souvenir.desactiveLe !== null) return false;
  if (souvenir.expireLe === null) return true;
  return Date.parse(souvenir.expireLe) > Date.parse(maintenant);
}

/**
 * Filtre et trie les souvenirs opérants, les plus récemment confirmés en
 * premier — c'est cette liste, et seulement elle, qui doit être injectée
 * dans le contexte envoyé au modèle. Un souvenir périmé ou désactivé ne
 * doit JAMAIS atteindre le prompt système.
 */
export function souvenirsOperants(
  souvenirs: readonly SouvenirDeclare[],
  maintenant: string
): SouvenirDeclare[] {
  return souvenirs
    .filter((s) => estOperant(s, maintenant))
    .slice()
    .sort((a, b) => Date.parse(b.confirmeLe) - Date.parse(a.confirmeLe));
}
