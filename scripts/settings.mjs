import { MODULE_ID, SETTINGS, NO_TRACK } from "./constants.mjs";

export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.AUTO_PLAYLIST, {
    name: "HYPE_TRACKS.Settings.AutoPlaylist.Name",
    hint: "HYPE_TRACKS.Settings.AutoPlaylist.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.PAUSE_OTHERS, {
    name: "HYPE_TRACKS.Settings.PauseOthers.Name",
    hint: "HYPE_TRACKS.Settings.PauseOthers.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.NO_TRACK, {
    name: "HYPE_TRACKS.Settings.NoTrack.Name",
    hint: "HYPE_TRACKS.Settings.NoTrack.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      [NO_TRACK.STOP]: "HYPE_TRACKS.Settings.NoTrack.Stop",
      [NO_TRACK.KEEP]: "HYPE_TRACKS.Settings.NoTrack.Keep"
    },
    default: NO_TRACK.STOP
  });

  // Internal: id of the playlist this module created, so renaming it doesn't lose it.
  game.settings.register(MODULE_ID, SETTINGS.PLAYLIST_ID, {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Internal: what the module is currently playing and what it paused.
  // Stored in the world so a GM reload in the middle of combat can recover.
  game.settings.register(MODULE_ID, SETTINGS.STATE, {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
}
