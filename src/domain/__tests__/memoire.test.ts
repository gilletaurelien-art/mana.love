import { describe, it, expect } from "vitest";
import {
  calculerExpiration,
  estOperant,
  souvenirsOperants,
  DUREE_JOURS_PAR_GENRE,
  type SouvenirDeclare,
} from "../memoire";

const J = (n: number) => n * 24 * 60 * 60 * 1000;
const T0 = "2026-01-01T00:00:00.000Z";

function souvenir(partial: Partial<SouvenirDeclare>): SouvenirDeclare {
  return {
    id: "s1",
    genre: "rappel",
    texte: "aime la mer",
    confirmeLe: T0,
    expireLe: calculerExpiration("rappel", T0),
    desactiveLe: null,
    ...partial,
  };
}

describe("durées de péremption par genre — la minimisation du produit", () => {
  it("reprend les quatre durées mesurées sur le build servi, à l'identique", () => {
    expect(DUREE_JOURS_PAR_GENRE.preference).toBe(365);
    expect(DUREE_JOURS_PAR_GENRE.intention).toBe(30);
    expect(DUREE_JOURS_PAR_GENRE.rappel).toBe(30);
    expect(DUREE_JOURS_PAR_GENRE.contexte).toBeNull();
  });
});

describe("calculerExpiration", () => {
  it("ajoute exactement la durée du genre, en jours", () => {
    const expire = calculerExpiration("intention", T0);
    expect(Date.parse(expire!) - Date.parse(T0)).toBe(J(30));
  });

  it("le genre « contexte » n'expire jamais", () => {
    expect(calculerExpiration("contexte", T0)).toBeNull();
  });
});

describe("estOperant", () => {
  it("un souvenir fraîchement confirmé est opérant", () => {
    const s = souvenir({ genre: "rappel", confirmeLe: T0, expireLe: calculerExpiration("rappel", T0) });
    expect(estOperant(s, T0)).toBe(true);
  });

  it("un souvenir expiré n'est plus opérant", () => {
    const s = souvenir({ genre: "rappel", confirmeLe: T0, expireLe: calculerExpiration("rappel", T0) });
    const apresExpiration = new Date(Date.parse(T0) + J(31)).toISOString();
    expect(estOperant(s, apresExpiration)).toBe(false);
  });

  it("🔴 désactiver ≠ supprimer — un souvenir désactivé n'est pas opérant, même non expiré", () => {
    const s = souvenir({
      genre: "contexte",
      confirmeLe: T0,
      expireLe: null,
      desactiveLe: T0,
    });
    expect(estOperant(s, T0)).toBe(false);
  });

  it("le genre « contexte » reste opérant indéfiniment tant qu'il n'est pas désactivé", () => {
    const s = souvenir({ genre: "contexte", confirmeLe: T0, expireLe: null, desactiveLe: null });
    const dansDixAns = new Date(Date.parse(T0) + J(3652)).toISOString();
    expect(estOperant(s, dansDixAns)).toBe(true);
  });
});

describe("souvenirsOperants", () => {
  it("écarte les souvenirs désactivés et périmés, garde les autres", () => {
    // "sans_expiration" survit (genre contexte) ; "perime" (rappel, 30j) et
    // "desactive" sont écartés à +31 jours — un seul doit rester.
    const sansExpiration = souvenir({ id: "sans_expiration", genre: "contexte", confirmeLe: T0, expireLe: null });
    const perime = souvenir({ id: "perime", confirmeLe: T0, expireLe: calculerExpiration("rappel", T0) });
    const desactive = souvenir({ id: "desactive", confirmeLe: T0, desactiveLe: T0 });
    const maintenant = new Date(Date.parse(T0) + J(31)).toISOString();

    const resultat = souvenirsOperants([sansExpiration, perime, desactive], maintenant);
    expect(resultat.map((s) => s.id)).toEqual(["sans_expiration"]);
  });

  it("trie les souvenirs opérants du plus récemment confirmé au plus ancien", () => {
    const vieux = souvenir({ id: "vieux", genre: "contexte", confirmeLe: T0, expireLe: null });
    const recentLe = new Date(Date.parse(T0) + J(5)).toISOString();
    const recent = souvenir({ id: "recent", genre: "contexte", confirmeLe: recentLe, expireLe: null });

    const resultat = souvenirsOperants([vieux, recent], recentLe);
    expect(resultat.map((s) => s.id)).toEqual(["recent", "vieux"]);
  });

  it("⛔ un souvenir périmé ou désactivé n'apparaît jamais dans la liste — c'est le seul filtre que le prompt système doit faire confiance", () => {
    const perime = souvenir({ id: "p", confirmeLe: T0, expireLe: calculerExpiration("rappel", T0) });
    const maintenant = new Date(Date.parse(T0) + J(31)).toISOString();
    expect(souvenirsOperants([perime], maintenant)).toHaveLength(0);
  });
});
