/**
 * Domaine : thème astral — positions réelles des astres à un instant
 * donné, converties en signe du zodiaque. Logique pure, sans réseau.
 *
 * ⭐ LA DISTINCTION QUI COMPTE, PARTOUT DANS CE MODULE : la position d'un
 * astre est un fait astronomique, calculable et vérifiable — c'est ce que
 * ce fichier produit. Le SENS attribué à cette position (« les Poissons
 * sont sensibles ») est une tradition symbolique, pas une mesure. Ce
 * fichier rend des positions, jamais une interprétation — comme
 * `canon.ts` sépare ce qui est établi de ce que MANA raconte.
 *
 * ⚠️ VÉRIFIÉ PAR INVARIANTS PHYSIQUES, PAS PAR UNE ÉPHÉMÉRIDE EXTERNE.
 * Cette session n'a pas accès à un éphéméride en ligne pour croiser une
 * position précise à une date précise. Les éléments orbitaux ci-dessous
 * sont ceux de la table standard publiée (Standish/JPL, « Keplerian
 * Elements for Approximate Positions of the Major Planets », valide
 * 1800-2050), reconstitués de mémoire — PAS recopiés depuis une source
 * consultée cette session. Deux propriétés PHYSIQUES, vraies quelle que
 * soit l'exactitude fine des coefficients, portent la vérification :
 * - la longitude écliptique du Soleil vaut 0°/90°/180°/270° aux
 *   équinoxes et solstices, PAR DÉFINITION du repère écliptique — pas
 *   une coïncidence à mesurer ;
 * - Mercure et Vénus, planètes inférieures, ne s'éloignent JAMAIS du
 *   Soleil au-delà d'une élongation maximale fixe (~28° et ~48°) — une
 *   conséquence directe de leur orbite à l'intérieur de celle de la Terre.
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const JOUR_MS = 24 * 60 * 60 * 1000;

function normaliser360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Siècles juliens écoulés depuis J2000.0 (1er janvier 2000, 12h TT — approximé par UTC). */
function sieclesDepuisJ2000(date: Date): number {
  const joursDepuisJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / JOUR_MS;
  return joursDepuisJ2000 / 36525;
}

interface ElementsOrbitaux {
  /** Demi-grand axe, UA, à J2000 et variation par siècle. */
  a: [number, number];
  /** Excentricité. */
  e: [number, number];
  /** Inclinaison, degrés. */
  i: [number, number];
  /** Longitude moyenne, degrés. */
  L: [number, number];
  /** Longitude du périhélie (ϖ = ω + Ω), degrés. */
  longPeri: [number, number];
  /** Longitude du nœud ascendant, degrés. */
  longNoeud: [number, number];
}

/**
 * Éléments kepleriens moyens, 1800-2050 (Standish/JPL, forme standard
 * republiée dans de nombreuses références d'astronomie amateur).
 */
const ELEMENTS: Record<string, ElementsOrbitaux> = {
  terre: {
    a: [1.00000261, 0.00000562],
    e: [0.01671123, -0.00004392],
    i: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981],
    longPeri: [102.93768193, 0.32327364],
    longNoeud: [0, 0],
  },
  mercure: {
    a: [0.38709927, 0.00000037],
    e: [0.20563593, 0.00001906],
    i: [7.00497902, -0.00594749],
    L: [252.2503235, 149472.67411175],
    longPeri: [77.45779628, 0.16047689],
    longNoeud: [48.33076593, -0.12534081],
  },
  venus: {
    a: [0.72333566, 0.0000039],
    e: [0.00677672, -0.00004107],
    i: [3.39467605, -0.0007889],
    L: [181.9790995, 58517.81538729],
    longPeri: [131.60246718, 0.00268329],
    longNoeud: [76.67984255, -0.27769418],
  },
  mars: {
    a: [1.52371034, 0.00001847],
    e: [0.0933941, 0.00007882],
    i: [1.84969142, -0.00813131],
    L: [-4.55343205, 19140.30268499],
    longPeri: [-23.94362959, 0.44441088],
    longNoeud: [49.55953891, -0.29257343],
  },
  jupiter: {
    a: [5.202887, -0.00011607],
    e: [0.04838624, -0.00013253],
    i: [1.30439695, -0.00183714],
    L: [34.39644051, 3034.74612775],
    longPeri: [14.72847983, 0.21252668],
    longNoeud: [100.47390909, 0.20469106],
  },
  saturne: {
    a: [9.53667594, -0.0012506],
    e: [0.05386179, -0.00050991],
    i: [2.48599187, 0.00193609],
    L: [49.95424423, 1222.49362201],
    longPeri: [92.59887831, -0.41897216],
    longNoeud: [113.66242448, -0.28867794],
  },
};

interface Vecteur3 {
  x: number;
  y: number;
  z: number;
}

