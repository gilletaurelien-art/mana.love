import { describe, it, expect } from "vitest";
import { compteConfigure, envoyerLienMagique, obtenirSession, seDeconnecter } from "../supabaseAuth";

/**
 * L'environnement de test ne pose jamais VITE_SUPABASE_URL/ANON_KEY (comme
 * MISTRAL_API_KEY n'est pas posée pour les tests serveur) : ces tests
 * vérifient l'état honnête "non configuré", sans réseau.
 */

describe("compteConfigure", () => {
  it("🔴 false sans les deux variables d'environnement — pas de repli silencieux", () => {
    expect(compteConfigure()).toBe(false);
  });
});

describe("envoyerLienMagique — non configuré", () => {
  it("renvoie ok:false avec un message explicite, aucun appel réseau", async () => {
    const resultat = await envoyerLienMagique("quelqu'un@example.com");
    expect(resultat).toEqual({ ok: false, erreur: "Compte non configuré." });
  });
});

describe("obtenirSession / seDeconnecter — non configuré", () => {
  it("obtenirSession renvoie null", async () => {
    expect(await obtenirSession()).toBeNull();
  });

  it("seDeconnecter ne lève pas", async () => {
    await expect(seDeconnecter()).resolves.toBeUndefined();
  });
});
