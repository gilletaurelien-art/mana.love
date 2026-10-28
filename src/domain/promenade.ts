/**
 * Domaine : la promenade — contrat du fichier de graphe et composition.
 *
 * Doctrine (cadrage du 28/10/2026) :
 * - le produit n'est pas les sentiers, c'est la promenade : on COMPOSE,
 *   on ne consulte pas un catalogue ;
 * - l'app consomme des FICHIERS de graphe produits par le pipeline,
 *   jamais la base ;
 * - la boucle se construit en trois parties : vers l'entrée du lieu,
 *   l'arête du lieu, puis le retour ;
 * - null ≠ 0 ≠ plat ≠ sans marée : l'app lit l'état, jamais ne suppose ;
 * - sans dénivelé, la durée annoncée est un PLANCHER et se dit comme tel ;
 * - la fraction le long de l'arête est une CLÉ D'ORDRE, pas une distance ;
 * - l'attribution ODbL vit DANS l'artefact, pas seulement à l'écran.
 */

/** [lon, lat] — tous les points, jonctions comprises. */
export type PointGraphe = readonly [number, number];

/** Une arête du graphe de chemins. */
export interface AreteGraphe {
  index: number;
  /** Nœud de départ (index dans n). */
  a: number;
  /** Nœud d'arrivée (index dans n). */
  b: number;
  /** Longueur en mètres. */
  metres: number;
  /** Agrément (barème TÉMOIN : hypothèse non validée en marchant). */
  agrement: number;
  /** Indices des points dans n, dans l'ordre de l'arête. */
  points: readonly number[];
  /** Classe de voie (index dans le vocabulaire des voies du territoire). */
  voie: number;
  /** Revêtement (index dans surfaces), null = inconnu — l'état DOMINANT. */
  surface: number | null;
  /**
   * Distance à la mer en mètres, plafonnée à 2000 (= « au moins 2 km »).
   * null = inconnu. 2000 ≠ null : « loin » est une valeur, pas une absence.
   */
  distMerM: number | null;
  /** Dénivelé a→b en mètres. null = pas de MNT lu sur ce territoire. */
  dzM: number | null;
  /** Marée (index dans le vocabulaire), null = pas de source officielle. */
  maree: number | null;
}

/** Un lieu accroché à une ARÊTE, pas à un nœud. */
export interface LieuAccroche {
  /** Index de l'arête portante. */
  arete: number;
  /**
   * Fraction le long de l'arête : CLÉ D'ORDRE, pas une distance.
   * Préserve l'ordre, fausse la distance — ne JAMAIS l'afficher en mètres.
   */
  fraction: number;
  nom: string;
  categorie: string;
}

/** Le fichier de graphe d'un territoire, tel que produit par le pipeline. */
export interface GrapheTerritoire {
  territoire: string;
  /** Attribution portée PAR L'ARTEFACT (ODbL pour un graphe OSM réel). */
  attribution: string;
  voies: readonly string[];
  surfaces: readonly string[];
  schema_arete: readonly string[];
  /** Tous les points, jonctions comprises. */
  n: readonly PointGraphe[];
  a: readonly AreteGraphe[];
  l: readonly LieuAccroche[];
}

/** Brute JSON d'un fichier de graphe (tableaux positionnels). */
export interface GrapheBrut {
  territoire: string;
  attribution: string;
  voies: string[];
  surfaces: string[];
  schema_arete: string[];
  n: Array<[number, number]>;
  a: Array<
    [
      number,
      number,
      number,
      number,
      number[],
      number,
      number | null,
      number | null,
      number | null,
      number | null
    ]
  >;
  l: Array<[number, number, string, string]>;
}

