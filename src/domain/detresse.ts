/**
 * Domain: détection de détresse — évaluée AVANT tout appel au modèle.
 *
 * ⭐ ARBITRAGE DU 3/11/2026 : l'ancien site mana.love (mesuré sur le build
 * servi) porte ce dispositif — 12 règles, 4 familles hiérarchisées, 6 numéros
 * vérifiés — mais seulement pour certaines surfaces de conversation. Ici il
 * est appliqué À TOUTE conversation, sans exception et sans interrupteur.
 *
 * ⛔ CE QUE CE MODULE N'A PAS, VOLONTAIREMENT : le dispositif mesuré sur
 * l'ancien site contenait un champ `leverLaCaptation` qui désarmait les
 * règles anti-dépendance sur le chat le plus intime (surface "sanctuaire").
 * Ce module ne porte AUCUN interrupteur de ce genre. Une réponse de crise
 * n'est jamais désactivable par la surface, la personnalité ou le contexte
 * d'appel — c'est la leçon du défaut trouvé, pas un détail d'implémentation.
 *
 * ⭐ UNE RÉPONSE ICI EST SCRIPTÉE, JAMAIS GÉNÉRÉE. Le texte ne part pas au
 * modèle : la détection se fait AVANT l'appel, et quand elle correspond,
 * l'appel au modèle n'a PAS lieu. Un modèle de langage peut improviser une
 * mauvaise réponse à un message de détresse ; un numéro vérifié ne peut pas.
 *
 * Les numéros ci-dessous sont les numéros d'urgence et d'écoute publics
 * français, gratuits et actifs 24h/24 sauf mention contraire.
 */

export type FamilleDetresse =
  | "vital"
  | "violence_conjugale"
  | "maltraitance"
  | "enfance_danger";

export interface RessourceCrise {
  numero: string;
  label: string;
}

export interface ReponseCrise {
  famille: FamilleDetresse;
  texte: string;
  ressources: readonly RessourceCrise[];
}

/** Normalisation : minuscules, diacritiques retirés — pour que « détresse »
 *  et « detresse » déclenchent la même règle. */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

interface Regle {
  famille: FamilleDetresse;
  motifs: RegExp[];
  texte: string;
  ressources: readonly RessourceCrise[];
}

/**
 * 🔴 L'ORDRE EST LA HIÉRARCHIE. Un texte peut correspondre à plusieurs
 * familles à la fois (« il me frappe et je veux mourir ») ; c'est la plus
 * grave qui répond, jamais un mélange. vital > violence_conjugale >
 * maltraitance > enfance_danger — mesuré sur l'ancien site, repris tel quel.
 */
const REGLES: readonly Regle[] = [
  {
    famille: "vital",
    motifs: [
      /\bsuicid/i,
      /\bme\s+tuer\b/i,
      /\ben\s+finir\b/i,
      /\bne\s+plus\s+(?:vivre|etre\s+la)\b/i,
      /\bplus\s+envie\s+de\s+vivre\b/i,
      /\bmourir\b/i,
    ],
    texte:
      "Ce que vous dites compte, et je préfère vous orienter vers quelqu'un " +
      "qui peut vraiment vous aider maintenant. Le 3114 est le numéro national " +
      "de prévention du suicide : gratuit, 24h/24, une personne décroche. En " +
      "danger immédiat, appelez le 15 (SAMU) ou le 112.",
    ressources: [
      { numero: "3114", label: "Numéro national de prévention du suicide — gratuit, 24h/24" },
      { numero: "15", label: "SAMU — urgence vitale" },
      { numero: "112", label: "Numéro d'urgence européen" },
    ],
  },
  {
    famille: "violence_conjugale",
    motifs: [
      /\bmon\s+(?:conjoint|mari|compagnon|ex)\s+me\s+(?:frappe|bat|menace)/i,
      /\bviolence[s]?\s+conjugale/i,
      /\bil\s+me\s+(?:frappe|bat)\b/i,
      /\belle\s+me\s+(?:frappe|bat)\b/i,
    ],
    texte:
      "Ce que vous décrivez est grave, et vous n'avez pas à le vivre seul·e. " +
      "Le 3919 (Violences Femmes Info) écoute, oriente et conseille, " +
      "gratuitement et en toute confidentialité.",
    ressources: [
      { numero: "3919", label: "Violences Femmes Info — gratuit, confidentiel" },
    ],
  },
  {
    famille: "maltraitance",
    motifs: [
      /\bmaltrait/i,
      /\bon\s+me\s+(?:maltraite|neglige)\b/i,
    ],
    texte:
      "Si vous ou un proche êtes en situation de maltraitance — personne " +
      "âgée ou en situation de handicap —, le 3977 écoute, informe et peut " +
      "intervenir, gratuitement.",
    ressources: [
      { numero: "3977", label: "Allô Maltraitance — personnes âgées et en situation de handicap" },
    ],
  },
  {
    famille: "enfance_danger",
    motifs: [
      /\benfant[s]?\b.{0,25}\bdanger\b/i,
      /\bdanger\b.{0,25}\benfant[s]?\b/i,
      /\benfant[s]?\b.{0,25}\b(?:frappe|maltraite|battu)/i,
    ],
    texte:
      "Si un enfant est en danger, le 119 (Allô Enfance en Danger) écoute et " +
      "agit, gratuitement, 24h/24 — par un professionnel formé.",
    ressources: [
      { numero: "119", label: "Allô Enfance en Danger — gratuit, 24h/24" },
    ],
  },
];

/**
 * Évalue un message. Retourne la réponse de crise de la famille la plus
 * grave détectée, ou `null` si rien ne correspond — auquel cas la
 * conversation suit son cours normal jusqu'au modèle.
 */
export function detecterDetresse(texte: string): ReponseCrise | null {
  const normalise = normaliser(texte);
  for (const regle of REGLES) {
    if (regle.motifs.some((motif) => motif.test(normalise))) {
      return { famille: regle.famille, texte: regle.texte, ressources: regle.ressources };
    }
  }
  return null;
}
