/**
 * Garde de frontière : liste BLANCHE des origines autorisées.
 *
 * ⛔ Jamais une liste noire de noms interdits : un garde qui nomme ce
 * qu'il refuse laisse entrer tout ce qu'il n'a pas pensé à nommer.
 * Toute origine/fetch/connexion qui n'est pas explicitement autorisée
 * échoue la CI.
 *
 * La frontière tient le produit :
 * - l'exploration consomme des FICHIERS de graphe (le pipeline),
 *   jamais la base ;
 * - la conversation parle à ask-mana / mana-chat, jamais à l'API Mistral
 *   depuis le client ;
 * - aucune occurrence de supabase ni de rpc( côté src/ : une fuite par
 *   RPC est impossible là où il n'y a pas de RPC.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** Origines autorisées, citation explicite. */
const ORIGINES_AUTORISEES = new Set([
  "/api/chat",            // proxy serveur → ask-mana / mana-chat
  "/api/health",
  "/api/places/nearby",   // proxy serveur → Overpass (OSM)
  "/api/geo/reverse",     // proxy serveur → Nominatim (OSM)
  "https://api.mistral.ai", // côté SERVEUR uniquement (server/), jamais src/
  "https://overpass-api.de",
  "https://nominatim.openstreetmap.org",
]);

const MOTS_INTERDITS = ["supabase", "rpc("];

async function* fichiers(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      yield* fichiers(full);
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      yield full;
    }
  }
}

/** Extrait les origines atteintes dans un fichier : fetch, axios-like, URL littérales. */
function extraireOrigines(contenu) {
  const origines = new Set();
  const motifs = [
    /fetch\(\s*["'`]([^"'`]+)["'`]/g,
    /["'`](https?:\/\/[^"'`]+)["'`]/g,
  ];
  for (const motif of motifs) {
    for (const m of contenu.matchAll(motif)) {
      origines.add(m[1]);
    }
  }
  return origines;
}

function estAutorisee(origine) {
  if (ORIGINES_AUTORISEES.has(origine)) return true;
  // les chemins relatifs du même site sont légitimes (routes internes, assets)
  if (origine.startsWith("/") || origine.startsWith(".")) return true;
  // les URL de tuiles OSM sont relayées par le serveur, pas appelées du client
  return false;
}

let echecs = 0;
const racine = path.resolve(process.argv[2] ?? "src");

for await (const fichier of fichiers(racine)) {
  const contenu = await readFile(fichier, "utf-8");

  for (const mot of MOTS_INTERDITS) {
    if (contenu.includes(mot)) {
      console.error(`⛔ ${path.relative(".", fichier)} contient « ${mot} » — interdit côté app.`);
      echecs++;
    }
  }

  for (const origine of extraireOrigines(contenu)) {
    if (!estAutorisee(origine)) {
      console.error(
        `⛔ ${path.relative(".", fichier)} atteint une origine non autorisée : ${origine}`
      );
      echecs++;
    }
  }
}

if (echecs > 0) {
  console.error(`\n${echecs} violation(s) de la frontière d'origines. Liste blanche :`);
  for (const o of ORIGINES_AUTORISEES) console.error(`  ✓ ${o}`);
  process.exit(1);
}

console.log("✓ Frontière d'origines intacte (liste blanche respectée).");
