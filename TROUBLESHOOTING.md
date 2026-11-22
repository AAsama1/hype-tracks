# Troubleshooting log

One row per attempt, so a later session can pick up where the last one stopped.

| Date | Foundry / system | Symptom | Hypothesis | Change made | Observed result |
| --- | --- | --- | --- | --- | --- |
| 2026-11-22 | Foundry 14.369, dnd5e 5.3.2 | Phase 0 and Phase 2 console tests (manual install) | Data layer and API work in a real world | None: first run of 0.1.0 | Pass. Playlist created in mode -1, flag stored as `{schema: 1, sound: uuid}`, `getTrack` resolved, `play` started the sound and `stop` stopped it, `clearTrack` returned null. No Maestro flags in the world. Extra checks (player client, unlinked token, sequential warning, deleted sound) not yet run. |
