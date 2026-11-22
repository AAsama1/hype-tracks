/**
 * Public API: game.modules.get("hype-tracks").api
 *
 * Every function accepts an Actor, TokenDocument, Token, Combatant or UUID string
 * where it takes an actor, and a PlaylistSound or UUID string where it takes a sound.
 */
import { resolveActor, getTrack, getTrackData, hasTrack, setTrack, clearTrack } from "./core/data.mjs";
import { play, stop, getCurrent, isActiveGM } from "./core/playback.mjs";
import { ensurePlaylist, getManagedPlaylist } from "./core/playlist.mjs";

export const api = Object.freeze({
  // Assignments
  getTrack,
  getTrackData,
  hasTrack,
  setTrack,
  clearTrack,

  // Playback (only the active GM's client acts; others return false)
  /** Play the actor's hype track. Resolves false if it has none or this client isn't the active GM. */
  async play(actorLike) {
    const sound = getTrack(resolveActor(actorLike));
    return sound ? play(sound) : false;
  },
  stop,
  getCurrent,
  isActiveGM,

  // Playlist
  getPlaylist: getManagedPlaylist,
  ensurePlaylist
});
