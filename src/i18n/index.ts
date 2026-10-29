/**
 * i18n — fondation internationale de mana.love.
 *
 * Ton éditorial : simple, épuré, direct. Zéro blabla, zéro négativité.
 * - français par défaut, anglais en seconde langue ;
 * - une clé manquante affiche la chaîne française — jamais de clé brute ;
 * - « you » en anglais = vouvoiement, la voix de la Déesse dans toutes
 *   les langues (arbitrage du 13/10).
 */

export type Langue = "fr" | "en";

export const LANGUES: readonly { code: Langue; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export type CleI18n =
  | "nav.accueil"
  | "nav.parler"
  | "nav.explorer"
  | "nav.univers"
  | "nav.ecouter"
  | "home.promise"
  | "home.door.talk"
  | "home.door.talkDesc"
  | "home.door.explore"
  | "home.door.exploreDesc"
  | "home.door.commencer"
  | "home.door.decouvrir"
  | "home.progression"
  | "home.points"
  | "home.progression.suivante"
  | "home.progression.rencontrees"
  | "home.invite.title"
  | "home.invite.desc"
  | "home.moments.sommeil"
  | "home.moments.sommeilDesc"
  | "home.moments.action"
  | "home.moments.actionDesc"
  | "home.moments.radio"
  | "home.moments.radioDesc"
  | "home.pantheon.titre"
  | "common.confidentialite"
  | "common.nouvelleConversation"
  | "common.envoyer"
  | "common.ecouter"
  | "common.retour";

/** Dictionnaire français complet — référence pour toutes les langues. */
export const FR: Record<CleI18n, string> = {
  "nav.accueil": "Accueil",
  "nav.parler": "Parler",
  "nav.explorer": "Explorer",
  "nav.univers": "Univers",
  "nav.ecouter": "Écouter",
  "home.promise": "Aimer la vie.",
  "home.door.talk": "Parler avec MANA",
  "home.door.talkDesc": "Posez ce qui vous habite. MANA écoute.",
  "home.door.explore": "Explorer le monde",
  "home.door.exploreDesc": "Des lieux et des expériences, près de chez vous.",
  "home.door.commencer": "Commencer",
  "home.door.decouvrir": "Découvrir",
  "home.progression": "Votre progression",
  "home.points": "points MANA",
  "home.progression.suivante": "Prochaine rencontre : {nom} · {points} points",
  "home.progression.rencontrees": "{n} déesses rencontrées",
  "home.invite.title": "Marchez sans destination, aujourd'hui",
  "home.invite.desc":
    "Vingt minutes. Une règle simple. Laissez les rues choisir pour vous.",
  "home.moments.sommeil": "Sommeil",
  "home.moments.sommeilDesc": "Ralentir avant la nuit",
  "home.moments.action": "Action",
  "home.moments.actionDesc": "Un geste pour aujourd'hui",
  "home.moments.radio": "MANAradio",
  "home.moments.radioDesc": "La pluie, le vent, la mer",
  "home.pantheon.titre": "Le panthéon s'ouvre à vous",
  "common.confidentialite": "Confidentialité & données",
  "common.nouvelleConversation": "Nouvelle conversation",
  "common.envoyer": "Envoyer",
  "common.ecouter": "Écouter",
  "common.retour": "Retour",
};

const EN: Partial<Record<CleI18n, string>> = {
  "nav.accueil": "Home",
  "nav.parler": "Talk",
  "nav.explorer": "Explore",
  "nav.univers": "Universes",
  "nav.ecouter": "Listen",
  "home.promise": "To love life.",
  "home.door.talk": "Talk with MANA",
  "home.door.talkDesc": "Share what moves you. MANA listens.",
  "home.door.explore": "Explore the world",
  "home.door.exploreDesc": "Places and experiences, near you.",
  "home.door.commencer": "Begin",
  "home.door.decouvrir": "Discover",
  "home.progression": "Your progression",
  "home.points": "MANA points",
  "home.progression.suivante": "Next meeting: {nom} · {points} points",
  "home.progression.rencontrees": "{n} goddesses met",
  "home.invite.title": "Walk without a destination, today",
  "home.invite.desc":
    "Twenty minutes. One simple rule. Let the streets choose for you.",
  "home.moments.sommeil": "Sleep",
  "home.moments.sommeilDesc": "Slow down before night",
  "home.moments.action": "Action",
  "home.moments.actionDesc": "One gesture for today",
  "home.moments.radio": "MANAradio",
  "home.moments.radioDesc": "Rain, wind, sea",
  "home.pantheon.titre": "The pantheon opens to you",
  "common.confidentialite": "Privacy & data",
  "common.nouvelleConversation": "New conversation",
  "common.envoyer": "Send",
  "common.ecouter": "Listen",
  "common.retour": "Back",
};

const DICTIONNAIRES: Record<Langue, Partial<Record<CleI18n, string>>> = {
  fr: FR,
  en: EN,
};

/** Traduction honnête : la langue si traduite, sinon le français. */
export function traduire(
  cle: CleI18n,
  langue: Langue = "fr",
  vars?: Record<string, string | number>
): string {
  const dico = DICTIONNAIRES[langue];
  let texte = dico[cle] ?? FR[cle];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      texte = texte.replaceAll(`{${k}}`, String(v));
    }
  }
  return texte;
}

/** La langue mémorisée de la personne (localStorage), fr par défaut. */
const CLE_LANGUE = "mana.love.langue.v1";

export function lireLangue(): Langue {
  try {
    const v = localStorage.getItem(CLE_LANGUE);
    return v === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

export function ecrireLangue(langue: Langue): void {
  try {
    localStorage.setItem(CLE_LANGUE, langue);
  } catch {
    // stockage indisponible — la langue reste pour cette session
  }
}
