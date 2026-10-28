import type { AudioCatalog } from "@/domain/audio";

/**
 * MANAradio catalog — DEMONSTRATION ONLY.
 *
 * No licensed audio is currently configured. Every entry has `sourceUrl: null`,
 * which the UI renders as an honest "unavailable" state. When audio rights are
 * secured (CC0, licensed, or original recordings), entries can point to real
 * resources without UI changes.
 */
export const RADIO_CATALOG: AudioCatalog = {
  tracks: [
    {
      id: "radio-1",
      title: "Marée du soir",
      kind: "nature",
      durationLabel: "30 min",
      sourceUrl: null,
      sourceAttribution: "À venir — enregistrement à définir",
    },
    {
      id: "radio-2",
      title: "Vent dans les pins",
      kind: "nature",
      durationLabel: "20 min",
      sourceUrl: null,
      sourceAttribution: "À venir — enregistrement à définir",
    },
    {
      id: "radio-3",
      title: "Aube lente",
      kind: "ambient",
      durationLabel: "15 min",
      sourceUrl: null,
      sourceAttribution: "À venir — composition à définir",
    },
  ],
};
