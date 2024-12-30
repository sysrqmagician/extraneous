import { extractCurrentVideo, extractFeedFromPage } from "./extractor.ts";
import { getConfig } from "./popup.ts";
import { watchedFeedPage, watchedVideoPage } from "./modules/watched.ts";
import { hideSlopFeedPage } from "./modules/hideSlop.ts";

export enum PageType {
  WatchVideo,
  Feed,
  Unknown,
}

async function injectScript() {
  if (document.head.querySelector("link[title='Invidious']") === null) return;

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
    if (config.hideSlop.enabled)
      hideSlopFeedPage(
        feed_videos,
        config.hideSlop.minDuration,
        config.hideSlop.badTitleRegex,
      );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
