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
