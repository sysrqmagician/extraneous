// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";
import { parseDurationSeconds } from "./hideslop.ts";
import { ExtensionConfig } from "../config_popup.ts";

/**
 * Applies DeArrow alternatives to a video page, replacing clickbait titles
 * with community-submitted alternatives
 * @param currentVideo The video information for the current page
 */
export function deArrowVideoPage(
  currentVideo: VideoInfo,
  config: ExtensionConfig,
) {
  const videoDuration = currentVideo.duration
    ? parseDurationSeconds(currentVideo.duration)
    : null;
  const videoElement: HTMLVideoElement | null = document.querySelector("video");
  if (!videoElement) {
    throw new Error("Unable to get video element");
  }
  const vjsPosterElement: HTMLDivElement | null = document.querySelector(
    "div.vjs-poster",
  );
  const previousThumbnailUrl = videoElement.poster;

  if (config.deArrow.hideInitialThumbnail) {
    videoElement.poster = "";
    if (vjsPosterElement) {
      vjsPosterElement.style.backgroundImage = "none";
    }
  }

  browser.runtime
    .sendMessage({
      type: "deArrow",
      videoId: currentVideo.videoId,
      videoDuration,
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

      if (vjsPosterElement) {
        vjsPosterElement.style.backgroundImage = `url(${
          backgroundResponse.thumbnailUri ?? previousThumbnailUrl
        })`;
      }
      videoElement.poster = backgroundResponse.thumbnailUri ??
        previousThumbnailUrl;
    });
}

/**
 * Applies DeArrow alternatives to videos in the feed, replacing clickbait
 * titles and thumbnails with community-submitted alternatives
 * @param feed_videos Array of video information from the feed
 */
export function deArrowFeed(
  feed_videos: Array<VideoInfo>,
  config: ExtensionConfig,
) {
  for (const video of feed_videos) {
    const thumbnailElement = video.element.querySelector("img.thumbnail");
    if (!thumbnailElement) {
      throw new Error("Unable to get thumbnail element");
    }
    const previousThumbnailUrl = thumbnailElement.getAttribute("src")!;

    if (config.deArrow.hideInitialThumbnail) {
      thumbnailElement.removeAttribute("src");
    }

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

        if (thumbnailElement) {
          thumbnailElement.setAttribute(
            "src",
            backgroundResponse.thumbnailUri ?? previousThumbnailUrl,
          );
        }

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
