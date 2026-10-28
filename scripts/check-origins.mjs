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

/**
 * Origines autorisées côté APP (src/) : uniquement les routes du même site.
 * Le client parle à /api/chat, JAMAIS à l'API Mistral directement.
 */
const ORIGINES_APP = new Set([
  "/api/chat",            // proxy serveur → ask-mana / mana-chat
  "/api/health",
  "/api/places/nearby",   // proxy serveur → Overpass (OSM)
  "/api/geo/reverse",     // proxy serveur → Nominatim (OSM)
]);

/**
 * Origines autorisées côté SERVEUR (server/) : partenaires explicites.
 * api.mistral.ai est ici et PARTOUT ici — une app qui l'appelle depuis
 * le client contourne le garde anti-dépendance et le mur payant.
 */
const ORIGINES_SERVEUR = new Set([
  "https://api.mistral.ai",
  "https://overpass-api.de",
  "https://nominatim.openstreetmap.org",
]);

/** CDN souverain du fondateur — avatars .vrm (relevé 28/10/2026). */
const ORIGINES_CDN = new Set([
  "https://cdn.mana.bzh",
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

/**
 * Extrait les origines atteintes : URL https littérales complètes.
 * Les templates `${...}` ne sont pas des origines (ce sont des variables) ;
 * http://localhost n'est qu'une base de parsing pour req.url — pas un appel.
 */
function extraireOrigines(contenu) {
  const origines = new Set();
  const motif = /["'`](https:\/\/[^"'`\s]+)["'`]/g;
  for (const m of contenu.matchAll(motif)) {
    origines.add(m[1]);
  }
  return origines;
}

function estAutorisee(origine, blanches) {
  if (blanches.has(origine)) return true;
  // autorisation par ORIGINE (scheme + host + port), pas par URL exacte :
  // une origine en liste blanche couvre tous ses chemins.
  for (const autorisee of blanches) {
    if (origine.startsWith(autorisee + "/") || origine === autorisee) return true;
  }
  // les chemins relatifs du même site sont légitimes (routes internes, assets)
  if (origine.startsWith("/") || origine.startsWith(".")) return true;
  return false;
}

let echecs = 0;
const args = process.argv.slice(2);
const racine = path.resolve(args.find((a) => !a.startsWith("--")) ?? "src");
// Mode explicite : --app (src/) ou --serveur (server/).
// Le mode se déclare, il ne se devine pas du chemin.
const mode = args.includes("--serveur") ? "serveur" : "app";

for await (const fichier of fichiers(racine)) {
  const contenu = await readFile(fichier, "utf-8");

  for (const mot of MOTS_INTERDITS) {
    if (contenu.includes(mot)) {
      console.error(`⛔ ${path.relative(".", fichier)} contient « ${mot} » — interdit.`);
      echecs++;
    }
  }

  const origines = extraireOrigines(contenu);
  for (const origine of origines) {
    if (mode === "app") {
      // src/ : routes internes + CDN seulement — JAMAIS les partenaires serveur.
      if (!estAutorisee(origine, ORIGINES_APP) && !estAutorisee(origine, ORIGINES_CDN)) {
        console.error(`⛔ ${path.relative(".", fichier)} (app) atteint une origine non autorisée : ${origine}`);
        echecs++;
      }
    } else {
      // server/ : partenaires serveur autorisés.
      if (!estAutorisee(origine, ORIGINES_SERVEUR)) {
        console.error(`⛔ ${path.relative(".", fichier)} (serveur) atteint une origine non autorisée : ${origine}`);
        echecs++;
      }
    }
  }
}

if (echecs > 0) {
  console.error(`\n${echecs} violation(s) de la frontière d'origines.`);
  console.error(`Liste blanche app (src/) :`);
  for (const o of ORIGINES_APP) console.error(`  ✓ ${o}`);
  for (const o of ORIGINES_CDN) console.error(`  ✓ ${o} (CDN)`);
  console.error(`Liste blanche serveur (server/) :`);
  for (const o of ORIGINES_SERVEUR) console.error(`  ✓ ${o}`);
  process.exit(1);
}

console.log("✓ Frontière d'origines intacte (liste blanche respectée).");
