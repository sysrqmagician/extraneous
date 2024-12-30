import { PageType } from "./content.ts";

class VideoParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoParseError";
  }
}

type VideoInfo = {
  title: string;
  channelName: string;
  channelLink: URL;
  channelId: string;
  videoLink: URL;
  videoId: string;
  duration: string | null; // Is not sent for Livestreams and on certain pages
  element: HTMLDivElement;
};

function extractFeed(video_div: HTMLDivElement): VideoInfo {
  return extractBasic(video_div);
}

function extractWatchNext(video_div: HTMLDivElement): VideoInfo {
  return extractBasic(video_div);
}

function extractBasic(video_div: HTMLDivElement): VideoInfo {
  const title = video_div.querySelector(
    "div.video-card-row > a > p",
  )?.textContent;
  if (!title) throw new VideoParseError("Could not find video title");
  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  const channelName = channelLinkElement?.textContent?.trim();
  if (!channelName) throw new VideoParseError("Could not find channel name");
  const channelLink = normalizeUrl(channelLinkElement?.getAttribute("href"));
  if (!channelLink) throw new VideoParseError("Could not find channel link");
  const channelId = channelLink.pathname.split("/")[2];
  if (!channelId) throw new VideoParseError("Could not find channel ID");

  const videoLink = normalizeUrl(
    video_div.querySelector("div.thumbnail > a")?.getAttribute("href"),
  );
  if (!videoLink) throw new VideoParseError("Could not find video link");
  const videoId = videoLink.searchParams.get("v");
  if (!videoId) throw new VideoParseError("Could not find video ID");

  const duration =
    video_div.querySelector("div.thumbnail > div > p.length")?.textContent ||
    null;

  return {
    title,
    channelName,
    channelLink,
    channelId,
    videoLink,
    videoId,
    duration,
    element: video_div,
  };
}

function normalizeUrl(pathName: string | null | undefined): URL | null {
  if (typeof pathName !== "string") return null;
  return URL.parse(pathName, document.location.href);
}

export function extractCurrentVideo(): VideoInfo {
  const listenLink = document.querySelector("i.icon.ion-md-headset");
  const title = listenLink?.parentElement?.parentElement?.innerText.trim();
  if (!title) throw new VideoParseError("Could not find video title");
  const channelNameElement = document.querySelector("div.channel-profile");
  const channelName = channelNameElement?.textContent?.trim();
  if (!channelName) throw new VideoParseError("Could not find channel name");
  const channelLink = normalizeUrl(
    channelNameElement?.parentElement?.getAttribute("href"),
  );
  if (!channelLink) throw new VideoParseError("Could not find channel link");
  const channelId = channelLink.pathname.split("/")[2];
  if (!channelId) throw new VideoParseError("Could not find channel ID");
  const videoLink = normalizeUrl(
    `${document.location.pathname}?v=${new URLSearchParams(document.location.search).get("v")}`,
  );
  if (!videoLink) throw new VideoParseError("Could not find video link");
  const videoId = videoLink.searchParams.get("v");
  if (!videoId) throw new VideoParseError("Could not find video ID");

  const player_container = document.getElementById(
    "player-container",
  ) as HTMLDivElement;
  if (!player_container)
    throw new VideoParseError("Could not find player container");

  return {
    title,
    channelName,
    channelLink,
    channelId,
    videoLink,
    videoId,
    duration: null,
    element: player_container,
  };
}

export function extractFeedFromPage(pageType: PageType): Array<VideoInfo> {
  let videos: Array<VideoInfo> = [];
  const video_iterator = document
    .querySelectorAll("div[class = 'video-card-row']")
    .values()
    .map((x) => x.parentElement as HTMLDivElement);

  // It is likely that the document will have breaking changes,
  // so I split these into methods for easy maintenance.
  //
  // For now, they are all using the same extractor.
  switch (pageType) {
    case PageType.WatchVideo:
      videos = Array.from(video_iterator.map((x) => extractWatchNext(x)));
      break;
    case PageType.Feed:
      videos = Array.from(video_iterator.map((x) => extractFeed(x)));
      break;
  }

  return videos;
}
