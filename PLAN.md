# Hype Tracks: development plan

A standalone Foundry VTT module that recreates the Hype Track feature of the retired
Maestro module: each actor can have a theme track that plays when their combat turn starts.

## Decisions (22 Nov 2026)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Playback source | Playlist sounds (PlaylistSound UUIDs). A "Hype Tracks" playlist is auto-created for convenience, but any world playlist works. |
| 2 | Who assigns tracks | GM only in v1. |
| 3 | Fork or rewrite | Clean-room rewrite. Maestro is GPL-3.0 and targets v10, so none of its code is reused. |
| 4 | Scope | Hype Track only. The shared playback layer is kept separate so Combat Track can be added later. |
| 5 | Module ID | `hype-tracks`. Not taken on the Foundry package list as of 22 Nov 2026. Permanent once published. |
| 6 | Foundry versions | Minimum v13. Main target v14. |
| | System | System-agnostic: only core Actor, Combat, Combatant, Playlist and PlaylistSound are used. D&D 5e is the main test system. |
| 7 | License | MIT. |
| 8 | Repo | Public `AAsama1/hype-tracks` (public so Foundry can install from the manifest URL). |
| 9 | Turn passes to an actor with no track | Stop the current hype track by default. A world setting lets the GM keep it playing instead. |

## Architecture

```
scripts/
  main.mjs            init/ready hooks, exposes the API
  constants.mjs       module id, flag keys, settings keys, logging, i18n helper
  settings.mjs        world settings
  api.mjs             public API object (game.modules.get("hype-tracks").api)
  core/
    data.mjs          actor flag read/write, resolving actors and sounds
    playback.mjs      shared play/stop layer; only the active GM acts
    playlist.mjs      the managed "Hype Tracks" playlist
  features/           (Phase 3) hype-track.mjs: the combat driver
  apps/               (Phase 4) the config dialog
```

**Data model.** `actor.flags["hype-tracks"].track = { schema: 1, sound: "<PlaylistSound UUID>" }`.
The `schema` number lets later versions migrate the flag. Writing via `token.actor` on an
unlinked token stores the flag in that token's ActorDelta, so unlinked tokens can each have
their own track and fall back to the base actor's track otherwise.

**Who acts.** Hooks such as `combatTurnChange` fire on every client. Playlist playback is a
database update that syncs to everyone, so only `game.users.activeGM` performs it. This
prevents several clients from fighting over playback.

## Phases

| Phase | Content | Status |
| --- | --- | --- |
| 0 | Ground facts from the target world (versions, playlist modes, any old Maestro flags) | Waiting for console output |
| 1 | Repo skeleton, manifest, release and check workflows | **Done** |
| 2 | Flag data model, API, managed playlist, console tests | **Done (untested in Foundry)** |
| 3 | Combat driver: play on turn change, stop on combat end, pause and resume other audio, survive a GM reload | Next |
| 4 | UI: ApplicationV2 config dialog with tracks grouped by playlist and a preview button; actor sheet header button; combat tracker context menu entry | |
| 5 | Settings: pause other audio, fade duration, loop or play once, skip hidden or defeated combatants, "actor with no track" behaviour (stop by default, or keep playing) | |
| 6 | Maestro migration macro (only if Phase 0 finds old flags) | |
| 7 | Test matrix: v13 and v14, dnd5e plus one other system, linked and unlinked tokens, mid-combat reload, two GMs | |
| 8 | Release on GitHub, then optionally list on foundryvtt.com | |

### Phase 3 detail (combat driver)

- `combatTurnChange(combat, prior, current)` fires on every client after the update. Only the
  active GM acts. New turn: `combat.combatant?.actor`, then `play(getTrack(actor))`, or `stop()` if it has none.
- Also handle `combatStart` (first turn) and `deleteCombat` / combat end (stop and resume other audio).
- Persist "currently playing hype track" and "what we paused" in a world setting so a GM reload
  in the middle of combat recovers cleanly.
- Pausing other audio: record playing sounds and their positions, stop them, and restore them
  afterwards. Check how core represents a pause (`PlaylistSound#pausedTime`) before relying on it.
- Edge cases: same actor twice in a row (keep playing), no track (stop by default; setting to keep playing),
  hidden or defeated combatants, several simultaneous combats (act only for the active/viewed combat).

## Verified API facts (from foundryvtt.com/api, v14 docs, 22 Nov 2026)

| API | Status |
| --- | --- |
| `combatTurnChange(combat, prior, current)`: fires on all clients after the Combat update | Verified |
| `combatStart`, `combatRound`, `combatTurn` hooks exist | Verified (names) |
| `Playlist#playSound(sound)`, `#stopSound(sound)`, `#playAll()`, `#stopAll()`, `#playNext()` | Verified |
| `PlaylistSound` fields `playing`, `repeat`, `volume`, `fade`, `pausedTime`, `path` | Verified (names); `pausedTime` semantics unverified |
| `getHeaderControlsApplicationV2(app, controls)`; entries are `{ icon, label, action, visible, ownership }` with **no onClick**, so the button's `action` must exist in that sheet's `options.actions` | Verified; injection approach to test in Phase 4 |
| Combat tracker: `CombatTracker#_getEntryContextOptions()` builds combatant menu entries | Verified; **hook name and entry field names unverified**, check in console in Phase 4 |
| Flags, settings, document CRUD unchanged in v14 | Per community v13→v14 migration notes |
| `CONST.PLAYLIST_MODES.DISABLED` (-1, "Soundboard Only") | From memory; checked by the Phase 0 script |

## Known risks

1. **Auto-advance.** In a Sequential or Shuffle playlist, a track that ends on its own starts the
   next one, which could be another actor's theme. Mitigated by the auto-created playlist using
   Soundboard Only mode, plus a warning when assigning from a sequential or shuffled playlist.
2. **Header button on third-party sheets.** Header controls take an `action` name, not a
   callback, so the handler has to be registered on the sheet instance. dnd5e AppV2 sheets and
   any remaining AppV1 sheets (`getApplicationV1HeaderButtons`) need separate handling.
3. **Two GMs connected.** Handled by acting only on `game.users.activeGM`.
4. **Font Awesome 7 in v14.** Pick icons that exist in both FA6 (v13) and FA7 (v14).
