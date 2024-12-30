console.log("Content script loaded");

import { extractFromPage } from "./extractor.ts";

function injectScript() {
  const vids = extractFromPage();
  console.log(vids);
}

// Run when document is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
