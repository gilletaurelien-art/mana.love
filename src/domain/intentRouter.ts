/**
 * Domain: routeur d'intentions conversationnelles — classe un message
 * AVANT tout appel réseau, pour répondre sans modèle quand une réponse
 * scriptée suffit.
 *
 * ⭐ Le build mesuré de l'ancien site classe chaque message en 6 intentions
 * et n'en envoie qu'UNE au modèle (INTIME, la catégorie par défaut) ; les
 * cinq autres (acquiescement, clôture, recherche ESS, recherche annuaire,
 * salutation) reçoivent une relance scriptée, sans coût ni latence réseau.
 *
 * ⛔ CE MODULE N'EN PORTE QUE TROIS DES CINQ, DÉLIBÉRÉMENT. Les deux
 * catégories « recherche ESS » et « recherche annuaire » (associations,
 * commerces, services publics…) interrogent des bases FRANÇAISES — hors du
 * périmètre que le fondateur a fixé le 3/11/2026 : mana.bzh pour la
 * Bretagne, manafrance.org pour la France, mana.love pour le monde et le
 * chat. Les porter ici referait exactement la confusion de périmètre que
 * la dissociation visait à corriger. Si un jour mana.love doit chercher
 * dans un annuaire, ce sera un appel à manafrance.org, pas une base locale
 * à ce module.
 *
 * ⚠️ Les phrases scriptées ci-dessous sont ÉCRITES POUR CE DÉPÔT, dans le
 * ton posé par systemPrompt.ts (vouvoiement, chaleureux, sobre). Elles ne
 * sont PAS une recopie du texte de l'ancien site — seule la FORME du
 * dispositif (classer avant d'appeler le modèle) est mesurée et reprise ;
 * son contenu exact n'est pas dans ce qui a été lu du bundle.
 *
 * ⛔ CE MODULE NE REMPLACE JAMAIS LA DÉTECTION DE DÉTRESSE (detresse.ts).
 * Il ne fait que court-circuiter des tours manifestement triviaux — un
 * message qui ressemble à une détresse ne peut matcher aucune des classes
 * ci-dessous (voir la borne de longueur et les listes fermées), et
 * retombe donc sur "intime", qui seul part vers le modèle — là où
 * detresse.ts s'exécute, comme toujours, avant quoi que ce soit d'autre.
 */

export type MomentJournee = "matin" | "apres-midi" | "soir";

export type IntentionConversation =
  | { type: "acquiescement"; reponseScriptee: string }
  | { type: "cloture"; reponseScriptee: string }
  | { type: "salutation"; reponseScriptee: string }
  | { type: "intime" };

/** Normalisation : minuscules, diacritiques et ponctuation finale retirés. */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[!.?…,;:]+$/g, "")
    .trim();
}

/**
 * 🔴 BORNE DE SÉCURITÉ. Un message plus long que ceci ne peut JAMAIS être
 * classé autrement qu'« intime », quel que soit son contenu — même s'il
 * commence par un mot de la liste. Un message substantiel part toujours
 * vers le modèle ; seuls les tours manifestement courts et fermés sont
 * court-circuités.
 */
const LONGUEUR_MAX_COURT_CIRCUIT = 40;

const ACQUIESCEMENTS = new Set([
  "ok", "oui", "d'accord", "daccord", "entendu", "ca marche", "ça marche",
  "parfait", "super", "genial", "génial", "nickel", "tres bien", "très bien",
  "compris", "note", "noté", "ca me va", "ça me va", "cool", "top",
]);

const RELANCE_ACQUIESCEMENT =
  "Avec plaisir. Je reste là si vous voulez continuer, ou revenez quand vous le souhaitez.";

const CLOTURES = new Set([
  "non merci", "non merci.", "pas interesse", "pas intéressé",
  "pas interessee", "pas intéressée", "pas mon truc", "ca ira", "ça ira",
  "ca ira merci", "ça ira merci", "au revoir", "a plus", "à plus",
  "a bientot", "à bientôt", "bonne soiree", "bonne soirée", "bonne nuit",
  "bonne journee", "bonne journée",
]);

const RELANCE_CLOTURE =
  "Très bien, je n'insiste pas. Belle suite à vous — je serai là si vous revenez.";

const SALUTATIONS = new Set(["bonjour", "salut", "coucou", "hello", "bonsoir", "bonsoir!"]);

function relanceSalutation(moment: MomentJournee): string {
  switch (moment) {
    case "matin":
      return "Bonjour, belle matinée à vous. De quoi avez-vous envie aujourd'hui ?";
    case "soir":
      return "Bonsoir. La journée s'achève — vous voulez en parler, ou juste souffler un peu ?";
    case "apres-midi":
    default:
      return "Bonjour, ravie de vous retrouver. Comment se passe votre journée ?";
  }
}

/** [0, 24) → le moment de la journée tel que relanceSalutation le distingue. */
export function momentDepuisHeure(heureLocale: number): MomentJournee {
  if (heureLocale >= 5 && heureLocale < 12) return "matin";
  if (heureLocale >= 18 || heureLocale < 5) return "soir";
  return "apres-midi";
}

/**
 * Classe un message. `heureLocale` (0-23) détermine la variante de
 * salutation — fourni par l'appelant, jamais lu depuis l'horloge ici, pour
 * que la fonction reste pure et testable à toute heure.
 */
export function classifierIntention(
  texte: string,
  heureLocale: number
): IntentionConversation {
  const n = normaliser(texte);

  if (n.length === 0 || n.length > LONGUEUR_MAX_COURT_CIRCUIT) {
    return { type: "intime" };
  }

  if (SALUTATIONS.has(n)) {
    return { type: "salutation", reponseScriptee: relanceSalutation(momentDepuisHeure(heureLocale)) };
  }
  if (CLOTURES.has(n)) {
    return { type: "cloture", reponseScriptee: RELANCE_CLOTURE };
  }
  if (ACQUIESCEMENTS.has(n)) {
    return { type: "acquiescement", reponseScriptee: RELANCE_ACQUIESCEMENT };
  }

  return { type: "intime" };
}
