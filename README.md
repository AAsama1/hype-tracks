# Hype Tracks

Give each actor a theme song that plays automatically when their turn comes up in combat.
A standalone, up-to-date take on the Hype Track feature from the retired Maestro module,
written from scratch for Foundry VTT v13 and v14.

- System-agnostic: uses only core Actors, Combats and Playlists. Built and tested with D&D 5e.
- Tracks are ordinary playlist sounds, so the GM can see and stop them in the Playlists sidebar.
- GM-only assignment.

> **Status: 0.1.0, in development.** The data layer and API work. Automatic playback on
> combat turns (Phase 3) and the configuration dialog (Phase 4) are next. See [PLAN.md](PLAN.md).

## Install

In Foundry: **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/AAsama1/hype-tracks/releases/latest/download/module.json
```

## Usage (current, via macro)

1. Enable the module. A **Hype Tracks** playlist is created (Soundboard Only mode).
2. Add sounds to it, or use any other world playlist.
3. Assign a track to an actor from a GM macro:

```js
const api = game.modules.get("hype-tracks").api;
const actor = game.actors.getName("Grog");
const sound = api.getPlaylist().sounds.getName("Grog's Theme");
await api.setTrack(actor, sound);
```

For an unlinked token, pass the token (`canvas.tokens.controlled[0]`) to give that one
token its own track.

## API

`game.modules.get("hype-tracks").api`

| Function | Description |
| --- | --- |
| `setTrack(actor, sound)` | Assign a world PlaylistSound. GM only. |
| `getTrack(actor)` | The assigned PlaylistSound, or `null`. |
| `hasTrack(actor)` | Boolean. |
| `clearTrack(actor)` | Remove the assignment. GM only. |
| `play(actor)` | Play the actor's track (stops the previous hype track). Active GM only. |
| `stop()` | Stop the current hype track. Active GM only. |
| `getCurrent()` | The hype track this module is playing, or `null`. |
| `getPlaylist()` / `ensurePlaylist()` | The managed playlist. |

`actor` can be an Actor, TokenDocument, Token, Combatant or UUID. `sound` can be a
PlaylistSound or UUID. The hook `hype-tracks.ready` fires with the API once the world is ready.

## Development

Symlink the repo into your Foundry data folder and hard-reload (Ctrl+Shift+R) after edits:

```bash
ln -s /path/to/hype-tracks "<user-data>/Data/modules/hype-tracks"
```

Testing steps are in [docs/testing.md](docs/testing.md). Releases: publish a GitHub
release tagged `vX.Y.Z`, and the workflow attaches `module.json` and `module.zip`.

## License

MIT
