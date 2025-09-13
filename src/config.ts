// @deno-types="webextension-polyfill-types"
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