export function parseGraphe(brut: GrapheBrut): GrapheTerritoire {
  if (brut.schema_arete.join(",") !==
      "a,b,metres,agrement,points,voie,surface|null,dist_mer_m|null,dz_m|null,maree|null") {
    throw new Error(
      `Schéma d'arête non reconnu pour « ${brut.territoire} » — le pipeline et l'app ne parlent pas le même contrat.`
    );
  }
  return {
    territoire: brut.territoire,
    attribution: brut.attribution,
    voies: brut.voies,
    surfaces: brut.surfaces,
    schema_arete: brut.schema_arete,
    n: brut.n,
    a: brut.a.map((e, index) => ({
      index,
      a: e[0],
      b: e[1],
      metres: e[2],
      agrement: e[3],
      points: e[4],
      voie: e[5],
      surface: e[6],
      distMerM: e[7],
      dzM: e[8],
      maree: e[9],
    })),
    l: brut.l.map((lieu) => ({
      arete: lieu[0],
      fraction: lieu[1],
      nom: lieu[2],
      categorie: lieu[3],
    })),
  };
}

/** Distance à vol d'oiseau entre deux points, en mètres. */
export function distanceMetres(p1: PointGraphe, p2: PointGraphe): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (p2[1] - p1[1]) * rad;
  const dLon = (p2[0] - p1[0]) * rad;
  const lat1 = p1[1] * rad;
  const lat2 = p2[1] * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Piège Crozon : n contient TOUS les points, mais seule une minorité porte
 * des arêtes. Chercher le départ parmi les 64 028 points rend un nœud à
 * zéro arête — zéro boucle, en silence. Le départ se cherche UNIQUEMENT
 * parmi les nœuds qui portent des arêtes.
 */
export function noeudsPortantAretes(graphe: GrapheTerritoire): Set<number> {
  const porteurs = new Set<number>();
  for (const arete of graphe.a) {
    porteurs.add(arete.a);
    porteurs.add(arete.b);
  }
  return porteurs;
}

export function noeudDepartLePlusProche(
  graphe: GrapheTerritoire,
  coords: PointGraphe
): number | null {
  const porteurs = noeudsPortantAretes(graphe);
  if (porteurs.size === 0) return null;
  let meilleur: number | null = null;
  let meilleureDistance = Infinity;
  for (const index of porteurs) {
    const d = distanceMetres(graphe.n[index], coords);
    if (d < meilleureDistance) {
      meilleureDistance = d;
      meilleur = index;
    }
  }
  return meilleur;
}

/**
 * Entrée du lieu sur son arête : la fraction est une clé d'ordre —
 * ≤ 0,5 signifie que le lieu est atteint depuis l'extrémité a en premier.
 */
export function entreeDuLieu(
  graphe: GrapheTerritoire,
  lieu: LieuAccroche
): { entree: number; sortie: number } {
  const arete = graphe.a[lieu.arete];
  return lieu.fraction <= 0.5
    ? { entree: arete.a, sortie: arete.b }
    : { entree: arete.b, sortie: arete.a };
}

function plusCourtChemin(
  graphe: GrapheTerritoire,
  depuis: number,
  vers: number
): number[] | null {
  const dist = new Map<number, number>();
  const precedent = new Map<number, { noeud: number; arete: number }>();
  const visits = new Set<number>();
  dist.set(depuis, 0);

  while (true) {
    let courant: number | null = null;
    let meilleurDist = Infinity;
    for (const [noeud, d] of dist) {
      if (!visits.has(noeud) && d < meilleurDist) {
        meilleurDist = d;
        courant = noeud;
      }
    }
    if (courant === null) break;
    if (courant === vers) break;
    visits.add(courant);

    for (const arete of graphe.a) {
      const voisin = arete.a === courant ? arete.b : arete.b === courant ? arete.a : null;
      if (voisin === null) continue;
      const d = meilleurDist + arete.metres;
      if (d < (dist.get(voisin) ?? Infinity)) {
        dist.set(voisin, d);
        precedent.set(voisin, { noeud: courant, arete: arete.index });
      }
    }
  }

  if (!dist.has(vers)) return null;
  const aretes: number[] = [];
  let curseur = vers;
  while (curseur !== depuis) {
    const pas = precedent.get(curseur);
    if (!pas) return null;
    aretes.unshift(pas.arete);
    curseur = pas.noeud;
  }
  return aretes;
}

