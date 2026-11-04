import type { IncomingMessage, ServerResponse } from "node:http";
import { handleChat } from "./chat";
import { handleNearbyPlaces, handleReverseGeocode, handleRouteEstimate } from "./geo";
import { handleWeatherForecast } from "./weather";

export type Env = Record<string, string | undefined>;

/**
 * La table des routes /api/*, UNE SEULE FOIS — partagée par le plugin
 * Vite (développement, `server/index.ts`) et le serveur de production
 * (`server/prod.ts`).
 *
 * ⭐ Avant cette PR, les deux listaient les routes séparément : une route
 * ajoutée à l'un (ex. #8, météo) pouvait être oubliée dans l'autre sans
 * qu'aucun garde ne le remarque — exactement le risque que « serveur de
 * production » en attente, listé au README depuis le début, a fini par
 * rendre réel. Une seule table élimine la possibilité même de l'oubli.
 */
export function creerRepartiteurApi(
  env: Env
): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  return async function repartir(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? "/", "http://localhost");
    switch (url.pathname) {
      case "/api/chat":
        await handleChat(req, res, env);
        return true;
      case "/api/places/nearby":
        await handleNearbyPlaces(req, res, url);
        return true;
      case "/api/geo/reverse":
        await handleReverseGeocode(req, res, url);
        return true;
      case "/api/geo/route":
        await handleRouteEstimate(req, res, url);
        return true;
      case "/api/meteo/previsions":
        await handleWeatherForecast(req, res, url);
        return true;
      case "/api/health":
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ aiConfigured: Boolean(env.MISTRAL_API_KEY) }));
        return true;
      default:
        return false;
    }
  };
}
