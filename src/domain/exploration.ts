/**
 * Domain: exploration — places, experiences, geographic contracts.
 *
 * Types here define the future integration surface for POI / routing
 * services (PostGIS, Valhalla, …). Sample data lives in infrastructure
 * and is always clearly flagged as demonstration content.
 */

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PlaceKind =
  | "landscape"
  | "water"
  | "path"
  | "garden"
  | "viewpoint";

export interface Place {
  id: string;
  name: string;
  region: string;
  kind: PlaceKind;
  /** Short poetic description for cards. */
  summary: string;
  /** Longer description shown in detail view. */
  description: string;
  /** Only present when real coordinates are known. */
  location?: Coordinates;
  /** Opening hours etc. — only when actually known. */
  practical?: readonly string[];
  /** Recommended moments to visit, from sample content. */
  bestMoments: readonly string[];
  tags: readonly string[];
}

export interface Experience {
  id: string;
  title: string;
  /** Short description for cards. */
  summary: string;
  /** Detailed invitation text. */
  description: string;
  durationMinutes: number;
  intensity: "gentle" | "moderate" | "immersive";
  tags: readonly string[];
}

/**
 * Future integration contract for geographic services.
 * Implementations may call Valhalla/OSM; the domain only sees these shapes.
 */
export interface GeoService {
  reverseGeocode(coords: Coordinates): Promise<string | null>;
  estimateRouteTime(
    from: Coordinates,
    to: Coordinates,
    mode: "walk" | "bike"
  ): Promise<number | null>;
}
