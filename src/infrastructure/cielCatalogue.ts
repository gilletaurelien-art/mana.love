import type { Etoile } from "@/domain/ciel";

/**
 * Charge le catalogue d'étoiles et de constellations servi statiquement
 * (`public/ciel/*.json`) — jamais une API tierce. Les fichiers sont
 * dérivés de d3-celestial (BSD-3-Clause, © Olaf Frohn), lui-même dérivé
 * du catalogue HYG (CC BY-SA 4.0) — voir `public/ciel/LICENSE-d3-celestial.txt`.
 * Filtré aux étoiles de magnitude ≤ 4.6 (visibles à l'œil nu en ciel peu
 * pollué) : 1018 étoiles sur les ~5000 du fichier source.
 */

export interface SegmentConstellation {
  readonly id: string;
  readonly segments: readonly (readonly (readonly [number, number])[])[];
}

export interface NomConstellation {
  readonly id: string;
  readonly nom: string;
  readonly centre: readonly [number, number];
}

export interface CatalogueCiel {
  readonly etoiles: readonly Etoile[];
  readonly lignes: readonly SegmentConstellation[];
  readonly noms: readonly NomConstellation[];
}

let cache: Promise<CatalogueCiel> | null = null;

export function chargerCatalogueCiel(): Promise<CatalogueCiel> {
  if (!cache) {
    cache = Promise.all([
      fetch("/ciel/etoiles.json").then((r) => r.json() as Promise<Etoile[]>),
      fetch("/ciel/constellations-lignes.json").then(
        (r) => r.json() as Promise<SegmentConstellation[]>
      ),
      fetch("/ciel/constellations-noms.json").then(
        (r) => r.json() as Promise<NomConstellation[]>
      ),
    ]).then(([etoiles, lignes, noms]) => ({ etoiles, lignes, noms }));
  }
  return cache;
}
