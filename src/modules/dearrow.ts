// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";

type DeArrowData = {
  thumbnailUrl: string;
  title: string;
};

export function deArrowVideoPage(currentVideo: VideoInfo) {
  browser.runtime
    .sendMessage({
      type: "deArrow",
      videoId: currentVideo.videoId,
    } as BackgroundRequest)
    .then((response) => {
      const backgroundResponse = response as Extract<
        BackgroundResponse,
        { type: "deArrow" }
      >;
      const titleElement = document.querySelector("div.h-box > h1");
      if (backgroundResponse.title && titleElement) {
        const textChild = titleElement.childNodes[0];
        if (textChild && textChild.nodeType == Node.TEXT_NODE) {
          textChild.textContent = backgroundResponse.title;
          titleElement.setAttribute("title", currentVideo.title); // Set tooltip to original title
        }
      }
    });
}

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
          titleElement.setAttribute("title", video.title); // Set tooltip to original title
          titleElement.textContent = backgroundResponse.title;
        }
      });
  }
}