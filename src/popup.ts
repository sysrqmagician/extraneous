// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";

export type ExtensionConfig = {
  watched: {
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
} as ExtensionConfig;

document.addEventListener("DOMContentLoaded", () => {
  getConfig().then((config) => {
    const watched_enabled_checkbox = document.getElementById(
      "watched_enabled",
    ) as HTMLInputElement;
    watched_enabled_checkbox.checked = config.watched.enabled;
    watched_enabled_checkbox.addEventListener("change", function () {
      config.watched.enabled = watched_enabled_checkbox.checked;
      browser.storage.local.set({ ["config"]: config });
    });
  });
});
