import type { IncomingMessage, ServerResponse } from "node:http";
import type { PointMeteo } from "../src/domain/meteo";

/**
 * Proxy météo — Open-Meteo (gratuit, sans clé, données ouvertes). Même
 * esprit que geo.ts : User-Agent conforme, cache court, validation avant
 * d'exposer au front. `timezone=auto` + `current_weather=true` donnent
 * l'heure "maintenant" ET les points horaires dans le MÊME fuseau (celui
 * du lieu) — aucune conversion de fuseau n'est nécessaire ni tentée ici ;
 * c'est justement pour ça que ces deux paramètres sont demandés ensemble.
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const USER_AGENT =
  "MANA.love/0.1 (exploration companion; contact: hello@mana.love)";
const CACHE_TTL_MS = 30 * 60 * 1000;

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

export async function handleWeatherForecast(
  _req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> {
  const lat = Number(url.searchParams.get("lat") ?? "NaN");
  const lng = Number(url.searchParams.get("lng") ?? "NaN");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Coordonnées lat/lng requises." }));
    return;
  }

  const cacheKey = `meteo:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const hit = cached<unknown>(cacheKey);
  if (hit) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(hit));
    return;
  }

  try {
    const meteoRes = await fetch(
      `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lng}` +
        "&hourly=precipitation_probability,temperature_2m" +
        "&current_weather=true&forecast_days=1&timezone=auto",
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!meteoRes.ok) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Open-Meteo a répondu ${meteoRes.status}` }));
      return;
    }
    const data = (await meteoRes.json()) as {
      current_weather?: { time?: string };
      hourly?: {
        time?: string[];
        precipitation_probability?: number[];
        temperature_2m?: number[];
      };
    };

    const temps = data.hourly?.time ?? [];
    const pluie = data.hourly?.precipitation_probability ?? [];
    const temperature = data.hourly?.temperature_2m ?? [];
    const points: PointMeteo[] = temps
      .map((heureISO, i): PointMeteo | null => {
        const probabilitePluie = pluie[i];
        const temperatureC = temperature[i];
        if (typeof probabilitePluie !== "number" || typeof temperatureC !== "number") {
          return null;
        }
        return { heureISO, probabilitePluie, temperatureC };
      })
      .filter((p): p is PointMeteo => p !== null);

    const payload = {
      maintenantISO: data.current_weather?.time ?? points[0]?.heureISO ?? null,
      points,
    };
    store(cacheKey, payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: `Échec Open-Meteo : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      })
    );
  }
}
