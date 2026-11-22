# Testing

Use a scratch world with only your game system and this module enabled. Run everything
below as a GM, in the browser console (F12). Hard-reload (Ctrl+Shift+R) after changing files.

## Phase 0: ground facts

```js
console.log(game.version, game.system.id, game.system.version,
  game.modules.get("hype-tracks")?.active, game.modules.get("hype-tracks")?.version,
  CONST.PLAYLIST_MODES, game.users.activeGM?.name);
// Old Maestro data, if any (for the Phase 6 migration):
console.log(game.actors.filter(a => a.flags?.maestro).map(a => [a.name, a.flags.maestro]));
```

Expected: `CONST.PLAYLIST_MODES` contains `DISABLED: -1`, `SEQUENTIAL`, `SHUFFLE` and
`SIMULTANEOUS`, and `activeGM` is your user.

## Phase 2: data layer and API

Before running: add at least one sound to the **Hype Tracks** playlist, and have an
actor in the world.

```js
const api = game.modules.get("hype-tracks").api;
const pl = api.getPlaylist();
console.log("playlist:", pl?.name, "mode:", pl?.mode);           // expect "Hype Tracks", -1

const actor = game.actors.contents[0];
const sound = pl.sounds.contents[0];
await api.setTrack(actor, sound);
console.log("flag:", actor.getFlag("hype-tracks", "track"));      // expect { schema: 1, sound: "Playlist...PlaylistSound..." }
console.log("getTrack:", api.getTrack(actor)?.name);               // expect the sound's name

await api.play(actor);   // the sound should start, for every connected client
```

Then, after a few seconds:

```js
const api = game.modules.get("hype-tracks").api;
await api.stop();                                                  // the sound should stop
await api.clearTrack(game.actors.contents[0]);
console.log("after clear:", api.getTrack(game.actors.contents[0])); // expect null
```

### Extra checks

- **Player client:** in a player's console, `await game.modules.get("hype-tracks").api.setTrack(...)`
  should throw "Only a GM can change hype tracks." `api.play(...)` should return `false` and play nothing.
- **Unlinked token:** select a token whose actor is unlinked, then run
  `await api.setTrack(canvas.tokens.controlled[0], sound)`. The base actor's flag should be
  unchanged: `game.actors.get(canvas.tokens.controlled[0].document.actorId).getFlag("hype-tracks","track")`.
- **Sequential playlist warning:** assign a sound from a playlist set to Sequential. You should get a
  yellow warning notification.
- **Deleted sound:** assign a track, delete that sound, then run `api.getTrack(actor)`. It should
  return `null` and log a warning instead of throwing.

Paste back the console output, including any red errors (the first one matters most).

## Phase 3: combat driver

Setup:
- Two sounds in **Hype Tracks** and one actor each (call them A and B), assigned with `api.setTrack`.
- A third actor C with no track.
- A "background" sound in another playlist, **already playing** before combat starts.
- A combat with A, B and C, initiative rolled so the order is A, B, C.

Keep the console open the whole time so you see any red errors.

| Step | Expected |
| --- | --- |
| 1. Begin combat (A's turn) | Background music pauses; A's theme starts. |
| 2. Next turn (B) | A's theme stops; B's theme starts; background stays paused. |
| 3. Next turn (C, no track) | B's theme stops; background **resumes from where it paused**, not from the start. |
| 4. Next turn (round 2, A) | Background pauses again; A's theme starts. |
| 5. Stop A's theme by hand in the Playlists sidebar, then change something on a combatant (e.g. toggle a status) | A's theme stays stopped until the turn changes. |
| 6. Next turn (B), then **reload the GM browser** (F5) | After reload, B's theme is still playing and doesn't restart. |
| 7. Next turn after the reload (C) | B's theme stops; background resumes. Proves state survived the reload. |
| 8. End combat | Any hype track stops; background resumes. |

Extra checks:
- **Hidden combatant:** hide A in the tracker before its turn. Its theme shouldn't play.
- **"Keep playing" setting:** set *When the next combatant has no hype track* to "Keep the previous
  hype track playing" and repeat step 3. B's theme should keep going on C's turn.
- **Pause off:** turn off *Pause other audio during hype tracks*. The background should keep playing
  under the themes.

After any step that looks wrong, run this and paste it back:

```js
const api = game.modules.get("hype-tracks").api;
console.log(api.getState());
console.log(game.playlists.contents.flatMap(p => p.sounds.contents
  .filter(s => s.playing || s.pausedTime).map(s => [p.name, s.name, s.playing, s.pausedTime])));
```

## Phase 4: user interface

Before starting, run this **once in the GM console** so we learn which combat tracker hook fires:

```js
for (const name of ["getCombatantContextOptions", "getCombatTrackerEntryContext"])
  Hooks.on(name, () => console.log("HOOK FIRED:", name));
```

| Step | Expected |
| --- | --- |
| 1. Open a dnd5e character sheet as GM. Open the sheet's header menu (the "⋮" or controls button). | A **Hype Track** entry with a music icon. |
| 2. Click it. | A window titled "Hype Track: *name*" opens. The dropdown lists sounds grouped by playlist, with **Hype Tracks** first. If the actor has a theme it's preselected. |
| 3. Pick a sound and click the ▶ button. | You hear it. A player connected at the same time does **not**. The button turns into ⏹. |
| 4. Pick a different sound while the preview plays. | The preview stops. |
| 5. Click ▶ again, then close the window. | The preview stops when the window closes. |
| 6. Reopen, pick a sound, click **Save**. | The window closes. Reopening shows that sound selected. |
| 7. Reopen, choose **None**, **Save**. | The theme is removed (reopen shows None). |
| 8. Right-click a combatant in the combat tracker. | A **Hype Track** entry that opens the window for that combatant. The console shows which `HOOK FIRED:` name(s) ran. |
| 9. Right-click an actor in the Actors sidebar. | A **Hype Track** entry that opens the window for that actor. |
| 10. Open the sheet of an unlinked token (double-click the token). | The window shows the note about unlinked tokens; a theme saved here applies to that token only. |
| 11. Log in as a player and open an owned character sheet. | No Hype Track entry anywhere (sheet, tracker, sidebar). |
| 12. Open an NPC sheet (a different sheet class from characters). | Same Hype Track entry as step 1. |

Paste back the `HOOK FIRED:` lines from step 8 and any red errors.