/** Une boucle composée : les arêtes dans l'ordre de la marche. */
export interface Boucle {
  /** Arêtes parcourues, en trois parties : aller, arête du lieu, retour. */
  aretes: readonly number[];
  metres: number;
  /**
   * Montée cumulée en mètres, null si un seul tronçon manque de dénivelé.
   * Sans MNT, la durée est un PLANCHER.
   */
  monteeM: number | null;
  agrementTotal: number;
  lieu: LieuAccroche;
}

/**
 * Compose la promenade en trois parties :
 * 1. le chemin vers l'entrée du lieu,
 * 2. l'arête du lieu (on la PARCOURT — s'y arrêter à côté ne la dessert pas),
 * 3. le chemin du retour.
 * Renvoie null si le graphe ne relie pas le départ au lieu — honnêtement.
 */
export function composerBoucle(
  graphe: GrapheTerritoire,
  depart: number,
  lieu: LieuAccroche
): Boucle | null {
  const areteLieu = graphe.a[lieu.arete];
  if (!areteLieu) return null;
  const { entree, sortie } = entreeDuLieu(graphe, lieu);

  const aller = plusCourtChemin(graphe, depart, entree);
  if (aller === null) return null;
  const retour = plusCourtChemin(graphe, sortie, depart);
  if (retour === null) return null;

  const aretes = [...aller, areteLieu.index, ...retour];
  const metres = aretes.reduce((s, i) => s + graphe.a[i].metres, 0);
  const agrementTotal = aretes.reduce((s, i) => s + graphe.a[i].agrement, 0);

  let monteeM = 0;
  let dzInconnu = false;
  for (const index of aretes) {
    const arete = graphe.a[index];
    if (arete.dzM === null) {
      dzInconnu = true;
      continue;
    }
    monteeM += Math.max(0, arete.dzM);
  }
  if (dzInconnu) monteeM = Number.NaN;

  return {
    aretes,
    metres,
    monteeM: dzInconnu ? null : monteeM,
    agrementTotal,
    lieu,
  };
}

/**
 * Naismith : 1 h = 3 km de plat, 1 m de montée ≡ 5 m de plat.
 * Sans dénivelé (monteeM null), il ne reste qu'une moitié d'équation :
 * la durée est un PLANCHER et doit se dire comme telle — un « 3,7 h »
 * affiché sans relief fait partir quelqu'un trop tard.
 */
export function dureeNaismith(
  metres: number,
  monteeM: number | null
): { heures: number; plancher: boolean } {
  const eq = metres + (monteeM ?? 0) * 5;
  return { heures: eq / 3000, plancher: monteeM === null };
}

/**
 * « Loin de la mer » est une VALEUR, pas une absence :
 * la distance est plafonnée (2000 = au moins 2 km), jamais annulée.
 * null = inconnu — une case distincte.
 */
export function lireDistanceMer(distMerM: number | null): string {
  if (distMerM === null) return "distance à la mer inconnue";
  if (distMerM >= 2000) return "au moins 2 km de la mer";
  if (distMerM >= 1000) return `${(distMerM / 1000).toFixed(1).replace(".", ",")} km de la mer`;
  return `${Math.round(distMerM)} m de la mer`;
}

/** Aucune source de marée = AUCUN avertissement de marée, jamais simulé. */
export function avertissementsMaree(graphe: GrapheTerritoire): string[] {
  const sansSource = graphe.a.every((arete) => arete.maree === null);
  if (sansSource) return [];
  return ["Vérifiez les horaires de marée auprès des sources officielles avant un passage d'estran."];
}
