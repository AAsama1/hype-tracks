/**
 * The optional "Hype Tracks" playlist the module creates for convenience.
 * Any world playlist can hold hype tracks; this one is just a tidy default.
 * It is created in "Soundboard only" mode so a track ending never starts another one.
 */
import { MODULE_ID, FLAG_MANAGED, SETTINGS, t, log } from "../constants.mjs";

export function getManagedPlaylist() {
  const id = game.settings.get(MODULE_ID, SETTINGS.PLAYLIST_ID);
  return game.playlists.get(id)
    ?? game.playlists.find(p => p.getFlag(MODULE_ID, FLAG_MANAGED))
    ?? null;
}

/** Find or create the managed playlist. GM only; returns null for players. */
export async function ensurePlaylist() {
  if (!game.user?.isGM) return null;
  let playlist = getManagedPlaylist();
  if (!playlist) {
    playlist = await CONFIG.Playlist.documentClass.create({
      name: t("Playlist.Name"),
      mode: CONST.PLAYLIST_MODES.DISABLED,
      flags: { [MODULE_ID]: { [FLAG_MANAGED]: true } }
    });
    log(`Created playlist "${playlist.name}" (${playlist.id}).`);
  }
  if (playlist && game.settings.get(MODULE_ID, SETTINGS.PLAYLIST_ID) !== playlist.id) {
    await game.settings.set(MODULE_ID, SETTINGS.PLAYLIST_ID, playlist.id);
  }
  return playlist;
}
