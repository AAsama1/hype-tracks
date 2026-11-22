import { MODULE_ID, SETTINGS, log, error } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { api } from "./api.mjs";
import { isActiveGM } from "./core/playback.mjs";
import { ensurePlaylist } from "./core/playlist.mjs";
import { registerHypeTrack, recover } from "./features/hype-track.mjs";
import { registerIntegrations } from "./ui/integrations.mjs";

Hooks.once("init", () => {
  try {
    registerSettings();
  } catch (err) {
    error("Failed to register settings.", err);
  }
  registerHypeTrack();
  registerIntegrations();
  game.modules.get(MODULE_ID).api = api;
  log("Initialized.");
});

Hooks.once("ready", async () => {
  // Only the active GM creates the playlist, so two GMs don't create two.
  if (isActiveGM() && game.settings.get(MODULE_ID, SETTINGS.AUTO_PLAYLIST)) {
    try {
      await ensurePlaylist();
    } catch (err) {
      error("Failed to create the Hype Tracks playlist.", err);
    }
  }
  recover();
  Hooks.callAll(`${MODULE_ID}.ready`, api);
});