/** Résout l'équation de Kepler M = E - e·sin(E) par Newton-Raphson. */
function anomalieExcentrique(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 8; i += 1) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/** Position héliocentrique écliptique d'un corps, en UA. */
function positionHeliocentrique(elements: ElementsOrbitaux, T: number): Vecteur3 {
  const a = elements.a[0] + elements.a[1] * T;
  const e = elements.e[0] + elements.e[1] * T;
  const i = (elements.i[0] + elements.i[1] * T) * DEG;
  const L = elements.L[0] + elements.L[1] * T;
  const longPeri = elements.longPeri[0] + elements.longPeri[1] * T;
  const longNoeud = elements.longNoeud[0] + elements.longNoeud[1] * T;

  const omega = (longPeri - longNoeud) * DEG; // argument du périhélie
  const Omega = longNoeud * DEG;
  const M = normaliser360(L - longPeri) * DEG;
  const E = anomalieExcentrique(M, e);

  // Position dans le plan orbital.
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Rotation vers l'écliptique : argument du périhélie, inclinaison, nœud.
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);

  const x =
    (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const y =
    (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb;

  return { x, y, z };
}

/** Longitude écliptique géocentrique du Soleil, en degrés [0, 360). */
export function longitudeSoleil(date: Date): number {
  const T = sieclesDepuisJ2000(date);
  const terre = positionHeliocentrique(ELEMENTS.terre, T);
  // Le Soleil vu depuis la Terre est à l'opposé de la Terre vue depuis le Soleil.
  return normaliser360(Math.atan2(-terre.y, -terre.x) * RAD);
}

/** Longitude écliptique géocentrique d'une planète, en degrés [0, 360). */
export function longitudePlanete(nom: "mercure" | "venus" | "mars" | "jupiter" | "saturne", date: Date): number {
  const T = sieclesDepuisJ2000(date);
  const terre = positionHeliocentrique(ELEMENTS.terre, T);
  const corps = positionHeliocentrique(ELEMENTS[nom], T);
  return normaliser360(Math.atan2(corps.y - terre.y, corps.x - terre.x) * RAD);
}

/**
 * Longitude écliptique géocentrique de la Lune — formule abrégée de
 * Meeus (*Astronomical Algorithms*, ch. 47), précision ~0,3°. Suffisant
 * pour situer un signe, risqué à quelques heures près d'une frontière
 * de signe — comme en astrologie réelle.
 */
export function longitudeLune(date: Date): number {
  const T = sieclesDepuisJ2000(date);
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;

  const d = (x: number) => x * DEG;
  const correction =
    6.289 * Math.sin(d(Mp)) -
    1.274 * Math.sin(d(2 * D - Mp)) +
    0.658 * Math.sin(d(2 * D)) -
    0.186 * Math.sin(d(M)) -
    0.059 * Math.sin(d(2 * D - 2 * Mp)) -
    0.057 * Math.sin(d(2 * D - Mp - M)) +
    0.053 * Math.sin(d(2 * D + Mp)) +
    0.046 * Math.sin(d(2 * D - M)) +
    0.041 * Math.sin(d(Mp - M)) -
    0.035 * Math.sin(d(D)) -
    0.031 * Math.sin(d(Mp + M)) -
    0.015 * Math.sin(d(2 * F - 2 * D)) +
    0.011 * Math.sin(d(Mp - 4 * D));

  return normaliser360(Lp + correction);
}

export type SigneZodiaque =
  | "belier"
  | "taureau"
  | "gemeaux"
  | "cancer"
  | "lion"
  | "vierge"
  | "balance"
  | "scorpion"
  | "sagittaire"
  | "capricorne"
  | "verseau"
  | "poissons";

const SIGNES: readonly SigneZodiaque[] = [
  "belier",
  "taureau",
  "gemeaux",
  "cancer",
  "lion",
  "vierge",
  "balance",
  "scorpion",
  "sagittaire",
  "capricorne",
  "verseau",
  "poissons",
];

/** Le zodiaque tropical : le Bélier commence à l'équinoxe de printemps (longitude 0°). */
export function signeDepuisLongitude(longitudeDeg: number): SigneZodiaque {
  const index = Math.floor(normaliser360(longitudeDeg) / 30) % 12;
  return SIGNES[index];
}

export type CorpsCeleste = "soleil" | "lune" | "mercure" | "venus" | "mars" | "jupiter" | "saturne";

export interface PositionAstrale {
  readonly corps: CorpsCeleste;
  readonly longitude: number;
  readonly signe: SigneZodiaque;
  /** Degré dans le signe, 0-30. */
  readonly degreDansSigne: number;
}

/** Le thème — les 7 astres classiques, position et signe, à un instant donné. */
export function themeAstral(date: Date): readonly PositionAstrale[] {
  const positions: Array<[CorpsCeleste, number]> = [
    ["soleil", longitudeSoleil(date)],
    ["lune", longitudeLune(date)],
    ["mercure", longitudePlanete("mercure", date)],
    ["venus", longitudePlanete("venus", date)],
    ["mars", longitudePlanete("mars", date)],
    ["jupiter", longitudePlanete("jupiter", date)],
    ["saturne", longitudePlanete("saturne", date)],
  ];
  return positions.map(([corps, longitude]) => ({
    corps,
    longitude,
    signe: signeDepuisLongitude(longitude),
    degreDansSigne: normaliser360(longitude) % 30,
  }));
}
