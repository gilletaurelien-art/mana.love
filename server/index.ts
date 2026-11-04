import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { creerRepartiteurApi } from "./routes";

/**
 * Plugin Vite : expose les routes API côté serveur de développement, via
 * la même table que `server/prod.ts` (voir `routes.ts`) — pas une copie.
 */
export function manaApiPlugin(): Plugin {
  const env = loadEnv();
  const repartir = creerRepartiteurApi(env);

  return {
    name: "mana-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }
        void repartir(req, res).then((trouve) => {
          if (!trouve) next();
        });
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
