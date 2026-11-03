import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { handleChat } from "../chat";
import type { SouvenirDeclare } from "../../src/domain/memoire";

/**
 * 🔴 Test d'intégration, et il le faut : les tests de systemPrompt.test.ts
 * prouvent que le prompt SAIT citer des souvenirs, pas que la route les
 * filtre et les lui passe. Le seul moyen de le prouver est de regarder ce
 * qui part RÉELLEMENT vers Mistral — donc d'intercepter l'appel sortant.
 * Aucun réseau n'est touché : `fetch` est remplacé le temps du test.
 */

let server: Server;
let base: string;
let corpsEnvoye: Record<string, unknown> | null;

const J = 24 * 60 * 60 * 1000;
const MAINTENANT = Date.now();

function souvenir(partial: Partial<SouvenirDeclare> & { texte: string }): SouvenirDeclare {
  return {
    id: partial.texte.slice(0, 8),
    genre: "contexte",
    confirmeLe: new Date(MAINTENANT - J).toISOString(),
    expireLe: null,
    desactiveLe: null,
    ...partial,
  };
}

beforeAll(async () => {
  server = createServer((req, res) => {
    void handleChat(req, res, { MISTRAL_API_KEY: "cle-de-test" });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const adresse = server.address();
  const port = typeof adresse === "object" && adresse ? adresse.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  corpsEnvoye = null;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    async (_url: string | URL | Request, init?: RequestInit) => {
      corpsEnvoye = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "réponse du modèle" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ⚠️ PIÈGE : `vi.spyOn(globalThis, "fetch")` intercepte TOUT fetch, y
   compris celui que le test utilise pour appeler son propre serveur. On
   capture donc le vrai `fetch` au chargement du module — avant que le
   mock ne soit posé en beforeEach — et le test s'en sert pour ses propres
   requêtes. Seul l'appel sortant de la route vers Mistral est intercepté. */
const vraiFetch = globalThis.fetch.bind(globalThis);

const messageUtilisateur = [
  { id: "1", role: "user", createdAt: new Date(0).toISOString(), text: "racontez-moi quelque chose" },
];

async function posterVraiment(corps: Record<string, unknown>) {
  const res = await vraiFetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

function promptSysteme(): string {
  const messages = corpsEnvoye?.messages as Array<{ role: string; content: string }> | undefined;
  const systeme = messages?.find((m) => m.role === "system");
  return systeme?.content ?? "";
}

describe("/api/chat — les souvenirs reçus atteignent le prompt, filtrés", () => {
  it("sans champ souvenirs, le prompt n'en parle pas (comportement inchangé)", async () => {
    const { status } = await posterVraiment({
      personalityId: "mana",
      messages: messageUtilisateur,
    });
    expect(status).toBe(200);
    expect(promptSysteme()).not.toContain("conversations précédentes");
  });

  it("🔴 un souvenir opérant atteint le prompt, un souvenir PÉRIMÉ non", async () => {
    const { status } = await posterVraiment({
      personalityId: "mana",
      messages: messageUtilisateur,
      souvenirs: [
        souvenir({ texte: "vit près de Brest" }),
        souvenir({
          texte: "cherchait un emploi en mai",
          genre: "intention",
          confirmeLe: new Date(MAINTENANT - 60 * J).toISOString(),
          expireLe: new Date(MAINTENANT - 30 * J).toISOString(),
        }),
      ],
    });

    expect(status).toBe(200);
    expect(promptSysteme()).toContain("vit près de Brest");
    expect(promptSysteme()).not.toContain("cherchait un emploi en mai");
  });

  it("🔴 un souvenir DÉSACTIVÉ n'atteint pas le prompt non plus", async () => {
    await posterVraiment({
      personalityId: "mana",
      messages: messageUtilisateur,
      souvenirs: [
        souvenir({ texte: "aime la voile" }),
        souvenir({ texte: "a désactivé ce souvenir", desactiveLe: new Date().toISOString() }),
      ],
    });

    expect(promptSysteme()).toContain("aime la voile");
    expect(promptSysteme()).not.toContain("a désactivé ce souvenir");
  });

  it("un champ souvenirs malformé est refusé, et rien ne part vers le modèle", async () => {
    const { status, body } = await posterVraiment({
      personalityId: "mana",
      messages: messageUtilisateur,
      souvenirs: [{ genre: "inconnu", texte: 42 }],
    });

    expect(status).toBe(400);
    expect(String(body.error)).toContain("Souvenirs invalides");
    expect(corpsEnvoye).toBeNull();
  });
});
