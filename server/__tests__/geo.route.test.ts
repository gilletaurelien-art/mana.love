import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { handleRouteEstimate } from "../geo";

/**
 * Intégration HTTP, comme chat.souvenirs.test.ts : on prouve ce que la
 * route RENVOIE au client, pas seulement ce que fait la fonction en
 * isolation. `fetch` vers routing.openstreetmap.de est intercepté — aucun
 * réseau n'est touché.
 */

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    void handleRouteEstimate(req, res, url);
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const adresse = server.address();
  const port = typeof adresse === "object" && adresse ? adresse.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const vraiFetch = globalThis.fetch.bind(globalThis);

let urlAppelee: string | null = null;

beforeEach(() => {
  urlAppelee = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockerOsrm(reponse: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
    urlAppelee = String(url);
    return new Response(JSON.stringify(reponse), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
}

async function demander(params: string) {
  const res = await vraiFetch(`${base}/api/geo/route?${params}`);
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe("/api/geo/route — temps de trajet réel", () => {
  it("coordonnées manquantes → 400, aucun appel sortant", async () => {
    const { status, body } = await demander("fromLat=48.39");
    expect(status).toBe(400);
    expect(String(body.error)).toContain("requises");
    expect(urlAppelee).toBeNull();
  });

  it("🔴 appelle le profil foot par défaut, avec lng,lat dans cet ordre (convention OSRM)", async () => {
    mockerOsrm({ code: "Ok", routes: [{ duration: 925, distance: 1200 }] });
    const { status, body } = await demander(
      "fromLat=48.3904&fromLng=-4.4861&toLat=48.3850&toLng=-4.4800"
    );
    expect(status).toBe(200);
    expect(body).toEqual({ minutes: 15, meters: 1200 });
    expect(urlAppelee).toContain("routed-foot");
    expect(urlAppelee).toContain("-4.4861,48.3904;-4.48,48.385");
  });

  it("mode=bike utilise le profil vélo", async () => {
    mockerOsrm({ code: "Ok", routes: [{ duration: 300, distance: 1200 }] });
    await demander("fromLat=48.39&fromLng=-4.48&toLat=48.38&toLng=-4.47&mode=bike");
    expect(urlAppelee).toContain("routed-bike");
  });

  it("réponse OSRM sans itinéraire (code != Ok) → minutes: null, pas une erreur", async () => {
    mockerOsrm({ code: "NoRoute", routes: [] });
    const { status, body } = await demander(
      "fromLat=48.39&fromLng=-4.48&toLat=48.38&toLng=-4.47"
    );
    expect(status).toBe(200);
    expect(body).toEqual({ minutes: null, meters: null });
  });

  it("échec du service de routage → 502, pas un crash", async () => {
    mockerOsrm({}, 503);
    const { status, body } = await demander(
      "fromLat=48.39&fromLng=-4.48&toLat=48.38&toLng=-4.47"
    );
    expect(status).toBe(502);
    expect(String(body.error)).toContain("503");
  });

  it("une deuxième requête identique sert le cache, sans nouvel appel réseau", async () => {
    const spy = mockerOsrm({ code: "Ok", routes: [{ duration: 600, distance: 800 }] });
    await demander("fromLat=48.1234&fromLng=-4.1234&toLat=48.2&toLng=-4.2");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();
    await demander("fromLat=48.1234&fromLng=-4.1234&toLat=48.2&toLng=-4.2");
    expect(spy).not.toHaveBeenCalled();
  });
});
