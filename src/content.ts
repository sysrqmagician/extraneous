// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { extractCurrentVideo, extractFeedFromPage } from "./extractor.ts";
import { BackgroundResponse, BackgroundRequest } from "./background.ts";
import { getConfig } from "./popup.ts";
import { watchedFeedPage, watchedVideoPage } from "./modules/watched.ts";

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
  if (pageType == PageType.WatchVideo) {
    const currentVideo = extractCurrentVideo();
    if (config.watched.enabled) watchedVideoPage(currentVideo);
  }

  if (pageType == PageType.Feed || pageType == PageType.WatchVideo) {
    const feed_videos = extractFeedFromPage(pageType);
    if (config.watched.enabled) watchedFeedPage(feed_videos);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
