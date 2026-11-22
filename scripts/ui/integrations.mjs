/**
 * Entry points into the config window from core and system UI. GM only.
 *
 * - Actor sheet header: ApplicationV2 sheets (dnd5e 5.x and most current systems) and
 *   ApplicationV1 sheets (older systems).
 * - Combat tracker: right-click a combatant.
 * - Actors sidebar: right-click an actor.
 */
import { t } from "../constants.mjs";
import { openConfig } from "./config-app.mjs";

const ACTION = "hypeTracksConfigure";
const ICON = "fa-solid fa-music";

/* -------------------------------------------- */
/*  Actor sheet header                           */
/* -------------------------------------------- */

/**
 * ApplicationV2 header controls take an action name, not a callback, so the handler is
 * added to this sheet instance's actions before the control is rendered.
 */
function onHeaderControlsV2(app, controls) {
  if (!game.user.isGM || !app.document || app.document.documentName !== "Actor") return;
  app.options.actions ??= {};
  app.options.actions[ACTION] ??= function () { openConfig(this.document); };
  if (controls.some(c => c.action === ACTION)) return;
  controls.push({ action: ACTION, icon: ICON, label: "HYPE_TRACKS.Config.Button", visible: true });
}

/** ApplicationV1 sheets take a button with an onclick callback. */
function onHeaderButtonsV1(app, buttons) {
  if (!game.user.isGM || !app.actor) return;
  if (buttons.some(b => b.class === "hype-tracks")) return;
  buttons.unshift({
    label: t("Config.Button"),
    class: "hype-tracks",
    icon: ICON,
    onclick: () => openConfig(app.actor)
  });
}

/* -------------------------------------------- */
/*  Context menus                                */
/* -------------------------------------------- */

/**
 * Build a context menu entry in the shape this Foundry version expects.
 * v14: { label, icon, visible, onClick(event, target) }
 * v13: { name, icon, condition, callback(target) }
 * @param {(target: HTMLElement) => void} onClick
 */
function menuEntry(onClick) {
  const icon = `<i class="${ICON}"></i>`;
  const label = "HYPE_TRACKS.Config.Button";
  if (game.release.generation >= 14) {
    return { label, icon, visible: game.user.isGM, onClick: (event, target) => onClick(target) };
  }
  return { name: label, icon, condition: game.user.isGM, callback: li => onClick(li?.dataset ? li : li?.[0]) }; // element, or jQuery-wrapped element
}

const hasOurEntry = items => items.some(i => (i.label ?? i.name) === "HYPE_TRACKS.Config.Button");

function onCombatantContext(app, items) {
  if (!game.user.isGM || hasOurEntry(items)) return;
  items.push(menuEntry(target => {
    const combatant = app.viewed?.combatants.get(target.dataset.combatantId);
    if (combatant) openConfig(combatant);
  }));
}

function onActorDirectoryContext(app, items) {
  if (!game.user.isGM || hasOurEntry(items)) return;
  items.push(menuEntry(target => {
    const id = target.dataset.entryId ?? target.dataset.documentId;
    const actor = game.actors.get(id);
    if (actor) openConfig(actor);
  }));
}

/* -------------------------------------------- */

export function registerIntegrations() {
  Hooks.on("getHeaderControlsActorSheetV2", onHeaderControlsV2);
  Hooks.on("getActorSheetHeaderButtons", onHeaderButtonsV1);

  // VERIFY: the combat tracker's hook name. Both plausible names are registered;
  // hasOurEntry() stops a duplicate if both fire. Remove the unused one after testing.
  Hooks.on("getCombatantContextOptions", onCombatantContext);
  Hooks.on("getCombatTrackerEntryContext", onCombatantContext);

  Hooks.on("getActorContextOptions", onActorDirectoryContext);
}
