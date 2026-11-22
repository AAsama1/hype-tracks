export const MODULE_ID = "hype-tracks";

/** Flag key on Actors holding the hype track assignment. */
export const FLAG_TRACK = "track";

/** Flag key on Playlists created and managed by this module. */
export const FLAG_MANAGED = "managed";

/** Bump when the shape of the actor flag changes, and add a migration. */
export const FLAG_SCHEMA = 1;

export const SETTINGS = Object.freeze({
  AUTO_PLAYLIST: "autoCreatePlaylist",
  PAUSE_OTHERS: "pauseOtherAudio",
  NO_TRACK: "noTrackBehavior",
  PLAYLIST_ID: "playlistId",
  STATE: "playbackState"
});

/** Values of the NO_TRACK setting. */
export const NO_TRACK = Object.freeze({
  STOP: "stop",
  KEEP: "keep"
});

export const log = (...args) => console.log(`${MODULE_ID} |`, ...args);
export const warn = (...args) => console.warn(`${MODULE_ID} |`, ...args);
export const error = (...args) => console.error(`${MODULE_ID} |`, ...args);

/** Localize a key under the module namespace. */
export const t = (key, data) =>
  data ? game.i18n.format(`HYPE_TRACKS.${key}`, data) : game.i18n.localize(`HYPE_TRACKS.${key}`);
