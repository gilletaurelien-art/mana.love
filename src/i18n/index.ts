/**
 * i18n — fondation internationale de mana.love.
 *
 * Ton éditorial : simple, épuré, direct. Zéro blabla, zéro négativité.
 * - français par défaut, anglais en seconde langue ;
 * - une clé manquante affiche la chaîne française — jamais de clé brute ;
 * - « you » en anglais = vouvoiement, la voix de la Déesse dans toutes
 *   les langues (arbitrage du 13/10).
 *
 * ⚠️ Portée (4/11) : ce dictionnaire couvre le CHROME de chaque écran —
 * titres, boutons, bandeaux. Il ne couvre PAS : le contenu du domaine
 * (noms/lore des personnalités, lieux et expériences d'exemple, texte
 * généré par l'IA), ni les phrases que `src/domain/meteo.ts` ou les
 * messages d'erreur runtime produisent directement en français. Changer
 * la langue de l'interface ne change ni la langue de la conversation
 * (`systemPrompt.ts:17` l'impose en français, verrouillé par un test)
 * ni ce texte-là — un écart déjà connu, pas une régression de cette PR.
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
  | "nav.compte"
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
  | "common.retour"
  // chat
  | "chat.personnaliteActive"
  | "chat.choisirPersonnalite"
  | "chat.personnalitesDebloquees"
  | "chat.connexion"
  | "chat.enLigne"
  | "chat.modeDemo"
  | "chat.conversationAvec"
  | "chat.demoNoticeTitre"
  | "chat.demoNoticeTexte"
  | "chat.bienvenueTexte"
  | "chat.vousLabel"
  | "chat.locuteurLabel"
  | "chat.reessayer"
  | "chat.messageA"
  | "chat.ecrireA"
  | "chat.pointsVerrou"
  // explore (liste)
  | "explore.eyebrow"
  | "explore.titre"
  | "explore.lead"
  | "explore.chargementAria"
  | "explore.lieuxReelsTitre"
  | "explore.procheDe"
  | "explore.odbl"
  | "explore.demoTitre"
  | "explore.demoTexte"
  | "explore.decouvrirReels"
  | "explore.rechercherLabel"
  | "explore.recherchePlaceholder"
  | "explore.lieuxTitre"
  | "explore.aucunLieuOsm"
  | "explore.aucunResultat"
  | "explore.experiencesTitre"
  // explore (détail lieu)
  | "exploreDetail.filAria"
  | "exploreDetail.retourExplorer"
  | "exploreDetail.lieuIntrouvableTitre"
  | "exploreDetail.lieuIntrouvableTexte"
  | "exploreDetail.retourExplorationLien"
  | "exploreDetail.demoTitre"
  | "exploreDetail.demoTexte"
  | "exploreDetail.lieuReelTitre"
  | "exploreDetail.odblSuffixe"
  | "exploreDetail.coordonnees"
  | "exploreDetail.minutesAPied"
  | "exploreDetail.bonsMomentsAria"
  | "exploreDetail.bonsMomentsTitre"
  | "exploreDetail.actionsAria"
  | "exploreDetail.plu"
  | "exploreDetail.dejaDecouvert"
  | "exploreDetail.pasEncoreDecouvert"
  | "exploreDetail.decouvert"
  | "exploreDetail.jeLaiDecouvert"
  | "exploreDetail.enParlerAvecMana"
  // explore (détail expérience)
  | "experienceDetail.introuvableTitre"
  | "experienceDetail.introuvableTexte"
  | "experienceDetail.eyebrow"
  | "experienceDetail.demoTitre"
  | "experienceDetail.demoTexte"
  | "experienceDetail.pratiqueAria"
  | "experienceDetail.leConcours"
  | "experienceDetail.minutes"
  | "experienceDetail.pretTexte"
  | "experienceDetail.preparerAvecMana"
  // panthéon
  | "pantheon.eyebrow"
  | "pantheon.titre"
  | "pantheon.lead"
  | "pantheon.demoTitre"
  | "pantheon.demoTexte"
  | "pantheon.parlerA"
  | "pantheon.verrouillee"
  | "pantheon.points"
  | "pantheon.histoireFiction"
  // sommeil
  | "sleep.eyebrow"
  | "sleep.titre"
  | "sleep.lead"
  | "sleep.step1Titre"
  | "sleep.step1Body"
  | "sleep.step2Titre"
  | "sleep.step2Body"
  | "sleep.step3Titre"
  | "sleep.step3Body"
  | "sleep.bonneNuit"
  | "sleep.recommencer"
  | "sleep.parlerALuna"
  | "sleep.etapeCompteur"
  | "sleep.terminer"
  | "sleep.continuer"
  | "sleep.introTexte"
  | "sleep.commencer"
  | "sleep.bientotTitre"
  | "sleep.bientotTexte"
  // action
  | "action.eyebrow"
  | "action.titre"
  | "action.lead"
  | "action.sunlightTitre"
  | "action.sunlightBody"
  | "action.messageTitre"
  | "action.messageBody"
  | "action.thresholdTitre"
  | "action.thresholdBody"
  | "action.beauGeste"
  | "action.jeLeFaisAujourdhui"
  | "action.nouvelleBientot"
  | "action.versionInitialeTitre"
  | "action.versionInitialeTexte"
  | "action.besoinEnParler"
  | "action.parlerAvecMana"
  // radio
  | "radio.eyebrow"
  | "radio.titre"
  | "radio.lead"
  | "radio.bientotTitre"
  | "radio.bientotTexte"
  | "radio.lectureIndisponible"
  | "radio.indisponible"
  | "radio.envieMomentCalme"
  | "radio.manaSleep"
  // confidentialité
  | "privacy.titre"
  | "privacy.stockeTitre"
  | "privacy.stockeTexte1"
  | "privacy.stockeTexte2"
  | "privacy.neFaisonsPasTitre"
  | "privacy.neFaisonsPas1"
  | "privacy.neFaisonsPas2"
  | "privacy.neFaisonsPas3"
  | "privacy.neFaisonsPas4"
  | "privacy.supprimerTitre"
  | "privacy.supprimerTexte"
  | "privacy.supprimerNote"
  | "privacy.securiteTitre"
  | "privacy.securiteTexte"
  | "privacy.donneesSupprimees"
  | "privacy.confirmerSuppression"
  | "privacy.annuler"
  | "privacy.supprimerToutesMesDonnees"
  // compte
  | "account.eyebrow"
  | "account.pasEncoreDisponible"
  | "account.nonConfigureTitre"
  | "account.nonConfigureTexte"
  | "account.connecte"
  | "account.seDeconnecter"
  | "account.seConnecter"
  | "account.lienTexte"
  | "account.lienEnvoyeAvant"
  | "account.lienEnvoyeApres"
  | "account.emailLabel"
  | "account.envoiEnCours"
  | "account.recevoirLeLien"
  | "account.echecEnvoi"
  // ciel (astronomie)
  | "nav.ciel"
  | "ciel.eyebrow"
  | "ciel.titre"
  | "ciel.lead"
  | "ciel.demoTitre"
  | "ciel.demoTexte"
  | "ciel.voirMonCiel"
  | "ciel.cielReelTitre"
  | "ciel.geoIndisponible"
  | "ciel.domeAria"
  | "ciel.attribution"
  | "ciel.illumination"
  | "lune.nouvelle"
  | "lune.premier-croissant"
  | "lune.premier-quartier"
  | "lune.gibbeuse-croissante"
  | "lune.pleine"
  | "lune.gibbeuse-decroissante"
  | "lune.dernier-quartier"
  | "lune.dernier-croissant";

/** Dictionnaire français complet — référence pour toutes les langues. */
export const FR: Record<CleI18n, string> = {
  "nav.accueil": "Accueil",
  "nav.parler": "Parler",
  "nav.explorer": "Explorer",
  "nav.univers": "Univers",
  "nav.ecouter": "Écouter",
  "nav.compte": "Compte",
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

  "chat.personnaliteActive": "Personnalité active",
  "chat.choisirPersonnalite": "Choisir une personnalité",
  "chat.personnalitesDebloquees": "Personnalités débloquées",
  "chat.connexion": "Connexion…",
  "chat.enLigne": "MANA · en ligne",
  "chat.modeDemo": "Mode démo",
  "chat.conversationAvec": "Conversation avec {nom}",
  "chat.demoNoticeTitre": "Mode démo.",
  "chat.demoNoticeTexte":
    "Les réponses viennent d'un script local. Ajoutez MISTRAL_API_KEY pour la vraie voix de {nom}.",
  "chat.bienvenueTexte": "Écrivez ce qui vous traverse — {nom} est là pour vous écouter.",
  "chat.vousLabel": "Vous : ",
  "chat.locuteurLabel": "{nom} : ",
  "chat.reessayer": "Réessayer",
  "chat.messageA": "Votre message à {nom}",
  "chat.ecrireA": "Écrire à {nom}…",
  "chat.pointsVerrou": "{n} points",

  "explore.eyebrow": "Exploration",
  "explore.titre": "Explorer le monde",
  "explore.lead": "Des lieux et des expériences à vivre dehors, près de vous.",
  "explore.chargementAria": "Chargement des découvertes",
  "explore.lieuxReelsTitre": "Lieux réels autour de vous",
  "explore.procheDe": "proche de {lieu}.",
  "explore.odbl": "Données © OpenStreetMap contributors (ODbL).",
  "explore.demoTitre": "Exemples de démonstration.",
  "explore.demoTexte":
    "Activez les lieux réels autour de vous, ou parcourez d'abord les exemples.",
  "explore.decouvrirReels": "Découvrir des lieux réels autour de moi (OpenStreetMap)",
  "explore.rechercherLabel": "Rechercher un lieu, une ambiance, une expérience",
  "explore.recherchePlaceholder": "ex. : aube, marche, jardin…",
  "explore.lieuxTitre": "Lieux à découvrir",
  "explore.aucunLieuOsm": "Explorez une autre zone pour découvrir d'autres lieux.",
  "explore.aucunResultat": "Essayez un autre mot.",
  "explore.experiencesTitre": "Expériences à vivre",

  "exploreDetail.filAria": "Fil d'exploration",
  "exploreDetail.retourExplorer": "← Explorer",
  "exploreDetail.lieuIntrouvableTitre": "Lieu introuvable",
  "exploreDetail.lieuIntrouvableTexte": "Ce lieu n'existe pas ou n'est plus disponible.",
  "exploreDetail.retourExplorationLien": "← Retour à l'exploration",
  "exploreDetail.demoTitre": "Fiche de démonstration.",
  "exploreDetail.demoTexte":
    "Aucune information réelle (adresse, horaires, accès) n'est affichée.",
  "exploreDetail.lieuReelTitre": "Lieu réel",
  "exploreDetail.odblSuffixe": " — données © OpenStreetMap contributors (ODbL).",
  "exploreDetail.coordonnees": " Coordonnées : {lat}, {lng}.",
  "exploreDetail.minutesAPied": " À environ {n} min à pied d'ici.",
  "exploreDetail.bonsMomentsAria": "Moments recommandés",
  "exploreDetail.bonsMomentsTitre": "Bons moments",
  "exploreDetail.actionsAria": "Actions",
  "exploreDetail.plu": "Ce lieu vous a plu ?",
  "exploreDetail.dejaDecouvert": "Une belle découverte, gardée dans votre carnet.",
  "exploreDetail.pasEncoreDecouvert": "Notez-le dans votre carnet de découvertes.",
  "exploreDetail.decouvert": "Découvert ✓",
  "exploreDetail.jeLaiDecouvert": "Je l'ai découvert",
  "exploreDetail.enParlerAvecMana": "En parler avec MANA",

  "experienceDetail.introuvableTitre": "Expérience introuvable",
  "experienceDetail.introuvableTexte":
    "Cette expérience n'existe pas ou n'est plus disponible.",
  "experienceDetail.eyebrow": "Expérience · {intensite}",
  "experienceDetail.demoTitre": "Expérience de démonstration.",
  "experienceDetail.demoTexte":
    "Ce contenu est un exemple : sa vocation est d'inspirer, pas de décrire un lieu réel vérifié.",
  "experienceDetail.pratiqueAria": "Pratique",
  "experienceDetail.leConcours": "Le concours",
  "experienceDetail.minutes": "{n} minutes",
  "experienceDetail.pretTexte":
    "Prêt·e à la tenter ? Parlez-en à MANA pour la transformer en petit plan d'action.",
  "experienceDetail.preparerAvecMana": "Préparer cette expérience avec MANA",

  "pantheon.eyebrow": "Univers",
  "pantheon.titre": "Le panthéon",
  "pantheon.lead":
    "Chaque déesse a sa voix et son histoire. Vos découvertes ouvrent de nouvelles rencontres.",
  "pantheon.demoTitre": "Personnalités de démonstration.",
  "pantheon.demoTexte": "Univers de fiction, créés pour MANA.love.",
  "pantheon.parlerA": "Parler à {nom}",
  "pantheon.verrouillee": "Verrouillée",
  "pantheon.points": "{n} points",
  "pantheon.histoireFiction": "Son histoire — fiction",

  "sleep.eyebrow": "MANA Sleep",
  "sleep.titre": "Ralentir avant la nuit",
  "sleep.lead":
    "Trois petits pas vers le sommeil. Aucun son requis, aucun autoplay — juste vous et votre respiration.",
  "sleep.step1Titre": "Déposer la journée",
  "sleep.step1Body":
    "Trois respirations lentes. À chaque expiration, laissez une chose de la journée redescendre.",
  "sleep.step2Titre": "Nommer sans juger",
  "sleep.step2Body":
    "Nommez silencieusement ce qui occupe votre esprit. Pas pour le résoudre — juste pour le voir.",
  "sleep.step3Titre": "Inviter le calme",
  "sleep.step3Body":
    "Imaginez un lieu apaisant, réel ou imaginaire. Laissez la respiration devenir plus lente à chaque cycle.",
  "sleep.bonneNuit": "Bonne nuit.",
  "sleep.recommencer": "Recommencer",
  "sleep.parlerALuna": "Parler à Luna",
  "sleep.etapeCompteur": "Étape {n} / {total} · environ {secondes} secondes",
  "sleep.terminer": "Terminer",
  "sleep.continuer": "Continuer",
  "sleep.introTexte": "Trois étapes courtes pour vous préparer à dormir.",
  "sleep.commencer": "Commencer",
  "sleep.bientotTitre": "Bientôt.",
  "sleep.bientotTexte": "Les voix guidées arrivent avec l'audio de MANA.",

  "action.eyebrow": "MANA Action",
  "action.titre": "Un petit geste qui compte",
  "action.lead":
    "MANA ne cherche pas à vous garder ici. Une action, aujourd'hui, dans le monde réel — même toute petite.",
  "action.sunlightTitre": "Trois minutes de vrai soleil",
  "action.sunlightBody":
    "Sortez trois minutes, sans téléphone, et laissez la lumière du jour vous trouver. C'est tout.",
  "action.messageTitre": "Un message que vous repoussez",
  "action.messageBody":
    "Cette personne à qui vous pensez depuis des semaines sans lui écrire ? Trente secondes, deux lignes, envoyé.",
  "action.thresholdTitre": "Un seuil à franchir",
  "action.thresholdBody":
    "Marchez jusqu'au bout de votre rue, puis un carrefour de plus. Revenez par un chemin différent.",
  "action.beauGeste": "Beau geste. À vous de le vivre, dehors.",
  "action.jeLeFaisAujourdhui": "Je le fais aujourd'hui",
  "action.nouvelleBientot": "Une nouvelle proposition arrive bientôt.",
  "action.versionInitialeTitre": "Version initiale.",
  "action.versionInitialeTexte":
    "Les propositions d'action seront bientôt personnalisées par MANA en fonction de vos conversations et découvertes.",
  "action.besoinEnParler": "Besoin d'en parler avant ?",
  "action.parlerAvecMana": "Parler avec MANA",

  "radio.eyebrow": "MANAradio",
  "radio.titre": "Écouter le monde",
  "radio.lead":
    "Des paysages sonores pour accompagner un moment calme — jamais en autoplay, toujours sous votre contrôle.",
  "radio.bientotTitre": "Bientôt.",
  "radio.bientotTexte":
    "Le catalogue arrive — uniquement des sons dont les droits sont clairs. Les entrées ci-dessous donnent un avant-goût.",
  "radio.lectureIndisponible": "Lecture indisponible pour {titre}",
  "radio.indisponible": "▶ Indisponible",
  "radio.envieMomentCalme": "Envie d'un moment calme avant de dormir ?",
  "radio.manaSleep": "MANA Sleep",

  "privacy.titre": "Vos données, en toute clarté",
  "privacy.stockeTitre": "Ce qui est stocké, aujourd'hui",
  "privacy.stockeTexte1":
    "Dans cette première version, tout reste sur votre appareil, dans le stockage local de votre navigateur (localStorage) : vos conversations par personnalité, vos lieux visités et votre registre de points MANA. Rien de tout cela ne quitte votre appareil.",
  "privacy.stockeTexte2":
    "Deux exceptions, déjà actives aujourd'hui, qui ne sont PAS du stockage à votre nom : si vous demandez des lieux réels autour de vous, vos coordonnées transitent par notre serveur vers OpenStreetMap, et restent en mémoire du serveur jusqu'à 10 minutes — pour éviter de répéter la même recherche, jamais pour vous identifier ; et si l'assistant est connecté à un modèle, le texte de vos messages transite par notre serveur vers notre fournisseur de modèle, sans y être écrit. Dans les deux cas, notre serveur relaie — il ne tient pas de dossier sur vous.",
  "privacy.neFaisonsPasTitre": "Ce que nous ne faisons pas",
  "privacy.neFaisonsPas1": "Nous ne vendons ni ne partageons vos données.",
  "privacy.neFaisonsPas2":
    "Nous ne réutilisons pas le contexte d'une personnalité dans une autre sans votre accord explicite.",
  "privacy.neFaisonsPas3":
    "Nous ne concevons pas de mécaniques de dépendance, de culpabilisation ou de jalousie artificielle.",
  "privacy.neFaisonsPas4":
    "Nous ne récompensons ni le temps d'écran, ni le volume de messages, ni la réouverture répétée de l'app.",
  "privacy.supprimerTitre": "Supprimer vos données",
  "privacy.supprimerTexte":
    "Vous pouvez effacer l'ensemble de vos données locales à tout moment via le bouton ci-dessous, ou en vidant les données de site de votre navigateur.",
  "privacy.supprimerNote":
    "Note honnête : dans cette version, la suppression ne concerne que le stockage local de ce navigateur. Quand un backend sera en place, la suppression s'étendra aux données serveur.",
  "privacy.securiteTitre": "Sécurité",
  "privacy.securiteTexte":
    "Aucun chiffrement supplémentaire n'est implémenté au-delà de celui de votre navigateur et de votre appareil. Nous ne prétendons pas offrir une protection que l'infrastructure actuelle ne fournit pas.",
  "privacy.donneesSupprimees":
    "Vos données locales ont été supprimées. La page d'accueil affichera un état neuf au prochain chargement.",
  "privacy.confirmerSuppression": "Confirmer la suppression",
  "privacy.annuler": "Annuler",
  "privacy.supprimerToutesMesDonnees": "Supprimer toutes mes données locales",

  "account.eyebrow": "Compte",
  "account.pasEncoreDisponible": "Pas encore disponible",
  "account.nonConfigureTitre": "Compte non configuré.",
  "account.nonConfigureTexte":
    "Cette fonctionnalité attend qu'un projet Supabase soit provisionné — une décision du fondateur, pas du code. Sans elle, la conversation reste pleinement utilisable en mode démo, sans mémoire d'une visite à l'autre.",
  "account.connecte": "Connecté·e",
  "account.seDeconnecter": "Se déconnecter",
  "account.seConnecter": "Se connecter",
  "account.lienTexte": "Un lien de connexion est envoyé par email — aucun mot de passe à retenir.",
  "account.lienEnvoyeAvant": "Lien envoyé à ",
  "account.lienEnvoyeApres": ". Ouvrez-le pour vous connecter.",
  "account.emailLabel": "Email",
  "account.envoiEnCours": "Envoi…",
  "account.recevoirLeLien": "Recevoir le lien",
  "account.echecEnvoi": "Échec de l'envoi du lien.",

  "nav.ciel": "Ciel",
  "ciel.eyebrow": "Astronomie",
  "ciel.titre": "La carte du ciel",
  "ciel.lead": "Les étoiles visibles au-dessus de vous, à cet instant précis.",
  "ciel.demoTitre": "Ciel de démonstration (Paris).",
  "ciel.demoTexte":
    "Ceci n'est pas le ciel au-dessus de vous — activez votre position pour voir le vôtre.",
  "ciel.voirMonCiel": "Voir le ciel au-dessus de moi",
  "ciel.cielReelTitre": "Le ciel au-dessus de vous, maintenant.",
  "ciel.geoIndisponible": "La géolocalisation n'est pas disponible sur cet appareil.",
  "ciel.domeAria": "Carte du ciel visible, nord en haut",
  "ciel.attribution":
    "Données astronomiques : d3-celestial (Olaf Frohn, BSD-3-Clause), dérivées du catalogue HYG.",
  "ciel.illumination": "{n}% éclairée",
  "lune.nouvelle": "Nouvelle lune",
  "lune.premier-croissant": "Premier croissant",
  "lune.premier-quartier": "Premier quartier",
  "lune.gibbeuse-croissante": "Gibbeuse croissante",
  "lune.pleine": "Pleine lune",
  "lune.gibbeuse-decroissante": "Gibbeuse décroissante",
  "lune.dernier-quartier": "Dernier quartier",
  "lune.dernier-croissant": "Dernier croissant",
};

