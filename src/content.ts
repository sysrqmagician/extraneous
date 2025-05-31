import {
  extractCurrentVideo,
  extractFeedFromMiniPlaylist,
  extractFeedFromPage,
  VideoInfo,
} from "./extractor.ts";
import { ExtensionConfig, getConfig } from "./config_popup.ts";
import { watchedFeed, watchedVideoPage } from "./modules/watched.ts";
import { hideSlopFeed } from "./modules/hideSlop.ts";
import { deArrowFeed, deArrowVideoPage } from "./modules/deArrow.ts";
import {
  additionalLinksErrorPage,
  additionalLinksVideoPage,
} from "./modules/additionalLinks.ts";

export enum PageType {
  WatchVideo,
  Feed,
  Unknown,
  MiniPlaylist,
}

async function injectScript() {
  if (document.head.querySelector("link[title='Invidious']") === null) return;

  let pageType = PageType.Unknown;
  if (document.location.pathname === "/watch") {
    pageType = PageType.WatchVideo;
  } else if (
    document.location.pathname.startsWith("/feed") ||
    document.location.pathname.startsWith("/channel/") ||
    document.location.pathname.startsWith("/search") ||
    document.location.pathname.startsWith("/playlist")
  ) {
    pageType = PageType.Feed;
  }

  const config = await getConfig();
  if (pageType == PageType.WatchVideo) {
    if (document.getElementsByTagName("video").length === 0) {
      additionalLinksErrorPage(config);
    }

    const currentVideo = extractCurrentVideo();
    if (config.watched.enabled) watchedVideoPage(currentVideo);
    if (config.deArrow.enabled) deArrowVideoPage(currentVideo, config);
    additionalLinksVideoPage(currentVideo, config);
  }

  if (pageType == PageType.Feed || pageType == PageType.WatchVideo) {
    callFeedModules(config, extractFeedFromPage(pageType), pageType);

    const searchParams = new URLSearchParams(document.location.search);
    if (
      pageType == PageType.WatchVideo &&
      searchParams &&
      searchParams.get("list")
    ) {
      callFeedModules(
        config,
        await extractFeedFromMiniPlaylist(),
        PageType.MiniPlaylist,
      );
    }
  }
}

function callFeedModules(
  config: ExtensionConfig,
  feedVideos: Array<VideoInfo>,
  pageType: PageType,
) {
  if (config.watched.enabled) watchedFeed(feedVideos, config);
  if (config.hideSlop.enabled) {
    hideSlopFeed(
      feedVideos,
      config.hideSlop.minDuration,
      config.hideSlop.badTitleRegex,
      pageType,
    );
  }
  if (config.deArrow.enabled) deArrowFeed(feedVideos, config);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
