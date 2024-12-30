// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";

export type ExtensionConfig = {
  watched: {
    enabled: boolean;
  };
  hideSlop: {
    enabled: boolean;
    badTitleRegex: string;
    minDuration: string;
  };
  deArrow: {
    enabled: boolean;
  };
};

export async function getConfig(): Promise<ExtensionConfig> {
  const records = await browser.storage.local.get("config");
  let config = records["config"] as ExtensionConfig;
  if (!config) {
    await browser.storage.local.set({ ["config"]: default_config });
    config = default_config;
  }

  return config;
}

const default_config = {
  watched: {
    enabled: true,
  },
  hideSlop: {
    enabled: true,
    badTitleRegex: "^.*#short.*$",
    minDuration: "00:10:00",
  },
  deArrow: {
    enabled: true,
  },
} as ExtensionConfig;

document.addEventListener("DOMContentLoaded", () => {
  getConfig().then((config) => {
    const watchedEnabledCheckbox = document.getElementById(
      "watched_enabled",
    ) as HTMLInputElement;
    watchedEnabledCheckbox.checked = config.watched.enabled;
    watchedEnabledCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.watched.enabled = watchedEnabledCheckbox.checked;
        browser.storage.local.set({ ["config"]: config });
      });
    });

    const hideSlopEnabledCheckbox = document.getElementById(
      "hideSlop_enabled",
    ) as HTMLInputElement;
    hideSlopEnabledCheckbox.checked = config.hideSlop.enabled;
    hideSlopEnabledCheckbox.addEventListener("change", function () {
      getConfig().then((config) => {
        config.hideSlop.enabled = hideSlopEnabledCheckbox.checked;
        browser.storage.local.set({ ["config"]: config });
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
          browser.storage.local.set({ ["config"]: config });
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
          browser.storage.local.set({ ["config"]: config });
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
        browser.storage.local.set({ ["config"]: config });
      });
    });
  });
});
