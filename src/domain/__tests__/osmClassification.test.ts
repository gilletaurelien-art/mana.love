import { describe, it, expect } from "vitest";
import type { Place } from "@/domain/exploration";

/**
 * Teste la logique de classification des éléments OSM → lieux MANA,
 * répliquée ici depuis server/geo.ts (règles de mapping de tags).
 * Ces règles doivent rester synchronisées avec KIND_BY_TAG dans server/geo.ts.
 */

type Tags = Record<string, string>;

const KIND_BY_TAG: Array<{ key: string; value: string; kind: Place["kind"] }> = [
  { key: "natural", value: "peak", kind: "viewpoint" },
  { key: "natural", value: "water", kind: "water" },
  { key: "natural", value: "wood", kind: "landscape" },
  { key: "leisure", value: "park", kind: "garden" },
  { key: "leisure", value: "garden", kind: "garden" },
  { key: "highway", value: "footway", kind: "path" },
];

function classify(tags: Tags): Place["kind"] {
  for (const rule of KIND_BY_TAG) {
    if (tags[rule.key] === rule.value) return rule.kind;
  }
  if (tags.waterway) return "water";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.natural) return "landscape";
  return "landscape";
}

describe("OSM tag classification", () => {
  it("classifies natural peaks as viewpoints", () => {
    expect(classify({ natural: "peak", name: "X" })).toBe("viewpoint");
  });

  it("classifies parks and gardens as garden", () => {
    expect(classify({ leisure: "park", name: "X" })).toBe("garden");
    expect(classify({ leisure: "garden", name: "X" })).toBe("garden");
  });

  it("classifies water features", () => {
    expect(classify({ natural: "water", name: "X" })).toBe("water");
    expect(classify({ waterway: "riverbank", name: "X" })).toBe("water");
  });

  it("classifies named footways as paths", () => {
    expect(classify({ highway: "footway", name: "X" })).toBe("path");
  });

  it("defaults unknown natural features to landscape", () => {
    expect(classify({ natural: "beach", name: "X" })).toBe("landscape");
    expect(classify({ name: "X" })).toBe("landscape");
  });
});
