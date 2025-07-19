// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { ExtensionConfig, getConfig } from "./config.ts";

function flashGreen(element: HTMLInputElement) {
  element.classList.add("flash-green");
  globalThis.setTimeout(() => {
    element.classList.remove("flash-green");
  }, 200);
}

function setupCheckbox(
  id: string,
  getter: (c: ExtensionConfig) => boolean,
  setter: (c: ExtensionConfig, val: boolean) => void,
  config: ExtensionConfig,
) {
  const checkbox = document.getElementById(id) as HTMLInputElement;
  checkbox.checked = getter(config);
  checkbox.addEventListener("change", () => {
    getConfig().then((config) => {
      setter(config, checkbox.checked);
      browser.storage.local.set({ config });
      flashGreen(checkbox);
    });
  });
}

function setupInput(
  id: string,
  getter: (c: ExtensionConfig) => string,
  setter: (c: ExtensionConfig, val: string) => void,
  config: ExtensionConfig,
) {
  const input = document.getElementById(id) as HTMLInputElement;
  input.value = getter(config);

  const apply = () => {
    getConfig().then((config) => {
      setter(config, input.value);
      browser.storage.local.set({ config });
      flashGreen(input);
    });
  };

  input.addEventListener("blur", apply);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      apply();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getConfig().then((config) => {
    setupCheckbox(
      "watched_enabled",
      (c) => c.watched.enabled,
      (c, val) => (c.watched.enabled = val),
      config,
    );

    setupInput(
      "watched_cssFilter",
      (c) => c.watched.cssFilter,
      (c, val) => (c.watched.cssFilter = val),
      config,
    );

    setupCheckbox(
      "hideSlop_enabled",
      (c) => c.hideSlop.enabled,
      (c, val) => (c.hideSlop.enabled = val),
      config,
    );

    setupInput(
      "hideSlop_badTitleRegex",
      (c) => c.hideSlop.badTitleRegex,
      (c, val) => (c.hideSlop.badTitleRegex = val),
      config,
    );

    setupInput(
      "hideSlop_minDuration",
      (c) => c.hideSlop.minDuration,
      (c, val) => (c.hideSlop.minDuration = val),
      config,
    );

    setupCheckbox(
      "deArrow_enabled",
      (c) => c.deArrow.enabled,
      (c, val) => (c.deArrow.enabled = val),
      config,
    );

    setupCheckbox(
      "deArrow_trustedOnly",
      (c) => c.deArrow.trustedOnly,
      (c, val) => (c.deArrow.trustedOnly = val),
      config,
    );

    setupCheckbox(
      "deArrow_hideInitialThumbnail",
      (c) => c.deArrow.hideInitialThumbnail,
      (c, val) => (c.deArrow.hideInitialThumbnail = val),
      config,
    );

    setupCheckbox(
      "deArrow_highlightReplacedTitles",
      (c) => c.deArrow.highlightReplacedTitles,
      (c, val) => (c.deArrow.highlightReplacedTitles = val),
      config,
    );

    setupCheckbox(
      "deArrow_keepOriginalThumbnails",
      (c) => c.deArrow.keepOriginalThumbnails,
      (c, val) => (c.deArrow.keepOriginalThumbnails = val),
      config,
    );

    setupCheckbox(
      "deArrow_keepOriginalTitles",
      (c) => c.deArrow.keepOriginalTitles,
      (c, val) => (c.deArrow.keepOriginalTitles = val),
      config,
    );

    setupCheckbox(
      "additionalLinks_cobaltTools",
      (c) => c.additionalLinks.cobaltTools,
      (c, val) => (c.additionalLinks.cobaltTools = val),
      config,
    );
  });
});

document.getElementById("data_opentab")!.addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL("popup/data.html") });
});
