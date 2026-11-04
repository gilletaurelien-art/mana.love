import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import net from "node:net";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { creerServeur, resoudreCheminSur } from "../prod";

/**
 * Intégration HTTP réelle : un dossier `dist/` factice (pas le vrai
 * build, pour ne pas dépendre de `npm run build` ayant déjà tourné),
 * un vrai serveur `creerServeur()`, de vraies requêtes.
 */

let racine: string;
let dist: string;
let serveur: Server;
let base: string;

beforeAll(async () => {
  // ⭐ `dist` est imbriqué SOUS `racine`, et un vrai fichier existe dans
  // `racine` mais HORS de `dist` — sans un fichier réel à atteindre, un
  // test de traversée de chemin ne prouve rien : si le garde est retiré
  // par erreur, `stat()` échoue quand même faute de cible, et le test
  // "passe" par coïncidence. Ici, la cible existe vraiment.
  racine = await mkdtemp(path.join(tmpdir(), "mana-racine-"));
  await writeFile(path.join(racine, "secret.txt"), "CONTENU-HORS-DIST-A-NE-JAMAIS-SERVIR");
  dist = path.join(racine, "dist");
  await mkdir(dist);
  await writeFile(path.join(dist, "index.html"), "<!doctype html><title>accueil</title>");
  await mkdir(path.join(dist, "assets"));
  await writeFile(path.join(dist, "assets", "app.js"), 'console.log("app");');
  await writeFile(path.join(dist, "mana.svg"), "<svg></svg>");

  serveur = creerServeur(dist);
  await new Promise<void>((resolve) => serveur.listen(0, resolve));
  const adresse = serveur.address();
  const port = typeof adresse === "object" && adresse ? adresse.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => serveur.close(() => resolve()));
  await rm(racine, { recursive: true, force: true });
});

describe("serveur de production — fichiers statiques", () => {
  it("sert index.html à la racine", async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("accueil");
  });

  it("sert un asset avec le bon type de contenu", async () => {
    const res = await fetch(`${base}/assets/app.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/javascript");
    expect(await res.text()).toContain("app");
  });

  it("sert un fichier à la racine (public/*)", async () => {
    const res = await fetch(`${base}/mana.svg`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg");
  });

  it("🔴 une route client (React Router) sans fichier correspondant reçoit index.html — le repli SPA", async () => {
    const res = await fetch(`${base}/ciel`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("accueil");
  });

  it("une route client profonde reçoit aussi index.html", async () => {
    const res = await fetch(`${base}/explorer/lieu/osm-node-123`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("accueil");
  });

  it("🔴 une requête HTTP BRUTE (pas via fetch) avec une vraie traversée de chemin échoue — repli SPA, jamais le fichier visé", async () => {
    // ⚠️ `fetch` normalise lui-même les segments ".." d'une URL avant
    // l'envoi (comme un navigateur) — AVANT MÊME QUE CETTE REQUÊTE NE
    // PARTE, "/%2e%2e/secret.txt" devient "/secret.txt" côté client,
    // et le serveur ne voit jamais la tentative de traversée. Mesuré
    // directement (voir le script de debug dans la session) : impossible
    // de tester cette défense avec `fetch`, il faut parler TCP brut pour
    // envoyer la ligne de requête HTTP telle quelle, sans normalisation.
    const port = (serveur.address() as { port: number }).port;
    const corps = await new Promise<string>((resolve, reject) => {
      const socket = net.connect(port, "127.0.0.1", () => {
        socket.write("GET /%2e%2e/secret.txt HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
      });
      let data = "";
      socket.on("data", (chunk) => (data += chunk.toString()));
      socket.on("end", () => resolve(data));
      socket.on("error", reject);
    });
    expect(corps).toContain("200"); // repli SPA : jamais un 403/500 qui confirmerait l'existence du fichier
    expect(corps).toContain("accueil"); // index.html, pas secret.txt
    expect(corps).not.toContain("CONTENU-HORS-DIST-A-NE-JAMAIS-SERVIR");
  });

  it("🔴 resoudreCheminSur refuse directement toute résolution qui sort de dist/", () => {
    expect(resoudreCheminSur(dist, "/../secret.txt")).toBeNull();
    expect(resoudreCheminSur(dist, "/../../etc/passwd")).toBeNull();
    expect(resoudreCheminSur(dist, "/assets/app.js")).toBe(path.join(dist, "assets", "app.js"));
  });
});

describe("serveur de production — /api/* passe par la même table que le dev", () => {
  it("🔴 /api/health répond, preuve que la table de routes partagée (routes.ts) fonctionne ici aussi", async () => {
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { aiConfigured: boolean };
    expect(typeof body.aiConfigured).toBe("boolean");
  });

  it("une route /api/* inconnue renvoie 404 JSON, jamais index.html", async () => {
    const res = await fetch(`${base}/api/inconnue`);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

describe("serveur de production — fichier absent", () => {
  it("sans index.html (cas déjà couvert par défaut), un vrai 404 reste possible", async () => {
    const distVide = await mkdtemp(path.join(tmpdir(), "mana-dist-vide-"));
    const s = creerServeur(distVide);
    await new Promise<void>((resolve) => s.listen(0, resolve));
    const adresse = s.address();
    const port = typeof adresse === "object" && adresse ? adresse.port : 0;
    const res = await fetch(`http://127.0.0.1:${port}/quoi-que-ce-soit`);
    expect(res.status).toBe(404);
    await new Promise<void>((resolve) => s.close(() => resolve()));
    await rm(distVide, { recursive: true, force: true });
  });
});
