// @deno-types="webextension-polyfill-types"
import browser from "webextension-polyfill";
import * as collections from "@std/collections";

import { getConfig } from "./config.ts";

const output = document.getElementById("output") as HTMLParagraphElement;
const data_export = document.getElementById("data_export") as HTMLButtonElement;
data_export.addEventListener("click", async () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(await browser.storage.local.get(null))], {
      type: "application/json",
    }),
  );

  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.download = "extraneous_data.json";
  tempLink.click();
  URL.revokeObjectURL(url);
});

const data_import = document.getElementById("data_import") as HTMLButtonElement;
data_import.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      await browser.storage.local.clear();
      await browser.storage.local.set(JSON.parse(await file.text()));
      output.innerText = "Restored data successfully.";
    } catch (error) {
      output.innerText = `Failed to restore: ${error}`;
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
});

const data_import_add = document.getElementById(
  "data_import_add",
) as HTMLButtonElement;
data_import_add.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const currentData = await browser.storage.local.get(null);
      const importData = JSON.parse(await file.text());
      const mergedData = collections.deepMerge(importData, currentData, {
        arrays: "replace",
      });

      await browser.storage.local.set(mergedData);
      output.innerText = "Imported data successfully.";
    } catch (error) {
      output.innerText = `Failed to import: ${error}`;
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
});

const data_reset = document.getElementById("data_reset") as HTMLButtonElement;
data_reset.addEventListener("click", async () => {
  await browser.storage.local.clear();
  output.innerText = "Cleared storage.";
});

const data_debug = document.getElementById("data_debug") as HTMLButtonElement;
const debug_out = document.getElementById(
  "output_debug",
) as HTMLTextAreaElement;
data_debug.addEventListener("click", async () => {
  debug_out.textContent = `**Platform Info**
\`\`\`json
${JSON.stringify(await browser.runtime.getPlatformInfo(), null, 2)}
\`\`\`

**Browser Info**
\`\`\`json
${JSON.stringify(await browser.runtime.getBrowserInfo(), null, 2)}
\`\`\`

**Config**
\`\`\`json
${JSON.stringify(await getConfig(), null, 2)}
\`\`\`
`;
});
