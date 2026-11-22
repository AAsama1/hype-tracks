import { MODULE_ID, SETTINGS } from "./constants.mjs";

export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.AUTO_PLAYLIST, {
    name: "HYPE_TRACKS.Settings.AutoPlaylist.Name",
    hint: "HYPE_TRACKS.Settings.AutoPlaylist.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Internal: id of the playlist this module created, so renaming it doesn't lose it.
  game.settings.register(MODULE_ID, SETTINGS.PLAYLIST_ID, {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}
