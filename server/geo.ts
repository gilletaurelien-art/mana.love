import type { IncomingMessage, ServerResponse } from "node:http";
import type { Coordinates, Place } from "../src/domain/exploration";

/**
 * Proxy OSM — données géographiques réelles via Overpass (POI) et
 * Nominatim (reverse-geocoding). Le proxy serveur :
 * - impose un User-Agent conforme à la politique d'OSM ;
 * - met en cache les réponses pour limiter la charge ;
 * - valide et normalise les résultats avant de les exposer au front.
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const ROUTING_PROFILE_URL: Record<"walk" | "bike", string> = {
  walk: "https://routing.openstreetmap.de/routed-foot/route/v1/foot",
  bike: "https://routing.openstreetmap.de/routed-bike/route/v1/bike",
};
const USER_AGENT =
  "MANA.love/0.1 (exploration companion; contact: hello@mana.love)";
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { at: number; payload: unknown }>();

function cached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.payload as T;
  return null;
}

function store(key: string, payload: unknown): void {
  cache.set(key, { at: Date.now(), payload });
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

const KIND_BY_TAG: Array<{ key: string; value: string; kind: Place["kind"] }> = [
  { key: "natural", value: "peak", kind: "viewpoint" },
  { key: "natural", value: "water", kind: "water" },
  { key: "natural", value: "wood", kind: "landscape" },
  { key: "leisure", value: "park", kind: "garden" },
  { key: "leisure", value: "garden", kind: "garden" },
  { key: "highway", value: "footway", kind: "path" },
];

function classify(tags: Record<string, string>): Place["kind"] {
  for (const rule of KIND_BY_TAG) {
    if (tags[rule.key] === rule.value) return rule.kind;
  }
  if (tags.waterway) return "water";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.natural) return "landscape";
  return "landscape";
}

function toPlace(el: OverpassElement): Place | null {
  if (typeof el.lat !== "number" || typeof el.lon !== "number") return null;
  const tags = el.tags ?? {};
  const name = tags.name;
  if (!name) return null;
  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    region: [tags["addr:city"], tags["addr:state"]].filter(Boolean).join(", "),
    kind: classify(tags),
    summary:
      tags.description?.slice(0, 140) ??
      "Un lieu réel issu d'OpenStreetMap, à découvrir autour de vous.",
    description:
      tags.description ??
      "Ce lieu provient des données ouvertes d'OpenStreetMap, mises à jour par la communauté.",
    location: { lat: el.lat, lng: el.lon },
    bestMoments: [],
    tags: Object.entries(tags)
      .filter(([k]) => ["natural", "leisure", "tourism", "highway"].includes(k))
      .map(([, v]) => v),
  };
}

export async function handleNearbyPlaces(
  _req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> {
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Coordonnées lat/lng requises." }));
    return;
  }

  const radiusM = Math.min(5000, Math.max(500, Number(url.searchParams.get("radius") ?? 3000)));
  const cacheKey = `nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radiusM}`;
  const hit = cached<unknown>(cacheKey);
  if (hit) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(hit));
    return;
  }

  const query = `[out:json][timeout:25];
(
  node["natural"~"peak|water|wood|beach"](around:${radiusM},${lat},${lng});
  node["leisure"~"park|garden"](around:${radiusM},${lat},${lng});
  node["tourism"="viewpoint"](around:${radiusM},${lat},${lng});
  node["highway"="footway"]["name"](around:${radiusM},${lat},${lng});
);
out center 60;`;

  try {
    const osmRes = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!osmRes.ok) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Overpass a répondu ${osmRes.status}` }));
      return;
    }
    const data = (await osmRes.json()) as { elements?: OverpassElement[] };
    const places = (data.elements ?? [])
      .map(toPlace)
      .filter((p): p is Place => p !== null);
    const payload = { source: "openstreetmap", places };
    store(cacheKey, payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: `Échec Overpass : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      })
    );
  }
}

export async function handleReverseGeocode(
  _req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> {
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Coordonnées lat/lng requises." }));
    return;
  }

  const cacheKey = `rev:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  const hit = cached<unknown>(cacheKey);
  if (hit) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(hit));
    return;
  }

  try {
    const nomRes = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&zoom=14&accept-language=fr`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!nomRes.ok) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Nominatim a répondu ${nomRes.status}` }));
      return;
    }
    const data = (await nomRes.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const label =
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.county ??
      data.display_name?.split(",").slice(-3, -1).join(", ") ??
      null;
    const payload = { label };
    store(cacheKey, payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: `Échec Nominatim : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      })
    );
  }
}

/**
 * Proxy routage réel — Valhalla/OSRM n'est pas auto-hébergé : on passe par
 * l'instance publique routing.openstreetmap.de (profils foot/bike), de la
 * même famille que Nominatim (communauté OSM, même politique d'usage :
 * User-Agent conforme, charge raisonnable, pas de production à grande
 * échelle). `GeoService.estimateRouteTime` était un contrat dormant
 * (toujours `null`, voir osmExploreService.ts) ; cette route lui donne un
 * corps.
 */
export async function handleRouteEstimate(
  _req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> {
  // "Number(null)" vaut 0, pas NaN : un paramètre absent passerait la
  // validation comme des coordonnées (0, 0) valides. "NaN" par défaut force
  // Number.isFinite à rejeter une absence comme une valeur invalide.
  const fromLat = Number(url.searchParams.get("fromLat") ?? "NaN");
  const fromLng = Number(url.searchParams.get("fromLng") ?? "NaN");
  const toLat = Number(url.searchParams.get("toLat") ?? "NaN");
  const toLng = Number(url.searchParams.get("toLng") ?? "NaN");
  const mode = url.searchParams.get("mode") === "bike" ? "bike" : "walk";

  if (
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLng) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLng)
  ) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Coordonnées de départ et d'arrivée requises." }));
    return;
  }

  const cacheKey = `route:${mode}:${fromLat.toFixed(4)}:${fromLng.toFixed(4)}:${toLat.toFixed(4)}:${toLng.toFixed(4)}`;
  const hit = cached<unknown>(cacheKey);
  if (hit) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(hit));
    return;
  }

  try {
    const base = ROUTING_PROFILE_URL[mode];
    const osrmRes = await fetch(
      `${base}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!osrmRes.ok) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Routage a répondu ${osrmRes.status}` }));
      return;
    }
    const data = (await osrmRes.json()) as {
      code?: string;
      routes?: Array<{ duration?: number; distance?: number }>;
    };
    const route = data.code === "Ok" ? data.routes?.[0] : undefined;
    if (!route || typeof route.duration !== "number") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ minutes: null, meters: null }));
      return;
    }
    const payload = {
      minutes: Math.round(route.duration / 60),
      meters: typeof route.distance === "number" ? Math.round(route.distance) : null,
    };
    store(cacheKey, payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: `Échec du routage : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      })
    );
  }
}

export type { Coordinates };
