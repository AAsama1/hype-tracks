/**
 * Reading and writing hype track assignments on Actors.
 *
 * Flag shape (flags["hype-tracks"].track):
 *   { schema: 1, sound: "Playlist.<id>.PlaylistSound.<id>" }
 *
 * Unlinked tokens: writing through token.actor stores the flag in the token's
 * ActorDelta, so each unlinked token can have its own track while falling back
 * to the base actor's track when it has none.
 */
import { MODULE_ID, FLAG_TRACK, FLAG_SCHEMA, t, warn } from "../constants.mjs";

function safeFromUuidSync(uuid) {
  try {
    return fromUuidSync(uuid) ?? null;
  } catch (err) {
    return null;
  }
}

/**
 * Resolve an Actor, TokenDocument, Token placeable, Combatant, or UUID string to an Actor.
 * @returns {Actor|null}
 */
export function resolveActor(target) {
  if (!target) return null;
  if (typeof target === "string") target = safeFromUuidSync(target);
  if (!target) return null;
  if (target.documentName === "Actor") return target;
  return target.actor ?? null;
}

/**
 * Resolve a PlaylistSound or UUID string to a PlaylistSound.
 * @returns {PlaylistSound|null}
 */
export function resolveSound(target) {
  if (!target) return null;
  if (typeof target === "string") target = safeFromUuidSync(target);
  return target?.documentName === "PlaylistSound" ? target : null;
}

export function requireGM() {
  if (!game.user?.isGM) throw new Error(t("Errors.GMOnly"));
}

/** Raw flag data, or null. */
export function getTrackData(actorLike) {
  const actor = resolveActor(actorLike);
  return actor?.getFlag(MODULE_ID, FLAG_TRACK) ?? null;
}

/**
 * The PlaylistSound assigned to an actor, or null if none is set or it was deleted.
 * @returns {PlaylistSound|null}
 */
export function getTrack(actorLike) {
  const data = getTrackData(actorLike);
  if (!data?.sound) return null;
  const sound = resolveSound(data.sound);
  if (!sound) warn(`Hype track ${data.sound} no longer exists.`);
  return sound;
}

export function hasTrack(actorLike) {
  return !!getTrack(actorLike);
}

/**
 * Assign a hype track to an actor. GM only. World playlists only.
 * @returns {Promise<PlaylistSound>}
 */
export async function setTrack(actorLike, soundLike) {
  requireGM();
  const actor = resolveActor(actorLike);
  if (!actor) throw new Error(t("Errors.NoActor"));
  const sound = resolveSound(soundLike);
  if (!sound) throw new Error(t("Errors.NoSound"));
  if (sound.pack || sound.parent?.pack) throw new Error(t("Errors.CompendiumSound"));

  // A sequential or shuffled playlist starts its next track when this one ends on its own.
  const { SEQUENTIAL, SHUFFLE } = CONST.PLAYLIST_MODES;
  if ([SEQUENTIAL, SHUFFLE].includes(sound.parent?.mode)) {
    ui.notifications?.warn(t("Warnings.AutoAdvance", { playlist: sound.parent.name, sound: sound.name }));
  }

  await actor.setFlag(MODULE_ID, FLAG_TRACK, { schema: FLAG_SCHEMA, sound: sound.uuid });
  return sound;
}

/** Remove an actor's hype track. GM only. */
export async function clearTrack(actorLike) {
  requireGM();
  const actor = resolveActor(actorLike);
  if (!actor) throw new Error(t("Errors.NoActor"));
  await actor.unsetFlag(MODULE_ID, FLAG_TRACK);
}
