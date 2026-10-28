/**
 * Domain: audio catalog contract for MANAradio, Sleep and Action modes.
 * No copyrighted material is implied or referenced; implementations must
 * only expose audio they have the rights to (e.g. licensed, CC0, or
 * user-provided).
 */

export type AudioKind = "nature" | "ambient" | "guided" | "music";

export interface AudioTrack {
  id: string;
  title: string;
  kind: AudioKind;
  /** Human duration hint, e.g. "12 min" — display only. */
  durationLabel: string;
  /**
   * URL of the audio resource, or null when the catalog entry exists but
   * no licensed resource is configured yet (unavailable state).
   */
  sourceUrl: string | null;
  sourceAttribution: string;
}

export interface AudioCatalog {
  tracks: readonly AudioTrack[];
}

/**
 * Playback contract. Implementations wrap the platform audio stack
 * (HTMLAudioElement) so UI components never touch it directly.
 * Autoplay is never used; playback only starts from explicit user action.
 */
export interface AudioPlayer {
  load(track: AudioTrack): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  readonly state: AudioPlayerState;
}

export type AudioPlayerState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "playing"; trackId: string }
  | { phase: "paused"; trackId: string }
  | { phase: "error"; message: string };
