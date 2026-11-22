# Troubleshooting log

One row per attempt, so a later session can pick up where the last one stopped.

| Date | Foundry / system | Symptom | Hypothesis | Change made | Observed result |
| --- | --- | --- | --- | --- | --- |
| 2026-11-22 | Foundry 14.369, dnd5e 5.3.2 | Phase 0 and Phase 2 console tests (manual install) | Data layer and API work in a real world | None: first run of 0.1.0 | Pass. Playlist created in mode -1, flag stored as `{schema: 1, sound: uuid}`, `getTrack` resolved, `play` started the sound and `stop` stopped it, `clearTrack` returned null. No Maestro flags in the world. Extra checks (player client, unlinked token, sequential warning, deleted sound) not yet run. |
| 2026-11-22 | Foundry 14.369, dnd5e 5.3.2 | 0.2.0 (Phase 3 branch): Phase 0, Phase 2 and extended checks (manual install) | Combat driver works in a real world | None | Pass. Hype tracks start and stop on turns, background music pauses and resumes from the same position. No issues reported. |
| 2026-11-22 | Foundry 14.369, dnd5e 5.3.2 | Hype track restarts from the beginning after a GM browser refresh mid-combat | (A) Core Foundry behaviour: a reloading client starts every playing sound from 0, and only that client restarts. (B) Module bug: `recover()` re-plays the sound, which would restart it for everyone | None: ran a two-client test | **A confirmed.** The player console logged no playlist or sound updates when the GM reloaded, so the module didn't touch playback. The GM console showed `Foundry VTT | Activating pending audio playback with user gesture`: the browser holds audio until the first click after a reload, then Foundry starts it from 0. Accepted as a known limitation. |
