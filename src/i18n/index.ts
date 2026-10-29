/**
 * i18n — fondation internationale de mana.love.
 *
 * L'app se veut internationale : les libellés vivent dans un
 * dictionnaire, jamais en dur dans les composants.
 *
 * Règles :
 * - français par défaut, anglais en seconde langue ;
 * - une clé manquante affiche la chaîne française — jamais du faux
 *   contenu, jamais une clé brute à l'écran ;
 * - l'anglais ne remplace JAMAIS le vouvoiement : « you » est le
 *   vouvoiement anglais (pas de « thou ») — la voix de la Déesse
 *   reste celle de l'arbitrage du 13/10 dans toutes les langues.
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
  | "home.invite.title"
  | "home.invite.desc"
  | "common.confidentialite"
  | "common.nouvelleConversation"
  | "common.envoyer"
  | "common.ecouter"
  | "common.retour";

const FR: Record<CleI18n, string> = {
  "nav.accueil": "Accueil",
  "nav.parler": "Parler",
  "nav.explorer": "Explorer",
  "nav.univers": "Univers",
  "nav.ecouter": "Écouter",
  "home.promise": "Aimer la vie.",
  "home.door.talk": "Parler avec MANA",
  "home.door.talkDesc":
    "Déposer ce qui pèse, réfléchir à voix haute, être encouragé à passer à l'action.",
  "home.door.explore": "Explorer le monde",
  "home.door.exploreDesc":
    "Découvrir des lieux, des chemins et des expériences qui vous attendent, près de chez vous.",
  "home.door.commencer": "Commencer",
  "home.door.decouvrir": "Découvrir",
  "home.progression": "Votre progression",
  "home.points": "points MANA",
  "home.invite.title": "Et si vous marchiez sans destination aujourd'hui ?",
  "home.invite.desc":
    "MANA propose régulièrement une petite expérience à vivre dans le monde réel. Celle-ci prend vingt minutes et ne demande rien d'autre que votre curiosité.",
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
  "home.door.talkDesc":
    "Set down what weighs, think out loud, be encouraged to take action.",
  "home.door.explore": "Explore the world",
  "home.door.exploreDesc":
    "Discover places, paths, and experiences waiting for you, close to where you are.",
  "home.door.commencer": "Begin",
  "home.door.decouvrir": "Discover",
  "home.progression": "Your progression",
  "home.points": "MANA points",
  "home.invite.title": "What if you walked without a destination today?",
  "home.invite.desc":
    "MANA regularly offers a small experience to live in the real world. This one takes twenty minutes and asks for nothing but your curiosity.",
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

/**
 * Traduction honnête : la langue si traduite, sinon le français.
 * Jamais de clé brute, jamais de contenu inventé.
 */
export function traduire(cle: CleI18n, langue: Langue = "fr"): string {
  const dico = DICTIONNAIRES[langue];
  return dico[cle] ?? FR[cle];
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
