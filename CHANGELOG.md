# Changelog

## 0.3.0 (2026-11-22): first test release

Tested on Foundry 14.369 with dnd5e 5.3.2. Includes everything from 0.1.0 and 0.2.0, which were never released.

- Hype Track window: choose a theme from any world playlist (grouped, Hype Tracks first), preview it locally, save or clear.
- Open it from the actor sheet header menu, the combat tracker's right-click menu, or the Actors sidebar's right-click menu. GM only.
- Works with ApplicationV2 sheets (dnd5e 5.x) and older ApplicationV1 sheets.
- API: `openConfig(actor)`.

## 0.2.0 (not released)

- Hype tracks play automatically when a combatant's turn starts, and stop when combat ends.
- Other audio is paused while a hype track plays and resumes from the same position (setting).
- Setting for turns with no hype track: stop and resume paused audio (default), or keep playing.
- Hidden combatants don't play their theme.
- Playback state is kept in the world, so a GM reload in the middle of combat recovers.
- API: `end()`, `sync(combat)`, `getState()`. `play()` and `stop()` are now queued.

## 0.1.0 (not released)

- Module skeleton for Foundry v13 and v14.
- Actor flag for a hype track, with a macro-friendly API (`setTrack`, `getTrack`, `clearTrack`, `play`, `stop`).
- Optional "Hype Tracks" playlist in Soundboard Only mode.
- Not yet: playing automatically on combat turns (Phase 3) and the config dialog (Phase 4).
