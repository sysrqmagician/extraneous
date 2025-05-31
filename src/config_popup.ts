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
    highlightReplacedTitles: boolean;
    keepOriginalThumbnails: boolean;
    keepOriginalTitles: boolean;
  };
  additionalLinks: {
    cobaltTools: boolean;
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
    highlightReplacedTitles: true,
    keepOriginalThumbnails: false,
    keepOriginalTitles: false,
  },
  additionalLinks: {
    cobaltTools: true,
  },
} as ExtensionConfig;

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
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      getConfig().then((config) => {
        setter(config, input.value);
        browser.storage.local.set({ config });
        flashGreen(input);
      });
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
