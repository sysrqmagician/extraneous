// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";

type DeArrowData = {
  thumbnailUrl: string;
  title: string;
};

export function deArrowVideoPage(currentVideo: VideoInfo) {}
export function deArrowFeedPage(feed_videos: Array<VideoInfo>) {
  for (const video of feed_videos) {
    browser.runtime
      .sendMessage({
        type: "deArrow",
        videoId: video.videoId,
      } as BackgroundRequest)
      .then((response) => {
        const backgroundResponse = response as Extract<
          BackgroundResponse,
          { type: "deArrow" }
        >;
        video.element
          .querySelector("img.thumbnail")
          ?.setAttribute("src", backgroundResponse.thumbnailUri);

        const titleElement = video.element.querySelector(
          "div.video-card-row > a > p[dir='auto']",
        );
        if (backgroundResponse.title && titleElement) {
          titleElement.textContent = backgroundResponse.title;
        }
      });
  }
}