export const EN: Partial<Record<CleI18n, string>> = {
  "nav.accueil": "Home",
  "nav.parler": "Talk",
  "nav.explorer": "Explore",
  "nav.univers": "Universes",
  "nav.ecouter": "Listen",
  "nav.compte": "Account",
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

  "chat.personnaliteActive": "Active personality",
  "chat.choisirPersonnalite": "Choose a personality",
  "chat.personnalitesDebloquees": "Unlocked personalities",
  "chat.connexion": "Connecting…",
  "chat.enLigne": "MANA · online",
  "chat.modeDemo": "Demo mode",
  "chat.conversationAvec": "Conversation with {nom}",
  "chat.demoNoticeTitre": "Demo mode.",
  "chat.demoNoticeTexte":
    "Replies come from a local script. Add MISTRAL_API_KEY for {nom}'s real voice.",
  "chat.bienvenueTexte": "Write what's on your mind — {nom} is here to listen.",
  "chat.vousLabel": "You: ",
  "chat.locuteurLabel": "{nom}: ",
  "chat.reessayer": "Retry",
  "chat.messageA": "Your message to {nom}",
  "chat.ecrireA": "Write to {nom}…",
  "chat.pointsVerrou": "{n} points",

  "explore.eyebrow": "Exploration",
  "explore.titre": "Explore the world",
  "explore.lead": "Places and experiences to live outdoors, near you.",
  "explore.chargementAria": "Loading discoveries",
  "explore.lieuxReelsTitre": "Real places around you",
  "explore.procheDe": "near {lieu}.",
  "explore.odbl": "Data © OpenStreetMap contributors (ODbL).",
  "explore.demoTitre": "Demonstration examples.",
  "explore.demoTexte": "Turn on real places around you, or browse the examples first.",
  "explore.decouvrirReels": "Discover real places around me (OpenStreetMap)",
  "explore.rechercherLabel": "Search for a place, a mood, an experience",
  "explore.recherchePlaceholder": "e.g.: dawn, walk, garden…",
  "explore.lieuxTitre": "Places to discover",
  "explore.aucunLieuOsm": "Explore another area to discover more places.",
  "explore.aucunResultat": "Try another word.",
  "explore.experiencesTitre": "Experiences to live",

  "exploreDetail.filAria": "Exploration trail",
  "exploreDetail.retourExplorer": "← Explore",
  "exploreDetail.lieuIntrouvableTitre": "Place not found",
  "exploreDetail.lieuIntrouvableTexte": "This place doesn't exist or is no longer available.",
  "exploreDetail.retourExplorationLien": "← Back to exploration",
  "exploreDetail.demoTitre": "Demonstration card.",
  "exploreDetail.demoTexte": "No real information (address, hours, access) is shown.",
  "exploreDetail.lieuReelTitre": "Real place",
  "exploreDetail.odblSuffixe": " — data © OpenStreetMap contributors (ODbL).",
  "exploreDetail.coordonnees": " Coordinates: {lat}, {lng}.",
  "exploreDetail.minutesAPied": " About {n} min walk from here.",
  "exploreDetail.bonsMomentsAria": "Recommended moments",
  "exploreDetail.bonsMomentsTitre": "Good moments",
  "exploreDetail.actionsAria": "Actions",
  "exploreDetail.plu": "Did you enjoy this place?",
  "exploreDetail.dejaDecouvert": "A lovely discovery, kept in your journal.",
  "exploreDetail.pasEncoreDecouvert": "Note it in your discovery journal.",
  "exploreDetail.decouvert": "Discovered ✓",
  "exploreDetail.jeLaiDecouvert": "I discovered it",
  "exploreDetail.enParlerAvecMana": "Talk about it with MANA",

  "experienceDetail.introuvableTitre": "Experience not found",
  "experienceDetail.introuvableTexte":
    "This experience doesn't exist or is no longer available.",
  "experienceDetail.eyebrow": "Experience · {intensite}",
  "experienceDetail.demoTitre": "Demonstration experience.",
  "experienceDetail.demoTexte":
    "This content is an example: its purpose is to inspire, not to describe a verified real place.",
  "experienceDetail.pratiqueAria": "Practical",
  "experienceDetail.leConcours": "Practicalities",
  "experienceDetail.minutes": "{n} minutes",
  "experienceDetail.pretTexte":
    "Ready to try it? Tell MANA about it to turn it into a small action plan.",
  "experienceDetail.preparerAvecMana": "Prepare this experience with MANA",

  "pantheon.eyebrow": "Universes",
  "pantheon.titre": "The pantheon",
  "pantheon.lead":
    "Each goddess has her voice and story. Your discoveries open new encounters.",
  "pantheon.demoTitre": "Demonstration personalities.",
  "pantheon.demoTexte": "Fictional universes, created for MANA.love.",
  "pantheon.parlerA": "Talk to {nom}",
  "pantheon.verrouillee": "Locked",
  "pantheon.points": "{n} points",
  "pantheon.histoireFiction": "Her story — fiction",

  "sleep.eyebrow": "MANA Sleep",
  "sleep.titre": "Slow down before night",
  "sleep.lead":
    "Three small steps toward sleep. No sound required, no autoplay — just you and your breath.",
  "sleep.step1Titre": "Set the day down",
  "sleep.step1Body":
    "Three slow breaths. With each exhale, let one thing from the day settle.",
  "sleep.step2Titre": "Name without judging",
  "sleep.step2Body": "Silently name what's on your mind. Not to solve it — just to see it.",
  "sleep.step3Titre": "Invite calm",
  "sleep.step3Body":
    "Imagine a calming place, real or imagined. Let your breath slow with each cycle.",
  "sleep.bonneNuit": "Good night.",
  "sleep.recommencer": "Start over",
  "sleep.parlerALuna": "Talk to Luna",
  "sleep.etapeCompteur": "Step {n} / {total} · about {secondes} seconds",
  "sleep.terminer": "Finish",
  "sleep.continuer": "Continue",
  "sleep.introTexte": "Three short steps to get ready for sleep.",
  "sleep.commencer": "Begin",
  "sleep.bientotTitre": "Coming soon.",
  "sleep.bientotTexte": "Guided voices are coming with MANA's audio.",

  "action.eyebrow": "MANA Action",
  "action.titre": "One small gesture that counts",
  "action.lead":
    "MANA isn't trying to keep you here. One action, today, in the real world — even a tiny one.",
  "action.sunlightTitre": "Three minutes of real sunlight",
  "action.sunlightBody":
    "Go outside for three minutes, no phone, and let the daylight find you. That's all.",
  "action.messageTitre": "A message you've been putting off",
  "action.messageBody":
    "That person you've been thinking about for weeks without writing? Thirty seconds, two lines, sent.",
  "action.thresholdTitre": "A threshold to cross",
  "action.thresholdBody":
    "Walk to the end of your street, then one more crossing. Come back a different way.",
  "action.beauGeste": "Nice gesture. Now go live it, outside.",
  "action.jeLeFaisAujourdhui": "I'm doing it today",
  "action.nouvelleBientot": "A new suggestion is coming soon.",
  "action.versionInitialeTitre": "Initial version.",
  "action.versionInitialeTexte":
    "Action suggestions will soon be personalized by MANA based on your conversations and discoveries.",
  "action.besoinEnParler": "Need to talk about it first?",
  "action.parlerAvecMana": "Talk with MANA",

  "radio.eyebrow": "MANAradio",
  "radio.titre": "Listen to the world",
  "radio.lead":
    "Soundscapes to accompany a calm moment — never on autoplay, always under your control.",
  "radio.bientotTitre": "Coming soon.",
  "radio.bientotTexte":
    "The catalog is coming — only sounds with clear rights. The entries below give a preview.",
  "radio.lectureIndisponible": "Playback unavailable for {titre}",
  "radio.indisponible": "▶ Unavailable",
  "radio.envieMomentCalme": "Want a calm moment before sleep?",
  "radio.manaSleep": "MANA Sleep",

  "privacy.titre": "Your data, in plain terms",
  "privacy.stockeTitre": "What is stored, today",
  "privacy.stockeTexte1":
    "In this first version, everything stays on your device, in your browser's local storage (localStorage): your conversations by personality, your visited places and your MANA points ledger. None of this leaves your device.",
  "privacy.stockeTexte2":
    "Two exceptions, already active today, that are NOT storage under your name: if you ask for real places around you, your coordinates pass through our server to OpenStreetMap, and stay in the server's memory for up to 10 minutes — to avoid repeating the same search, never to identify you; and if the assistant is connected to a model, the text of your messages passes through our server to our model provider, without being written there. In both cases, our server relays — it keeps no file on you.",
  "privacy.neFaisonsPasTitre": "What we don't do",
  "privacy.neFaisonsPas1": "We don't sell or share your data.",
  "privacy.neFaisonsPas2":
    "We don't reuse one personality's context in another without your explicit consent.",
  "privacy.neFaisonsPas3":
    "We don't design mechanics of dependency, guilt, or artificial jealousy.",
  "privacy.neFaisonsPas4":
    "We don't reward screen time, message volume, or repeatedly reopening the app.",
  "privacy.supprimerTitre": "Delete your data",
  "privacy.supprimerTexte":
    "You can erase all your local data at any time via the button below, or by clearing your browser's site data.",
  "privacy.supprimerNote":
    "Honest note: in this version, deletion only covers this browser's local storage. Once a backend is in place, deletion will extend to server data.",
  "privacy.securiteTitre": "Security",
  "privacy.securiteTexte":
    "No additional encryption is implemented beyond your browser's and device's own. We don't claim a protection the current infrastructure doesn't provide.",
  "privacy.donneesSupprimees":
    "Your local data has been deleted. The home page will show a fresh state on next load.",
  "privacy.confirmerSuppression": "Confirm deletion",
  "privacy.annuler": "Cancel",
  "privacy.supprimerToutesMesDonnees": "Delete all my local data",

  "account.eyebrow": "Account",
  "account.pasEncoreDisponible": "Not yet available",
  "account.nonConfigureTitre": "Account not configured.",
  "account.nonConfigureTexte":
    "This feature awaits a Supabase project being provisioned — a founder's decision, not a code change. Without it, conversation remains fully usable in demo mode, with no memory from one visit to the next.",
  "account.connecte": "Signed in",
  "account.seDeconnecter": "Sign out",
  "account.seConnecter": "Sign in",
  "account.lienTexte": "A sign-in link is sent by email — no password to remember.",
  "account.lienEnvoyeAvant": "Link sent to ",
  "account.lienEnvoyeApres": ". Open it to sign in.",
  "account.emailLabel": "Email",
  "account.envoiEnCours": "Sending…",
  "account.recevoirLeLien": "Receive the link",
  "account.echecEnvoi": "Failed to send the link.",

  "nav.ciel": "Sky",
  "ciel.eyebrow": "Astronomy",
  "ciel.titre": "The sky map",
  "ciel.lead": "The stars visible above you, right now.",
  "ciel.demoTitre": "Demonstration sky (Paris).",
  "ciel.demoTexte":
    "This isn't the sky above you — turn on your location to see your own.",
  "ciel.voirMonCiel": "See the sky above me",
  "ciel.cielReelTitre": "The sky above you, right now.",
  "ciel.geoIndisponible": "Geolocation isn't available on this device.",
  "ciel.domeAria": "Visible sky map, north at the top",
  "ciel.attribution":
    "Astronomical data: d3-celestial (Olaf Frohn, BSD-3-Clause), derived from the HYG catalog.",
  "ciel.illumination": "{n}% illuminated",
  "lune.nouvelle": "New moon",
  "lune.premier-croissant": "Waxing crescent",
  "lune.premier-quartier": "First quarter",
  "lune.gibbeuse-croissante": "Waxing gibbous",
  "lune.pleine": "Full moon",
  "lune.gibbeuse-decroissante": "Waning gibbous",
  "lune.dernier-quartier": "Last quarter",
  "lune.dernier-croissant": "Waning crescent",
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
