# Changelog

## 0.2.0 (unreleased)

- Hype tracks play automatically when a combatant's turn starts, and stop when combat ends.
- Other audio is paused while a hype track plays and resumes from the same position (setting).
- Setting for turns with no hype track: stop and resume paused audio (default), or keep playing.
- Hidden combatants don't play their theme.
- Playback state is kept in the world, so a GM reload in the middle of combat recovers.
- API: `end()`, `sync(combat)`, `getState()`. `play()` and `stop()` are now queued.

## 0.1.0

- Module skeleton for Foundry v13 and v14.
- Actor flag for a hype track, with a macro-friendly API (`setTrack`, `getTrack`, `clearTrack`, `play`, `stop`).
- Optional "Hype Tracks" playlist in Soundboard Only mode.
- Not yet: playing automatically on combat turns (Phase 3) and the config dialog (Phase 4).
