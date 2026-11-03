import type { IncomingMessage, ServerResponse } from "node:http";
import { buildSystemPrompt } from "../src/domain/systemPrompt";
import { getPersonality } from "../src/domain/personalityRegistry";
import { souvenirsOperants } from "../src/domain/memoire";
import type { SouvenirDeclare } from "../src/domain/memoire";
import type { ChatMessage } from "../src/domain/personalities";

/**
 * Route serveur /api/chat — proxy Mistral.
 * MISTRAL_API_KEY reste côté serveur, jamais exposée au navigateur.
 *
 * ⭐ La requête accepte un champ `souvenirs` OPTIONNEL : la moitié LECTURE
 * du contrat mémoire ↔ conversation, reprise de la forme mesurée de
 * `mana-presence` sur l'ancien site. Ce qui est reçu est FILTRÉ ici par
 * `souvenirsOperants()` avant d'atteindre le prompt — un souvenir périmé
 * ou désactivé ne parvient jamais au modèle.
 *
 * ⚠️ AUCUN CLIENT N'ENVOIE ENCORE CE CHAMP, et c'est assumé : il n'existe
 * ni base provisionnée ni écran pour produire des souvenirs. Cette route
 * est prête pour le jour où ils arriveront, et testée comme telle — mais
 * elle ne promet rien aujourd'hui que l'application sache tenir.
 */

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface ChatRequestBody {
  messages?: unknown;
  personalityId?: unknown;
  souvenirs?: unknown;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "companion") &&
    typeof v.text === "string" &&
    typeof v.createdAt === "string"
  );
}

function isSouvenirDeclare(value: unknown): value is SouvenirDeclare {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    (v.genre === "preference" ||
      v.genre === "intention" ||
      v.genre === "rappel" ||
      v.genre === "contexte") &&
    typeof v.texte === "string" &&
    typeof v.confirmeLe === "string" &&
    (v.expireLe === null || typeof v.expireLe === "string") &&
    (v.desactiveLe === null || typeof v.desactiveLe === "string")
  );
}

export async function handleChat(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>
): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }

  const apiKey = env.MISTRAL_API_KEY;
  if (!apiKey) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error:
          "IA non configurée : définissez MISTRAL_API_KEY dans .env.local côté serveur.",
      })
    );
    return;
  }

  let body: ChatRequestBody;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw) as ChatRequestBody;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Corps de requête invalide." }));
    return;
  }

  const personality = getPersonality(String(body.personalityId ?? "mana"));
  if (!personality) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Personnalité inconnue." }));
    return;
  }

  if (!Array.isArray(body.messages) || !body.messages.every(isChatMessage)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Messages invalides." }));
    return;
  }

  let souvenirs: SouvenirDeclare[] = [];
  if (body.souvenirs !== undefined) {
    if (!Array.isArray(body.souvenirs) || !body.souvenirs.every(isSouvenirDeclare)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Souvenirs invalides." }));
      return;
    }
    souvenirs = body.souvenirs as SouvenirDeclare[];
  }

  const history = (body.messages as ChatMessage[]).slice(-20);

  try {
    const model = env.MISTRAL_MODEL ?? "mistral-small-latest";
    const mistralRes = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            // 🔴 Le filtre est ici, et nulle part ailleurs : ce qui est périmé
            // ou désactivé n'atteint jamais le modèle.
            content: buildSystemPrompt(
              personality,
              souvenirsOperants(souvenirs, new Date().toISOString())
            ),
          },
          ...history.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!mistralRes.ok) {
      const detail = await mistralRes.text().catch(() => "");
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: `Mistral a répondu ${mistralRes.status}. ${detail.slice(0, 200)}`,
        })
      );
      return;
    }

    const data = (await mistralRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Réponse vide de Mistral." }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ text }));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: `Échec de l'appel Mistral : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      })
    );
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk;
      if (data.length > 200_000) {
        reject(new Error("Corps trop volumineux"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
