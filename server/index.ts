import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { handleChat } from "./chat";
import { handleNearbyPlaces, handleReverseGeocode } from "./geo";

/**
 * Plugin Vite : expose les routes API côté serveur de développement.
 * En production, ces routes devront être servies par un runtime Node
 * équivalent (voir README) — le navigateur n'appelle que /api/*.
 */
export function manaApiPlugin(): Plugin {
  const env = loadEnv();

  return {
    name: "mana-api",
    configureServer(server) {
      server.middlewares.use(
        "/api/chat",
        (req, res) => void handleChat(req, res, env)
      );
      server.middlewares.use("/api/places/nearby", (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        void handleNearbyPlaces(req, res, url);
      });
      server.middlewares.use("/api/geo/reverse", (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        void handleReverseGeocode(req, res, url);
      });
      server.middlewares.use("/api/health", (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ aiConfigured: Boolean(env.MISTRAL_API_KEY) }));
      });
    },
  };
}

function loadEnv(): Record<string, string | undefined> {
  try {
    // lit .env.local et .env (jamais versionnés)
    const result: Record<string, string> = {};
    for (const file of [".env", ".env.local"]) {
      const full = path.resolve(process.cwd(), file);
      if (!fs.existsSync(full)) continue;
      for (const line of fs.readFileSync(full, "utf-8").split("\n")) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (match) result[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
    return result;
  } catch {
    return {};
  }
}
