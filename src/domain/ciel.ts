/**
 * Domaine : astronomie — position des étoiles au-dessus d'un lieu, à un
 * instant donné. Logique pure, sans dépendance réseau ni DOM : elle reçoit
 * des coordonnées équatoriales (ascension droite, déclinaison — fixes,
 * mesurées une fois pour toutes dans le catalogue) et un lieu/instant
 * d'observation, et rend des coordonnées horizontales (altitude, azimut)
 * — ce qui dépend de QUI regarde, QUAND, D'OÙ.
 *
 * ⭐ Les coordonnées équatoriales ne bougent (presque) pas : une étoile a
 * toujours sensiblement la même ascension droite et déclinaison. C'est la
 * ROTATION DE LA TERRE qui fait que la même étoile est tantôt visible,
 * tantôt sous l'horizon — c'est ce que ce module calcule, à partir de
 * l'heure sidérale locale (LST), pas d'une API.
 *
 * Formules : temps sidéral de Greenwich (GMST) par l'approximation IAU
 * 1982 (Meeus, *Astronomical Algorithms*, ch. 12) ; conversion
 * équatorial → horizontal par la méthode classique (Duffett-Smith,
 * *Practical Astronomy with your Calculator*, ch. 25).
 */

export interface Etoile {
  readonly id: number;
  /** Magnitude apparente — plus la valeur est basse, plus l'étoile est brillante. */
  readonly mag: number;
  /** Ascension droite, en degrés (0-360). */
  readonly ra: number;
  /** Déclinaison, en degrés (-90 à 90). */
  readonly dec: number;
}

export interface Lieu {
  readonly latitude: number;
  readonly longitude: number;
}

export interface PositionHorizon {
  /** Hauteur au-dessus de l'horizon, en degrés. Négative = sous l'horizon. */
  readonly altitude: number;
  /** Azimut en degrés, mesuré depuis le nord, vers l'est (0 = nord, 90 = est). */
  readonly azimut: number;
}

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function joursJuliens(date: Date): number {
  // Meeus 7.1, valide pour toute date du calendrier grégorien.
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const jourDecimal =
    date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    jourDecimal +
    B -
    1524.5
  );
}

/** Temps sidéral de Greenwich, en degrés [0, 360). IAU 1982 (Meeus 12.2). */
function tempsSideralGreenwich(date: Date): number {
  const jj = joursJuliens(date);
  const T = (jj - 2451545.0) / 36525;
  let gmst =
    280.46061837 +
    360.98564736629 * (jj - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  gmst %= 360;
  return gmst < 0 ? gmst + 360 : gmst;
}

/** Temps sidéral LOCAL (apparent, approximé par le moyen), en degrés. */
export function tempsSideralLocal(date: Date, longitude: number): number {
  const lst = (tempsSideralGreenwich(date) + longitude) % 360;
  return lst < 0 ? lst + 360 : lst;
}

/**
 * Convertit une position équatoriale (ra, dec) en position horizontale
 * (altitude, azimut) pour un lieu et un instant d'observation donnés.
 *
 * ⭐ Invariant vérifiable sans aucune table de référence externe : pour un
 * observateur dans l'hémisphère nord, une étoile de déclinaison ≈ 90°
 * (quasi au pôle céleste nord, comme Polaris) a une ALTITUDE ≈ LATITUDE
 * de l'observateur, à toute heure — c'est la propriété que vérifie le test.
 */
export function positionHorizon(
  etoile: Pick<Etoile, "ra" | "dec">,
  lieu: Lieu,
  date: Date
): PositionHorizon {
  const lst = tempsSideralLocal(date, lieu.longitude);
  const angleHoraire = ((lst - etoile.ra + 360) % 360) * DEG;
  const dec = etoile.dec * DEG;
  const lat = lieu.latitude * DEG;

  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(angleHoraire);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const cosAz =
    (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) / (Math.cos(altitude) * Math.cos(lat));
  let azimut = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD;
  // Duffett-Smith ch. 25 : l'azimut calculé par acos() est ambigu (0-180°) ;
  // le signe du sinus de l'angle horaire lève l'ambiguïté.
  if (Math.sin(angleHoraire) > 0) azimut = 360 - azimut;

  return { altitude: altitude * RAD, azimut };
}

export interface EtoileProjetee extends Etoile {
  readonly altitude: number;
  readonly azimut: number;
}

/** Les étoiles du catalogue actuellement AU-DESSUS de l'horizon, avec leur position. */
export function etoilesVisibles(
  etoiles: readonly Etoile[],
  lieu: Lieu,
  date: Date
): EtoileProjetee[] {
  return etoiles
    .map((e) => ({ ...e, ...positionHorizon(e, lieu, date) }))
    .filter((e) => e.altitude > 0);
}

export interface PointDome {
  readonly x: number;
  readonly y: number;
}

/**
 * Projection azimutale équidistante — celle des planisphères papier :
 * le zénith (altitude 90°) au centre, l'horizon (altitude 0°) sur le
 * bord, aucune distorsion radiale. `rayon` est le rayon du dôme à
 * l'écran, en pixels.
 *
 * `null` si l'objet est sous l'horizon — il n'y a rien à dessiner.
 */
export function projeterSurDome(pos: PositionHorizon, rayon: number): PointDome | null {
  if (pos.altitude < 0) return null;
  const r = ((90 - pos.altitude) / 90) * rayon;
  const theta = pos.azimut * DEG;
  // Nord en haut (azimut 0 → y négatif), est à droite (azimut 90 → x positif).
  return { x: r * Math.sin(theta), y: -r * Math.cos(theta) };
}
