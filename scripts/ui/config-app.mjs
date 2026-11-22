/**
 * The Hype Track configuration window: pick a track for one actor, with a local preview.
 * Opened from the actor sheet header, the combat tracker, the Actors sidebar, or the API.
 */
import { MODULE_ID, t } from "../constants.mjs";
import { resolveActor, resolveSound, getTrack, setTrack, clearTrack, requireGM } from "../core/data.mjs";
import { getManagedPlaylist } from "../core/playlist.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HypeTrackConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @param {{actor: Actor}} options */
  constructor({ actor, ...options } = {}) {
    super({ id: HypeTrackConfig.idFor(actor), ...options });
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    classes: ["hype-tracks-config"],
    tag: "form",
    window: { icon: "fa-solid fa-music", contentClasses: ["standard-form"] },
    position: { width: 440, height: "auto" },
    form: { handler: HypeTrackConfig.#onSubmit, closeOnSubmit: true },
    actions: { preview: HypeTrackConfig.#onPreview }
  };

  // Each part must render exactly one top-level element, so the footer is its own part.
  static PARTS = {
    form: { template: `modules/${MODULE_ID}/templates/config.hbs` },
    footer: { template: `modules/${MODULE_ID}/templates/footer.hbs` }
  };

  /** One window per actor (token actors have their own UUID). */
  static idFor(actor) {
    return `${MODULE_ID}-config-${actor.uuid.replaceAll(".", "-")}`;
  }

  /** The Sound playing as a local preview, if any. */
  #preview = null;

  get title() {
    return t("Config.Title", { name: this.actor.name });
  }

  async _prepareContext(options) {
    const current = getTrack(this.actor);
    const managed = getManagedPlaylist();

    // The module's own playlist first, then the rest alphabetically. Empty playlists are skipped.
    const playlists = game.playlists.contents
      .filter(p => p.sounds.size)
      .sort((a, b) => (b === managed) - (a === managed) || a.name.localeCompare(b.name));

    return {
      selectId: `${this.id}-sound`,
      actorName: this.actor.name,
      isToken: this.actor.isToken,
      currentName: current?.name ?? null,
      noPlaylists: !playlists.length,
      groups: playlists.map(p => ({
        label: p.name,
        sounds: p.sounds.contents
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(s => ({ uuid: s.uuid, name: s.name, selected: s.uuid === current?.uuid }))
      })),
      previewing: !!this.#preview
    };
  }

  /** Save the selection: a sound sets the track, "None" clears it. */
  static async #onSubmit(event, form, formData) {
    const uuid = formData.object.sound;
    try {
      if (uuid) await setTrack(this.actor, uuid);
      else await clearTrack(this.actor);
    } catch (err) {
      ui.notifications.error(err.message);
      throw err;
    }
  }

  /** Toggle a preview of the selected sound, heard only by this user. */
  static async #onPreview(event, target) {
    if (this.#preview) {
      this.#stopPreview();
    } else {
      const select = this.element.querySelector("select[name='sound']");
      const sound = resolveSound(select?.value);
      if (!sound?.path) return;
      // socketOptions false: play on this client only, not for the players.
      this.#preview = await foundry.audio.AudioHelper.play(
        { src: sound.path, volume: sound.volume ?? 1, autoplay: true, loop: false, channel: "music" },
        false
      );
    }
    this.#updatePreviewButton();
  }

  #stopPreview() {
    this.#preview?.stop?.();
    this.#preview = null;
  }

  #updatePreviewButton() {
    const button = this.element?.querySelector("[data-action='preview']");
    if (!button) return;
    const playing = !!this.#preview;
    button.setAttribute("aria-pressed", String(playing));
    button.dataset.tooltip = t(playing ? "Config.StopPreview" : "Config.Preview");
    button.setAttribute("aria-label", button.dataset.tooltip);
    button.querySelector("i")?.classList.replace(playing ? "fa-play" : "fa-stop", playing ? "fa-stop" : "fa-play");
  }

  /** Changing the selection stops a running preview, so it never plays the wrong track. */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    if (event.target?.name === "sound" && this.#preview) {
      this.#stopPreview();
      this.#updatePreviewButton();
    }
  }

  _onClose(options) {
    this.#stopPreview();
    super._onClose(options);
  }
}

/**
 * Open (or bring to front) the config window for an actor. GM only.
 * @param {Actor|TokenDocument|Token|Combatant|string} actorLike
 */
export function openConfig(actorLike) {
  try {
    requireGM();
  } catch (err) {
    ui.notifications.warn(err.message);
    return null;
  }
  const actor = resolveActor(actorLike);
  if (!actor) {
    ui.notifications.warn(t("Errors.NoActor"));
    return null;
  }
  const existing = foundry.applications.instances?.get(HypeTrackConfig.idFor(actor));
  const app = existing ?? new HypeTrackConfig({ actor });
  app.render({ force: true });
  return app;
}
