# Hype Tracks

Give each actor a theme song that plays automatically when their turn comes up in combat.
A standalone, up-to-date take on the Hype Track feature from the retired Maestro module,
written from scratch for Foundry VTT v13 and v14.

- System-agnostic: uses only core Actors, Combats and Playlists. Built and tested with D&D 5e.
- Tracks are ordinary playlist sounds, so the GM can see and stop them in the Playlists sidebar.
- GM-only assignment.

> **Status: 0.3.0, test release.** Hype tracks play automatically on combat turns and are
> assigned from the actor sheet, the combat tracker or the Actors sidebar. Tested on Foundry
> 14.369 with dnd5e 5.3.2; v13 is supported but not yet tested. See [PLAN.md](PLAN.md).

## How it behaves

- When a combatant's turn starts, their hype track plays. The previous one stops.
- Other playing audio is paused while a hype track plays and resumes from the same spot
  afterwards (setting: *Pause other audio during hype tracks*).
- On a turn with no hype track, the theme stops and paused audio resumes. A setting can keep
  the previous theme playing instead.
- Hidden combatants don't play their theme, so it doesn't give them away.
- When combat ends, everything is stopped and paused audio resumes.
- If the GM reloads in the middle of combat, the module picks up where it was.

**Known limitation:** a browser that reloads, or joins, while a hype track is playing hears
it from the beginning (after its first click, because of browser autoplay rules). This is how
Foundry plays all audio on load. Everyone else keeps hearing it without a break.

## Install

In Foundry: **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/AAsama1/hype-tracks/releases/latest/download/module.json
```

## Usage

1. Enable the module. A **Hype Tracks** playlist is created (Soundboard Only mode).
2. Add sounds to it, or use any other world playlist.
3. As GM, open **Hype Track** from any of these:
   - the actor sheet's header menu
   - right-click a combatant in the combat tracker
   - right-click an actor in the Actors sidebar
4. Pick a theme, preview it with ▶ (only you hear the preview), and **Save**.

Opening it from an unlinked token's sheet or combatant gives that one token its own theme.

### From a macro

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
| `stop()` | Stop the current hype track and resume paused audio. Active GM only. |
| `end()` | Stop, resume paused audio and forget the current combat. Active GM only. |
| `sync(combat?)` | Re-check a combat (default: the viewed one) and play the right track. |
| `getCurrent()` | The hype track this module is playing, or `null`. |
| `getState()` | Internal playback state, for debugging. |
| `getPlaylist()` / `ensurePlaylist()` | The managed playlist. |
| `openConfig(actor)` | Open the Hype Track window for an actor. GM only. |

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
