/**
 * Hype Track: play the current combatant's track whenever the turn changes.
 *
 * Every relevant hook calls the same idempotent `sync(combat)`, which works out what
 * should be playing from the combat's current state. A "turn key" is stored so that
 * repeated hooks for the same turn do nothing, and a track the GM stopped by hand stays
 * stopped until the turn moves on.
 */
import { MODULE_ID, SETTINGS, NO_TRACK } from "../constants.mjs";
import { getTrack } from "../core/data.mjs";
import { isActiveGM, enqueue, getState, setTurn, playNow, stopNow, endNow } from "../core/playback.mjs";

/** Identifies one specific turn: changes when the round, turn index or current combatant changes. */
function turnKey(combat) {
  return [combat.id, combat.round, combat.turn, combat.combatant?.id ?? ""].join(".");
}

/** The sound a combatant should play, or null. */
function soundFor(combatant) {
  if (!combatant) return null;
  // A hidden combatant's theme would give it away. (Becomes a setting in Phase 5.)
  if (combatant.hidden) return null;
  return getTrack(combatant.actor);
}

/** Bring playback in line with the combat's current turn. Run inside the queue. */
async function sync(combat) {
  if (!combat) return;
  const state = getState();

  // Combat not running (not started yet, or reset to round 0).
  if (!combat.started) {
    if (state.combatId === combat.id) await endNow();
    return;
  }

  const key = turnKey(combat);
  if (state.turnKey === key) return;
  await setTurn(combat.id, key);

  const sound = soundFor(combat.combatant);
  if (sound) await playNow(sound);
  else if (game.settings.get(MODULE_ID, SETTINGS.NO_TRACK) === NO_TRACK.STOP) await stopNow();
}

/** Queue a sync on the active GM's client only. Hooks fire on every client. */
function requestSync(combat) {
  if (isActiveGM()) enqueue(() => sync(combat));
}

export function registerHypeTrack() {
  Hooks.on("updateCombat", combat => requestSync(combat));
  // Adding, removing or editing combatants (initiative, hidden) can change who is current.
  Hooks.on("createCombatant", combatant => requestSync(combatant.parent));
  Hooks.on("updateCombatant", combatant => requestSync(combatant.parent));
  Hooks.on("deleteCombatant", combatant => requestSync(combatant.parent));

  Hooks.on("deleteCombat", combat => {
    if (!isActiveGM()) return;
    enqueue(async () => {
      if (getState().combatId === combat.id) await endNow();
    });
  });
}

/**
 * After a reload: re-sync the combat we were following, or clean up if it ended
 * while no GM was connected.
 */
export function recover() {
  if (!isActiveGM()) return;
  enqueue(async () => {
    const { combatId } = getState();
    if (!combatId) return;
    const combat = game.combats.get(combatId);
    if (combat?.started) await sync(combat);
    else await endNow();
  });
}

/** Exposed through the API, e.g. for a macro that forces a re-check. */
export function syncCombat(combat = game.combat) {
  return enqueue(() => sync(combat));
}
