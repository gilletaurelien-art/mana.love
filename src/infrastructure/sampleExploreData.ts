import type { Place, Experience } from "@/domain/exploration";

/**
 * DEMONSTRATION DATA ONLY.
 *
 * These places and experiences are illustrative sample content used to
 * demonstrate the Explore experience. They do NOT carry real coordinates,
 * opening hours, distances or travel times, and must not be presented
 * as verified real-world information. Real geographic data (POI providers,
 * PostGIS, routing) is a future integration — see README.
 */

export const SAMPLE_PLACES: readonly Place[] = [
  {
    id: "sample-place-1",
    name: "Le chemin des falaises",
    region: "Rivage atlantique (exemple)",
    kind: "path",
    summary: "Une marche au bord du vide, où le vent remet les idées en place.",
    description:
      "Cet exemple illustre un lieu de type « sentier ». Dans la version finale, cette fiche affichera des informations réelles : localisation, points d'intérêt proches, meilleures saisons — alimentées par des services géographiques fiables.",
    bestMoments: ["À la première heure", "Après la pluie"],
    tags: ["marche", "mer", "vent"],
  },
  {
    id: "sample-place-2",
    name: "Le jardin aux herbes sauvages",
    region: "Ville de plaine (exemple)",
    kind: "garden",
    summary: "Un carré de ville où l'on s'assoit et où le temps ralentit.",
    description:
      "Cet exemple illustre un lieu de type « jardin ». Les données réelles (horaires, accessibilité, commodités) arriveront avec l'intégration des services de données géographiques.",
    bestMoments: ["Fin d'après-midi", "En semaine"],
    tags: ["jardin", "ville", "pause"],
  },
  {
    id: "sample-place-3",
    name: "Le point de vue des brumes",
    region: "Collines (exemple)",
    kind: "viewpoint",
    summary: "Un belvédère discret d'où l'on voit le jour se lever sur la vallée.",
    description:
      "Cet exemple illustre un lieu de type « belvédère ». Aucune donnée d'accès réelle n'est fournie volontairement tant que la source de données n'est pas branchée.",
    bestMoments: ["À l'aube", "Par temps clair"],
    tags: ["aube", "panorama"],
  },
  {
    id: "sample-place-4",
    name: "L'étang aux reflets",
    region: "Lisière de forêt (exemple)",
    kind: "water",
    summary: "Une eau calme qui double la lumière du ciel.",
    description:
      "Cet exemple illustre un lieu de type « plan d'eau ». Les informations de sécurité et d'accès seront ajoutées avec les données réelles.",
    bestMoments: ["Soir d'été", "Automne"],
    tags: ["eau", "calme"],
  },
];

export const SAMPLE_EXPERIENCES: readonly Experience[] = [
  {
    id: "sample-exp-1",
    title: "Marcher sans destination",
    summary: "Laisser une rue choisir le chemin pendant vingt minutes.",
    description:
      "Une expérience d'exemple : sortir sans itinéraire, tourner à chaque carrefour selon une règle simple (par exemple : toujours la deuxième à gauche), et noter ce que l'on remarque. La curiosité fait le reste.",
    durationMinutes: 20,
    intensity: "gentle",
    tags: ["marche", "ville", "curiosité"],
  },
  {
    id: "sample-exp-2",
    title: "Le picnic d'un seul mètre carré",
    summary: "Explorer à fond un tout petit espace de nature.",
    description:
      "Une expérience d'exemple : s'asseoir au bord d'un chemin, délimiter un carré d'un mètre, et y passer quinze minutes à observer tout ce qui s'y passe — insectes, plantes, lumières. Un microscope d'attention.",
    durationMinutes: 15,
    intensity: "gentle",
    tags: ["nature", "attention"],
  },
  {
    id: "sample-exp-3",
    title: "Saluer trois inconnus",
    summary: "Trois micro-rencontres volontaires dans la journée.",
    description:
      "Une expérience d'exemple : dans la journée, adresser trois fois quelques mots aimables à des inconnus — un commerçant, un promeneur, un voisin. Compter les sourires obtenus.",
    durationMinutes: 5,
    intensity: "moderate",
    tags: ["rencontre", "courage"],
  },
  {
    id: "sample-exp-4",
    title: "Le coucher de soleil mérité",
    summary: "Gagner un point de vue et y assister jusqu'au bout.",
    description:
      "Une expérience d'exemple : trouver un endroit dégagé accessible en moins d'une heure, y montrer avant l'heure dorée, et rester jusqu'à ce que la lumière ait fini sa journée.",
    durationMinutes: 60,
    intensity: "immersive",
    tags: ["aube/crépuscule", "panorama"],
  },
];
