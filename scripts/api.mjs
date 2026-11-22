/**
 * Public API: game.modules.get("hype-tracks").api
 *
 * Every function accepts an Actor, TokenDocument, Token, Combatant or UUID string
 * where it takes an actor, and a PlaylistSound or UUID string where it takes a sound.
 * Playback functions only act on the active GM's client and resolve false elsewhere.
 */
import { resolveActor, getTrack, getTrackData, hasTrack, setTrack, clearTrack } from "./core/data.mjs";
import { play, stop, end, getCurrent, getState, isActiveGM } from "./core/playback.mjs";
import { ensurePlaylist, getManagedPlaylist } from "./core/playlist.mjs";
import { syncCombat } from "./features/hype-track.mjs";

export const api = Object.freeze({
  // Assignments
  getTrack,
  getTrackData,
  hasTrack,
  setTrack,
  clearTrack,

  // Playback
  /** Play the actor's hype track. Resolves false if it has none or this client isn't the active GM. */
  async play(actorLike) {
    const sound = getTrack(resolveActor(actorLike));
    return sound ? play(sound) : false;
  },
  /** Stop the current hype track and resume paused audio. */
  stop,
  /** Stop, resume paused audio, and forget the current combat. */
  end,
  /** Re-check a combat (default: the viewed one) and play the right track. */
  sync: syncCombat,
  getCurrent,
  getState,
  isActiveGM,

  // Playlist
  getPlaylist: getManagedPlaylist,
  ensurePlaylist
});
