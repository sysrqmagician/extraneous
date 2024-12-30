console.log("Content script loaded");

function injectScript() {
  const div = document.createElement("div");
  div.textContent = "Injected by extension!";
  document.body.appendChild(div);
}

// Run when document is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
