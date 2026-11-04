import type { Coordinates } from "@/domain/exploration";
import { meilleureFenetre, type FenetreMeteo } from "@/domain/meteo";

/**
 * Adaptateur météo : consomme /api/meteo/previsions (proxy Open-Meteo).
 * Le navigateur ne parle jamais directement à Open-Meteo.
 *
 * ⚠️ `undefined` ≠ `null` : `undefined` veut dire "prévision
 * indisponible" (réseau, service en panne) — `null` veut dire "prévision
 * obtenue, aucune fenêtre sèche trouvée". Les confondre ferait dire
 * « pluie probable » à l'utilisateur sur une simple panne réseau.
 */
export async function fenetreMeteo(
  coords: Coordinates
): Promise<FenetreMeteo | null | undefined> {
  try {
    const res = await fetch(`/api/meteo/previsions?lat=${coords.lat}&lng=${coords.lng}`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      maintenantISO?: string | null;
      points?: Array<{ heureISO: string; probabilitePluie: number; temperatureC: number }>;
    };
    if (!data.maintenantISO || !data.points) return undefined;
    return meilleureFenetre(data.points, data.maintenantISO);
  } catch {
    return undefined;
  }
}
