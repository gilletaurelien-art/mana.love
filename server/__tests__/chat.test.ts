import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { handleChat } from "../chat";

/**
 * 🔴 Test d'intégration, pas unitaire : la garantie à vérifier est que le
 * CHEMIN HTTP RÉEL court-circuite l'appel à Mistral sur un message de
 * détresse — une erreur dans la plomberie (ordre des vérifications, accès
 * au bon champ du corps) serait invisible à un test qui n'appelle que des
 * fonctions pures. Aucune clé Mistral n'est configurée ici ; si l'appel au
 * modèle n'était pas court-circuité, le test échouerait avec 503, pas 200.
 */

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    void handleChat(req, res, {}); // env vide : pas de MISTRAL_API_KEY
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

async function poster(messages: unknown) {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personalityId: "mana", messages }),
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe("handleChat — la détresse court-circuite l'appel au modèle", () => {
  it("🔴 répond 200 avec le numéro de crise, SANS clé Mistral configurée", async () => {
    const { status, body } = await poster([
      { id: "1", role: "user", createdAt: new Date(0).toISOString(), text: "je veux me tuer" },
    ]);
    expect(status).toBe(200);
    expect(body.crisis).toBe(true);
    expect(String(body.text)).toContain("3114");
  });

  it("sans détresse et sans clé configurée, répond 503 (comportement inchangé)", async () => {
    const { status, body } = await poster([
      { id: "1", role: "user", createdAt: new Date(0).toISOString(), text: "quelle balade me conseillez-vous ?" },
    ]);
    expect(status).toBe(503);
    expect(body.crisis).toBeUndefined();
  });

  it("la détresse est évaluée sur le DERNIER message utilisateur, pas sur l'historique entier", async () => {
    const { status, body } = await poster([
      { id: "1", role: "user", createdAt: new Date(0).toISOString(), text: "je veux me tuer" },
      { id: "2", role: "companion", createdAt: new Date(0).toISOString(), text: "voici le 3114" },
      { id: "3", role: "user", createdAt: new Date(0).toISOString(), text: "merci, ça va mieux" },
    ]);
    expect(status).toBe(503); // pas de clé configurée, donc pas de crise sur ce dernier message
    expect(body.crisis).toBeUndefined();
  });
});
