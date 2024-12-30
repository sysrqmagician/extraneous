// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { extractCurrentVideo, extractFeedFromPage } from "./extractor.ts";
import { BackgroundResponse, BackgroundRequest } from "./background.ts";
import { getConfig } from "./popup.ts";

export enum PageType {
  WatchVideo,
  Feed,
  Unknown,
}

async function injectScript() {
  if (
    !document.head
      .querySelector("meta[property='og:site_name']")
      ?.getAttribute("content")
      ?.endsWith("Invidious")
  )
    return;

  let pageType;
  if (document.location.pathname === "/watch") {
    pageType = PageType.WatchVideo;
  } else if (
    document.location.pathname.startsWith("/feed") ||
    document.location.pathname.startsWith("/channel/")
  ) {
    pageType = PageType.Feed;
  } else {
    pageType = PageType.Unknown;
  }

  const config = await getConfig();
  if (pageType == PageType.WatchVideo && config.watched.enabled) {
    const currentVideo = extractCurrentVideo();
    const watchedButton: HTMLButtonElement = document.createElement("button");
    watchedButton.style.display = "inline-block";
    currentVideo.element.parentElement
      ?.querySelector("h1") // get the title
      ?.appendChild(watchedButton);

    document.querySelector("video")?.addEventListener("ended", () => {
      browser.runtime.sendMessage({
        type: "setWatched",
        videoId: currentVideo.videoId,
        value: true,
      } as BackgroundRequest);
      watchedButton.textContent = "Watched";
      watchedButton.value = "1";
    });

    browser.runtime
      .sendMessage({
        type: "isWatched",
        videoId: currentVideo.videoId,
      } as BackgroundRequest)
      .then((response) => {
        const backgroundResponse = response as Extract<
          BackgroundResponse,
          { type: "isWatched" }
        >;
        watchedButton.value = backgroundResponse.value ? "1" : "0";
        watchedButton.textContent = backgroundResponse.value
          ? "Watched"
          : "Unwatched";

        watchedButton.addEventListener("click", function () {
          const newValue = !(watchedButton.value === "1");
          browser.runtime.sendMessage({
            type: "setWatched",
            videoId: currentVideo.videoId,
            value: newValue,
          } as BackgroundRequest);
          watchedButton.value = newValue ? "1" : "0";
          watchedButton.textContent = newValue ? "Watched" : "Unwatched";
          console.log(watchedButton.textContent);
        });
      });
  }

  const feed_videos = extractFeedFromPage(pageType);
  if (config.watched.enabled) {
    for (const video of feed_videos) {
      browser.runtime
        .sendMessage({
          type: "isWatched",
          videoId: video.videoId,
        } as BackgroundRequest)
        .then((response) => {
          const backgroundResponse = response as Extract<
            BackgroundResponse,
            { type: "isWatched" }
          >;
          if (backgroundResponse.value) {
            video.element.style.filter = "blur(1px) sepia(1)";
          }
        });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
