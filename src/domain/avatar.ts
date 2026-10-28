/**
 * Domaine : le manifest d'avatar — une incarnation par personnalité.
 *
 * Décision du fondateur (28/10/2026, après relevé) : « nous avons plus de
 * 100 avatars en stock, donc chacune aura son propre visage, son propre
 * corps. » Chaque personnalité — MANA comme chaque déesse — porte son
 * incarnation propre.
 *
 * NOTE : cette décision prolonge l'arbitrage du 13/10 — il n'y a toujours
 * PAS de carrousel de 101 modèles à collectionner : personne ne CHOISIT
 * un avatar parmi 101. Chaque personnalité a LE SIEN, fixe, lu dans le
 * catalogue. C'est une incarnation par voix, pas une collection.
 *
 * Protocole (relevé du 28/10/2026) :
 * - les modèles .vrm sont servis par le CDN souverain cdn.mana.bzh ;
 * - ⚠️ on ne DEVINE JAMAIS une URL de modèle : on la lit dans le catalogue.
 *   Un nom plausible qui rend 404 coûte plus cher qu'un nom absent ;
 * - 🔴 la clé est l'identifiant persisté dans le choix sauvegardé de chaque
 *   personne : la renommer casse silencieusement ce choix. ⛔ On associe à
 *   des clés EXISTANTES ; on ne réassigne jamais une clé. Le titre affiché,
 *   lui, change librement.
 * - le cadrage se règle à l'œil, PAR MODULE : la position verticale passe
 *   par decalageVisee uniquement — jamais par la géométrie de la boîte.
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
 * Le catalogue des modèles disponibles, tel que relevé.
 * Le stock complet (128 clés mesurées dans modelesInvites.ts côté mana.bzh)
 * arrivera avec le fichier catalogue — les URL ne s'inventent pas.
 */
export const CATALOGUE_AVATARS: readonly ModeleAvatar[] = [
  {
    cle: "feline",
    url: "https://cdn.mana.bzh/mana-f-v3.vrm",
    titre: "FÉLINE",
    auteur: "mana.bzh",
    licence: "CDN souverain cdn.mana.bzh",
  },
  {
    cle: "invite-miel",
    url: "https://cdn.mana.bzh/invite-miel.vrm",
    titre: "Miel",
    auteur: "invité",
    licence: "CDN souverain cdn.mana.bzh",
  },
] as const;

/**
 * L'incarnation d'une personnalité.
 * - "modele" : clé du catalogue — le visage ET le corps de cette personnalité ;
 * - "en-stock" : le fondateur a le modèle, mais la clé exacte attend le
 *   catalogue — état honnête, jamais une URL devinée.
 */
export type Incarnation =
  | { kind: "modele"; cle: string }
  | { kind: "en-stock"; note: string };

/** Incarnation de MANA : FÉLINE, la référence. */
export const INCARNATION_MANA: Incarnation = { kind: "modele", cle: "feline" };

/**
 * Résout l'incarnation d'une personnalité en modèle du catalogue.
 * Renvoie null si la clé est absente du catalogue — pas de repli silencieux
 * sur un autre avatar : une clé absente est une ERREUR à corriger dans le
 * référentiel, pas un état à masquer.
 */
export function resoudreModele(
  incarnation: Incarnation,
  catalogue: readonly ModeleAvatar[] = CATALOGUE_AVATARS
): ModeleAvatar | null {
  if (incarnation.kind !== "modele") return null;
  return catalogue.find((m) => m.cle === incarnation.cle) ?? null;
}

/**
 * Le choix d'avatar persisté PAR PERSONNALITÉ (memoireDeLAvatar).
 * La clé persistée est celle du modèle : la renommer casse le choix —
 * ⛔ associer à des clés existantes, ne jamais réassigner.
 */
export const CLE_STOCKAGE_AVATAR = "mana.love.avatar.par-personnalite.v1";

export function lireAvatarChoisi(personalityId: string): string | null {
  try {
    const raw = localStorage.getItem(CLE_STOCKAGE_AVATAR);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[personalityId] ?? null;
  } catch {
    return null;
  }
}

/** Réglages de cadrage : les valeurs ne se transportent PAS entre modules. */
export interface CadrageModule {
  /** Zoom propre au module — réglé à l'œil, par module. */
  zoom: number;
  /**
   * Décalage vertical de visée : SEUL réglage vertical autorisé.
   * ⛔ Jamais la géométrie de la boîte — elle remonte le bord bas du canvas
   * et coupe l'avatar en l'air.
   */
  decalageVisee: number;
}

/** Cadrage de mana.love — réglé à l'œil pour CE module, pas copié d'un autre. */
export const CADRAGE_MANA_LOVE: CadrageModule = {
  zoom: 0.7,
  decalageVisee: 0,
};
