import browser from "webextension-polyfill";

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById(
    "toggleButton",
  ) as HTMLButtonElement;

  // Load saved state
  browser.storage.local.get("enabled").then((result: { enabled: boolean }) => {
    toggleButton.textContent = result.enabled ? "Disable" : "Enable";
  });

  // Toggle button handler
  toggleButton.addEventListener("click", async () => {
    const result = await browser.storage.local.get("enabled");
    const newState = !result.enabled;

    await browser.storage.local.set({ enabled: newState });
    toggleButton.textContent = newState ? "Disable" : "Enable";
  });
});
