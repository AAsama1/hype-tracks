/**
 * Shared playback layer. Feature code (Hype Track now, Combat Track later) asks this
 * module to start or stop a PlaylistSound; only the active GM's client acts, because
 * playlist state is a database update that syncs to every client on its own.
 *
 * Phase 3 extends this with: persisting the current sound across a GM reload,
 * pausing and resuming other playlists, and fades.
 */
import { resolveSound } from "./data.mjs";

/** UUID of the sound this module last started. In-memory for now (Phase 3 persists it). */
let currentUuid = null;

/** True only on the one client that should perform playback updates. */
export function isActiveGM() {
  return !!game.user?.isGM && game.users.activeGM?.id === game.user.id;
}

export function getCurrent() {
  return currentUuid ? resolveSound(currentUuid) : null;
}

/**
 * Play a sound, stopping the previously started one first.
 * Does nothing if the sound is already playing (same actor twice in a row).
 * @returns {Promise<boolean>} true if this client acted
 */
export async function play(soundLike) {
  if (!isActiveGM()) return false;
  const sound = resolveSound(soundLike);
  if (!sound) return false;
  if (currentUuid && currentUuid !== sound.uuid) await stop();
  if (!sound.playing) await sound.parent.playSound(sound);
  currentUuid = sound.uuid;
  return true;
}

/**
 * Stop the sound this module last started, if it is still playing.
 * @returns {Promise<boolean>} true if this client acted
 */
export async function stop() {
  if (!isActiveGM() || !currentUuid) return false;
  const sound = getCurrent();
  currentUuid = null;
  if (sound?.playing) await sound.parent.stopSound(sound);
  return true;
}
