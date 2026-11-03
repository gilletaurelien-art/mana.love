import type { Coordinates, Place } from "@/domain/exploration";
import type { GeoService } from "@/domain/exploration";

/**
 * Adaptateur OSM : consomme les routes serveur /api/places/nearby et
 * /api/geo/reverse (qui proxifient Overpass et Nominatim avec cache et
 * User-Agent conforme). Le navigateur ne parle jamais directement à OSM.
 */
export const osmGeoService: GeoService & {
  nearbyPlaces(coords: Coordinates, radiusM?: number): Promise<Place[]>;
} = {
  async reverseGeocode(coords: Coordinates): Promise<string | null> {
    const res = await fetch(
      `/api/geo/reverse?lat=${coords.lat}&lng=${coords.lng}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { label?: string | null };
    return data.label ?? null;
  },

  async estimateRouteTime(
    from: Coordinates,
    to: Coordinates,
    mode: "walk" | "bike"
  ): Promise<number | null> {
    try {
      const res = await fetch(
        `/api/geo/route?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&mode=${mode}`
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { minutes?: number | null };
      return typeof data.minutes === "number" ? data.minutes : null;
    } catch {
      // Contrat : null = temps inconnu, jamais une erreur qui casse l'écran.
      return null;
    }
  },

  async nearbyPlaces(coords: Coordinates, radiusM = 3000): Promise<Place[]> {
    const res = await fetch(
      `/api/places/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=${radiusM}`
    );
    if (!res.ok) {
      throw new Error(`Lieux environnants indisponibles (${res.status})`);
    }
    const data = (await res.json()) as { places?: Place[] };
    return data.places ?? [];
  },
};
