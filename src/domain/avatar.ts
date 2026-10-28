/**
 * Domaine : le manifest d'avatar de MANA.
 *
 * Arbitrage du 13/10/2026 : UN SEUL avatar récurrent pour MANA, stable et
 * reconnaissable. Pas de carrousel de 101 VRM dans mana.love — la rotation
 * quotidienne et le mapping des 101 figures appartiennent à mana.bzh.
 *
 * Protocole (relevé du 28/10/2026) :
 * - les modèles .vrm sont servis par le CDN souverain cdn.mana.bzh ;
 * - ⚠️ la version SANS suffixe (mana-f.vrm) n'existe pas : un nom plausible
 *   qui rend 404 coûte plus cher qu'un nom absent — on ne DEVINE JAMAIS une
 *   URL de modèle, on la lit dans le catalogue ;
 * - 🔴 la clé est l'identifiant persisté dans le choix sauvegardé de chaque
 *   personne : la renommer casse silencieusement ce choix. ⛔ On associe à
 *   des clés EXISTANTES ; on ne réassigne jamais une clé. Le titre affiché,
 *   lui, change librement.
 * - la position verticale se règle par decalageVisee uniquement — jamais par
 *   la géométrie de la boîte (qui remonte le bord bas du canvas).
 */

export interface ModeleAvatar {
  /** Clé stable et persistée — JAMAIS réassignée. */
  cle: string;
  /** URL lue dans le catalogue, jamais devinée. */
  url: string;
  titre: string;
  auteur: string;
  licence: string;
}

/**
 * Le catalogue des modèles disponibles pour mana.love.
 * Relevé du 28/10/2026 : mana-f-v3.vrm répond 200 (FÉLINE, avatar de
 * référence). mana-f.vrm (sans suffixe) répond 404 — volontairement absent.
 */
export const CATALOGUE_AVATARS: readonly ModeleAvatar[] = [
  {
    cle: "feline",
    url: "https://cdn.mana.bzh/mana-f-v3.vrm",
    titre: "FÉLINE — l'avatar de référence de MANA",
    auteur: "mana.bzh",
    licence: "CDN souverain cdn.mana.bzh",
  },
] as const;

/** L'avatar de MANA : unique, stable, référencé par clé. */
export const CLE_AVATAR_MANA = "feline";

export function avatarDeMANA(): ModeleAvatar {
  const avatar = CATALOGUE_AVATARS.find((m) => m.cle === CLE_AVATAR_MANA);
  if (!avatar) {
    throw new Error(
      `L'avatar de MANA (clé « ${CLE_AVATAR_MANA} ») est absent du catalogue — ne jamais deviner une URL de modèle.`
    );
  }
  return avatar;
}

/** Un modèle invité référencé par clé existante — jamais par URL devinée. */
export function modeleParCle(cle: string): ModeleAvatar | null {
  return CATALOGUE_AVATARS.find((m) => m.cle === cle) ?? null;
}

/** Réglages de cadrage : les valeurs ne se transportent PAS entre modules. */
export interface CadrageModule {
  /** Zoom propre au module — réglé à l'œil, par module. */
  zoom: number;
  /**
   * Décalage vertical de visée : SEUL réglage vertical autorisé.
   * ⛔ Jamais la géométrie de la boîte — elle coupe MANA en l'air.
   */
  decalageVisee: number;
}

/** Cadrage de mana.love — à régler à l'œil pour CE module, pas copié d'un autre. */
export const CADRAGE_MANA_LOVE: CadrageModule = {
  zoom: 0.7,
  decalageVisee: 0,
};
