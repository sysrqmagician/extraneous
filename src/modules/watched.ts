// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";
import { ExtensionConfig } from "../config_popup.ts";

/** Button text for watched videos */
const LABEL_WATCHED: string = "Watched";
/** Button text for unwatched videos */
const LABEL_UNWATCHED: string = "Unwatched";

/**
 * Adds watched/unwatched button functionality to a video page
 * @param currentVideo The video information for the current page
 */
export function watchedVideoPage(currentVideo: VideoInfo) {
  const watchedButton: HTMLButtonElement = document.createElement("button");
  watchedButton.style.display = "inline-block";
  currentVideo.element.parentElement
    ?.querySelector("h1") // get the title
    ?.appendChild(watchedButton);

  // Mark video as watched when it ends
  document.querySelector("video")?.addEventListener("ended", () => {
    browser.runtime.sendMessage({
      type: "setWatched",
      videoId: currentVideo.videoId,
      value: true,
    } as BackgroundRequest);
    watchedButton.textContent = LABEL_WATCHED;
  });

  // Initialize button state based on watched status
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
      watchedButton.textContent = backgroundResponse.value
        ? LABEL_WATCHED
        : LABEL_UNWATCHED;

      // Toggle watched status on button click
      watchedButton.addEventListener("click", function () {
        const newValue = !(watchedButton.textContent === LABEL_WATCHED);
        browser.runtime.sendMessage({
          type: "setWatched",
          videoId: currentVideo.videoId,
          value: newValue,
        } as BackgroundRequest);
        watchedButton.textContent = newValue ? LABEL_WATCHED : LABEL_UNWATCHED;
      });
    });
}

/**
 * Applies visual effects to watched videos in the feed
 * @param feed_videos Array of video information from the feed
 */
export function watchedFeed(
  feed_videos: Array<VideoInfo>,
  config: ExtensionConfig,
) {
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
          (video.element as HTMLDivElement).style.filter =
            config.watched.cssFilter;
        }
      });
  }
}
