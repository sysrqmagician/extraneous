// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";

const LABEL_WATCHED: string = "Watched";
const LABEL_UNWATCHED: string = "Unwatched";

export function watchedVideoPage(currentVideo: VideoInfo) {
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
    watchedButton.textContent = LABEL_WATCHED;
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
      watchedButton.textContent = backgroundResponse.value
        ? LABEL_WATCHED
        : LABEL_UNWATCHED;

      watchedButton.addEventListener("click", function () {
        const newValue = !(watchedButton.textContent === LABEL_WATCHED);
        browser.runtime.sendMessage({
          type: "setWatched",
          videoId: currentVideo.videoId,
          value: newValue,
        } as BackgroundRequest);
        watchedButton.textContent = newValue ? LABEL_WATCHED : LABEL_UNWATCHED;
        console.log(watchedButton.textContent);
      });
    });
}

export function watchedFeedPage(feed_videos: Array<VideoInfo>) {
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
