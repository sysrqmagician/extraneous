// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { BackgroundRequest, BackgroundResponse } from "../background.ts";
import { VideoInfo } from "../extractor.ts";
import { parseDurationSeconds } from "./hideSlop.ts";
import { ExtensionConfig } from "../config.ts";

const TITLE_TEXT_DECORATION: string = "underline dotted 1px";

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

  if (
    config.deArrow.hideInitialThumbnail &&
    !config.deArrow.keepOriginalThumbnails
  ) {
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
      const titleElement = document.querySelector(
        "div.h-box > h1",
      ) as HTMLHeadingElement;

      if (
        backgroundResponse.title &&
        titleElement &&
        !config.deArrow.keepOriginalTitles
      ) {
        const textChild = titleElement.childNodes[0];

        if (textChild && textChild.nodeType == Node.TEXT_NODE) {
          textChild.textContent = backgroundResponse.title;
          titleElement.setAttribute("title", currentVideo.title); // Set tooltip to original title

          if (config.deArrow.highlightReplacedTitles) {
            titleElement.style.textDecoration = TITLE_TEXT_DECORATION;
          }
        }
      }

      if (!config.deArrow.keepOriginalThumbnails) {
        if (vjsPosterElement) {
          vjsPosterElement.style.backgroundImage = `url(${
            backgroundResponse.thumbnailUri ?? previousThumbnailUrl
          })`;
        }
        videoElement.poster = backgroundResponse.thumbnailUri ??
          previousThumbnailUrl;
      }
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

    if (
      config.deArrow.hideInitialThumbnail &&
      !config.deArrow.keepOriginalThumbnails
    ) {
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

        if (thumbnailElement && !config.deArrow.keepOriginalThumbnails) {
          thumbnailElement.setAttribute(
            "src",
            backgroundResponse.thumbnailUri ?? previousThumbnailUrl,
          );
        }

        const titleElement = video.element.querySelector(
          "div.video-card-row > a > p[dir='auto']",
        ) as HTMLParagraphElement;
        if (
          backgroundResponse.title &&
          titleElement &&
          !config.deArrow.keepOriginalTitles
        ) {
          titleElement.setAttribute("title", video.title); // Set tooltip to original title
          titleElement.textContent = backgroundResponse.title;
          if (config.deArrow.highlightReplacedTitles) {
            titleElement.style.textDecoration = TITLE_TEXT_DECORATION;
          }
        }
      });
  }
}
