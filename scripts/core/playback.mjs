/**
 * Shared playback layer. Feature code (Hype Track now, Combat Track later) asks this
 * module to start or stop a PlaylistSound. Only the active GM's client acts, because
 * playlist state is a database update that syncs to every client on its own.
 *
 * State lives in a hidden world setting rather than in memory, so that a GM reload, or
 * a different GM taking over, picks up where things were:
 *   { combatId, turnKey, current: <sound uuid>, paused: [<sound uuid>, ...] }
 *
 * All changes go through `enqueue`, so two hooks firing at the same moment can't
 * interleave their playlist updates.
 */
import { MODULE_ID, SETTINGS, error } from "../constants.mjs";
import { resolveSound } from "./data.mjs";

const EMPTY_STATE = Object.freeze({ combatId: null, turnKey: null, current: null, paused: [] });

/** True only on the one client that should perform playback updates. */
export function isActiveGM() {
  return !!game.user?.isGM && game.users.activeGM?.id === game.user.id;
}

/* -------------------------------------------- */
/*  Queue                                        */
/* -------------------------------------------- */

let queue = Promise.resolve();

/**
 * Run an async task after every previously queued task has finished.
 * Errors are logged rather than breaking the queue.
 */
export function enqueue(task) {
  const run = queue.then(task).catch(err => {
    error("Playback task failed.", err);
    return false;
  });
  queue = run;
  return run;
}

/* -------------------------------------------- */
/*  State                                        */
/* -------------------------------------------- */

export function getState() {
  const stored = game.settings.get(MODULE_ID, SETTINGS.STATE) ?? {};
  return { ...EMPTY_STATE, ...stored, paused: [...(stored.paused ?? [])] };
}

export async function saveState(state) {
  await game.settings.set(MODULE_ID, SETTINGS.STATE, state);
}

export function getCurrent() {
  return resolveSound(getState().current);
}

/* -------------------------------------------- */
/*  Pausing other audio                          */
/* -------------------------------------------- */

/**
 * Pause every playing sound except `exceptUuid`, keeping each one's position.
 * Mirrors what the Playlists sidebar's pause button does: playing false plus pausedTime.
 * @returns {Promise<string[]>} UUIDs of the sounds that were paused
 */
async function pauseOthers(exceptUuid) {
  const paused = [];
  for (const playlist of game.playlists) {
    const toPause = playlist.sounds.filter(s => s.playing && s.uuid !== exceptUuid);
    if (!toPause.length) continue;
    const pausedIds = new Set(toPause.map(s => s.id));
    await playlist.update({
      playing: playlist.sounds.some(s => s.playing && !pausedIds.has(s.id)),
      sounds: toPause.map(s => ({ _id: s.id, playing: false, pausedTime: s.sound?.currentTime ?? null }))
    });
    paused.push(...toPause.map(s => s.uuid));
  }
  return paused;
}

/** Resume the sounds listed in state.paused, from where they were paused. */
async function resumeOthers(state) {
  for (const uuid of state.paused) {
    const sound = resolveSound(uuid);
    // Skip sounds that were deleted, or that someone already started again by hand.
    if (sound && !sound.playing) await sound.parent.playSound(sound);
  }
  state.paused = [];
}

/* -------------------------------------------- */
/*  Playback (call these inside enqueue)         */
/* -------------------------------------------- */

/**
 * Play a hype sound: stop the previous one, pause other audio if enabled, then start it.
 * Does nothing if this sound is already the current one and still playing.
 */
export async function playNow(sound) {
  if (!isActiveGM() || !sound) return false;
  const state = getState();
  if (state.current === sound.uuid && sound.playing) return true;

  const previous = resolveSound(state.current);
  if (previous && previous.uuid !== sound.uuid && previous.playing) await previous.parent.stopSound(previous);

  if (game.settings.get(MODULE_ID, SETTINGS.PAUSE_OTHERS)) {
    state.paused.push(...await pauseOthers(sound.uuid));
  }

  await sound.parent.playSound(sound);
  state.current = sound.uuid;
  await saveState(state);
  return true;
}

/** Stop the current hype sound and resume whatever was paused for it. */
export async function stopNow() {
  if (!isActiveGM()) return false;
  const state = getState();
  const sound = resolveSound(state.current);
  if (sound?.playing) await sound.parent.stopSound(sound);
  state.current = null;
  await resumeOthers(state);
  await saveState(state);
  return true;
}

/** Stop everything and forget the combat. Used when combat ends. */
export async function endNow() {
  if (!isActiveGM()) return false;
  await stopNow();
  await saveState({ ...EMPTY_STATE });
  return true;
}

/** Record which combat turn the current state belongs to. */
export async function setTurn(combatId, turnKey) {
  const state = getState();
  state.combatId = combatId;
  state.turnKey = turnKey;
  await saveState(state);
}

/* -------------------------------------------- */
/*  Queued wrappers for the public API           */
/* -------------------------------------------- */

export const play = soundLike => enqueue(() => playNow(resolveSound(soundLike)));
export const stop = () => enqueue(stopNow);
export const end = () => enqueue(endNow);
