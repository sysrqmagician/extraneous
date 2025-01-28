import { ExtensionConfig } from "../config_popup.ts";
import { VideoInfo } from "../extractor.ts";

export function additionalLinksVideoPage(
  currentVideo: VideoInfo,
  config: ExtensionConfig,
) {
  const insertAfterElement = document.querySelector("p#embed-link");
  if (!insertAfterElement) {
    throw new Error("Unable to find insertAfterElement");
  }

  if (config.additionalLinks.cobaltTools) {
    const encodedWatchUrl = encodeURIComponent(
      `https://www.youtube.com/watch?v=${currentVideo.videoId}`,
    );

    const innerLink = document.createElement("a");
    innerLink.href = `https://cobalt.tools/?u=${encodedWatchUrl}`;
    innerLink.textContent = `Download from cobalt.tools`;

    const outerParagraph = document.createElement("p");
    outerParagraph.appendChild(innerLink);

    insertAfterElement.insertAdjacentElement("afterend", outerParagraph);
  }
}

export function additionalLinksErrorPage(config: ExtensionConfig) {
  const insertIntoList = document.querySelector("#contents ul");

  if (config.additionalLinks.cobaltTools) {
    const videoId = new URLSearchParams(document.location.search).get("v")!;
    const encodedWatchUrl = encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`,
    );

    const outerLi = document.createElement("li");
    const innerLink = document.createElement("a");
    innerLink.href = `https://cobalt.tools/?u=${encodedWatchUrl}`;
    innerLink.textContent = `Download from cobalt.tools`;

    outerLi.appendChild(innerLink);
    insertIntoList?.insertAdjacentElement("beforeend", outerLi);
  }
}
