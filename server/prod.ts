import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { creerRepartiteurApi } from "./routes";

/**
 * Serveur de production — l'équivalent du plugin Vite (dev), listé
 * depuis le début au README comme une intégration en attente. Sert les
 * fichiers statiques du build (`dist/`) ET les routes `/api/*`, via la
 * MÊME table de routes que le dev (`routes.ts`) : aucune route ne peut
 * fonctionner en dev et manquer en prod, ou l'inverse.
 *
 * ⚠️ Les variables d'environnement viennent de `process.env` directement
 * — PAS d'un fichier `.env.local` lu sur disque (`loadEnv()` du plugin
 * dev) : en production, c'est l'hébergeur qui les injecte dans
 * l'environnement du process, jamais un fichier versionné ou local.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Construit par `vite build --ssr server/prod.ts --outDir dist-server`,
// donc ce fichier compilé vit dans dist-server/ — un niveau au-dessus
// de la racine du projet, où dist/ (le build front) se trouve aussi.
const DIST = process.env.DIST_DIR ?? path.resolve(__dirname, "../dist");
const PORT = Number(process.env.PORT ?? 3000);

const TYPES_CONTENU: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/**
 * Résout un chemin de requête vers un fichier sous `DIST`, sans jamais
 * sortir de ce dossier — ⛔ une requête `/../../etc/passwd` ne doit
 * jamais atteindre un fichier hors du build.
 */
export function resoudreCheminSur(dist: string, pathname: string): string | null {
  const decode = decodeURIComponent(pathname);
  const resolu = path.resolve(dist, "." + decode);
  if (resolu !== dist && !resolu.startsWith(dist + path.sep)) return null;
  return resolu;
}

async function servirStatique(
  res: http.ServerResponse,
  dist: string,
  pathname: string
): Promise<void> {
  const cheminDemande = resoudreCheminSur(dist, pathname);
  const indexHtml = path.join(dist, "index.html");

  const essayer = async (chemin: string | null): Promise<boolean> => {
    if (!chemin) return false;
    try {
      const stat = await fsp.stat(chemin);
      if (!stat.isFile()) return false;
      const type = TYPES_CONTENU[path.extname(chemin)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      fs.createReadStream(chemin).pipe(res);
      return true;
    } catch {
      return false;
    }
  };

  if (await essayer(cheminDemande)) return;
  // ⭐ Repli SPA : toute route qui n'est ni un fichier existant ni
  // /api/* est une route client (React Router) — index.html la sert,
  // et React Router prend le relais côté navigateur.
  if (await essayer(indexHtml)) return;

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Introuvable.");
}

export function creerServeur(dist: string = DIST): http.Server {
  const repartir = creerRepartiteurApi(process.env);
  return http.createServer((req, res) => {
    void (async () => {
      if (req.url?.startsWith("/api/")) {
        const trouve = await repartir(req, res);
        if (!trouve) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Route inconnue." }));
        }
        return;
      }
      const url = new URL(req.url ?? "/", "http://localhost");
      await servirStatique(res, dist, url.pathname);
    })();
  });
}

// ⚠️ Ne démarre le serveur QUE si ce fichier est le point d'entrée
// exécuté directement — pas quand il est importé (par les tests, par
// exemple), où démarrer un vrai serveur HTTP serait un effet de bord
// non désiré.
const estPointEntree = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (estPointEntree) {
  creerServeur().listen(PORT, () => {
    console.log(`mana.love — serveur de production sur http://localhost:${PORT}`);
  });
}
