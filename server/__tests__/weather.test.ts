import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { handleWeatherForecast } from "../weather";

/**
 * Intégration HTTP, même motif que geo.route.test.ts : `fetch` vers
 * Open-Meteo est intercepté, aucun réseau n'est touché.
 */

let server: Server;
let base: string;
let urlAppelee: string | null = null;

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    void handleWeatherForecast(req, res, url);
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const adresse = server.address();
  const port = typeof adresse === "object" && adresse ? adresse.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const vraiFetch = globalThis.fetch.bind(globalThis);

afterEach(() => {
  vi.restoreAllMocks();
  urlAppelee = null;
});

function mockerOpenMeteo(reponse: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
    urlAppelee = String(url);
    return new Response(JSON.stringify(reponse), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
}

async function demander(params: string) {
  const res = await vraiFetch(`${base}/api/meteo/previsions?${params}`);
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

const REPONSE_TYPE = {
  current_weather: { time: "2026-11-03T14:00" },
  hourly: {
    time: ["2026-11-03T14:00", "2026-11-03T15:00"],
    precipitation_probability: [10, 50],
    temperature_2m: [14.2, 13.8],
  },
};

describe("/api/meteo/previsions — prévisions réelles", () => {
  it("coordonnées manquantes → 400, aucun appel sortant", async () => {
    const { status, body } = await demander("lat=48.39");
    expect(status).toBe(400);
    expect(String(body.error)).toContain("requises");
    expect(urlAppelee).toBeNull();
  });

  it("🔴 zippe time/precipitation_probability/temperature_2m en points cohérents", async () => {
    mockerOpenMeteo(REPONSE_TYPE);
    const { status, body } = await demander("lat=48.39&lng=-4.48");
    expect(status).toBe(200);
    expect(body).toEqual({
      maintenantISO: "2026-11-03T14:00",
      points: [
        { heureISO: "2026-11-03T14:00", probabilitePluie: 10, temperatureC: 14.2 },
        { heureISO: "2026-11-03T15:00", probabilitePluie: 50, temperatureC: 13.8 },
      ],
    });
    expect(urlAppelee).toContain("current_weather=true");
    expect(urlAppelee).toContain("timezone=auto");
  });

  it("maintenantISO retombe sur le premier point si current_weather est absent", async () => {
    mockerOpenMeteo({
      hourly: {
        time: ["2026-11-03T14:00"],
        precipitation_probability: [10],
        temperature_2m: [14],
      },
    });
    const { body } = await demander("lat=48.1&lng=-4.1");
    expect(body.maintenantISO).toBe("2026-11-03T14:00");
  });

  it("échec du service météo → 502, pas un crash", async () => {
    mockerOpenMeteo({}, 503);
    const { status, body } = await demander("lat=48.2&lng=-4.2");
    expect(status).toBe(502);
    expect(String(body.error)).toContain("503");
  });

  it("une deuxième requête identique sert le cache, sans nouvel appel réseau", async () => {
    const spy = mockerOpenMeteo(REPONSE_TYPE);
    await demander("lat=48.3333&lng=-4.3333");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();
    await demander("lat=48.3333&lng=-4.3333");
    expect(spy).not.toHaveBeenCalled();
  });
});
