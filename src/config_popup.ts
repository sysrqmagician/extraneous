// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import * as collections from "@std/collections";

export type ExtensionConfig = {
  watched: {
    enabled: boolean;
    cssFilter: string;
  };
  hideSlop: {
    enabled: boolean;
    badTitleRegex: string;
    minDuration: string;
  };
  deArrow: {
    enabled: boolean;
    trustedOnly: boolean;
    hideInitialThumbnail: boolean;
  };
};

/**
 * Retrieves the extension configuration from browser storage.
 * If no configuration exists, creates a new one using default values.
 * For existing configurations, merges them with default values to ensure
 * all expected properties exist, preserving user-set values where possible.
 *
 * @returns A Promise that resolves to the complete ExtensionConfig object
 */
export async function getConfig(): Promise<ExtensionConfig> {
  const records = await browser.storage.local.get("config");
  let config = records.config as Partial<ExtensionConfig>;

  if (!config) {
    await browser.storage.local.set({ config: default_config });
    config = default_config;
  } else {
    config = collections.deepMerge(default_config, config, {
      arrays: "replace",
    });
    await browser.storage.local.set({ config });
  }

  return config as ExtensionConfig;
}

const default_config = {
  watched: {
    enabled: true,
    cssFilter: "blur(1px) sepia(1)",
  },
  hideSlop: {
    enabled: true,
    badTitleRegex: "^.*#short.*$",
    minDuration: "00:10:00",
  },
  deArrow: {
    enabled: true,
    trustedOnly: true,
    hideInitialThumbnail: false,
  },
} as ExtensionConfig;

function flashGreen(element: HTMLInputElement) {
  element.classList.add("flash-green");
  globalThis.setTimeout(() => {
    element.classList.remove("flash-green");
  }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
  getConfig().then((config) => {
    const watchedEnabledCheckbox = document.getElementById(
      "watched_enabled",
    ) as HTMLInputElement;
    watchedEnabledCheckbox.checked = config.watched.enabled;
    watchedEnabledCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.watched.enabled = watchedEnabledCheckbox.checked;
        browser.storage.local.set({ config });
      });
    });

    const watchedCssFilterInput = document.getElementById(
      "watched_cssFilter",
    ) as HTMLInputElement;
    watchedCssFilterInput.value = config.watched.cssFilter;
    watchedCssFilterInput.addEventListener("keydown", function (e) {
      if (e.key == "Enter") {
        getConfig().then((config) => {
          config.watched.cssFilter = watchedCssFilterInput.value;
          browser.storage.local.set({ config });
          flashGreen(watchedCssFilterInput);
        });
      }
    });

    const hideSlopEnabledCheckbox = document.getElementById(
      "hideSlop_enabled",
    ) as HTMLInputElement;
    hideSlopEnabledCheckbox.checked = config.hideSlop.enabled;
    hideSlopEnabledCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.hideSlop.enabled = hideSlopEnabledCheckbox.checked;
        browser.storage.local.set({ config });
        flashGreen(hideSlopEnabledCheckbox);
      });
    });

    const hideSlopBadTitleRegexInput = document.getElementById(
      "hideSlop_badTitleRegex",
    ) as HTMLInputElement;
    hideSlopBadTitleRegexInput.value = config.hideSlop.badTitleRegex;
    hideSlopBadTitleRegexInput.addEventListener("keydown", function (e) {
      if (e.key == "Enter") {
        getConfig().then((config) => {
          config.hideSlop.badTitleRegex = hideSlopBadTitleRegexInput.value;
          browser.storage.local.set({ config });
          flashGreen(hideSlopBadTitleRegexInput);
        });
      }
    });

    const hideSlopMinDurationInput = document.getElementById(
      "hideSlop_minDuration",
    ) as HTMLInputElement;
    hideSlopMinDurationInput.value = config.hideSlop.minDuration;
    hideSlopMinDurationInput.addEventListener("keydown", function (e) {
      if (e.key == "Enter") {
        getConfig().then((config) => {
          config.hideSlop.minDuration = hideSlopMinDurationInput.value;
          browser.storage.local.set({ config });
          flashGreen(hideSlopMinDurationInput);
        });
      }
    });

    const deArrowEnabledCheckbox = document.getElementById(
      "deArrow_enabled",
    ) as HTMLInputElement;
    deArrowEnabledCheckbox.checked = config.deArrow.enabled;
    deArrowEnabledCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.deArrow.enabled = deArrowEnabledCheckbox.checked;
        browser.storage.local.set({ config });
        flashGreen(deArrowEnabledCheckbox);
      });
    });

    const deArrowTrustedOnlyCheckbox = document.getElementById(
      "deArrow_trustedOnly",
    ) as HTMLInputElement;
    deArrowTrustedOnlyCheckbox.checked = config.deArrow.trustedOnly;
    deArrowTrustedOnlyCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.deArrow.trustedOnly = deArrowTrustedOnlyCheckbox.checked;
        browser.storage.local.set({ config });
        flashGreen(deArrowTrustedOnlyCheckbox);
      });
    });

    const deArrowHideInitialCheckbox = document.getElementById(
      "deArrow_hideInitialThumbnail",
    ) as HTMLInputElement;
    deArrowHideInitialCheckbox.checked = config.deArrow.hideInitialThumbnail;
    deArrowHideInitialCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.deArrow.hideInitialThumbnail =
          deArrowHideInitialCheckbox.checked;
        browser.storage.local.set({ config });
        flashGreen(deArrowHideInitialCheckbox);
      });
    });
  });
});
