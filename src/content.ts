console.log("Content script loaded");

class VideoParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoParseError";
  }
}

type Option<T> = T | null;
type Video = {
  title: string;
  channelName: string;
  channelLink: URL;
  videoLink: URL;
  duration: Option<string>; // Is not sent for Livestreams and on certain pages
  element: HTMLDivElement;
};

function injectScript() {
  let videos: Array<Video> = [];
  const video_iterator = document
    .querySelectorAll("div[class = 'video-card-row']")
    .values()
    .map((x) => x.parentElement as HTMLDivElement);

  if (document.location.pathname === "/watch") {
    videos = Array.from(video_iterator.map((x) => parseWatchNext(x)));
  } else if (document.location.pathname.startsWith("/feed")) {
    videos = Array.from(video_iterator.map((x) => parseFeed(x)));
  }

  console.log(videos);
}

function parseFeed(video_div: HTMLDivElement): Video {
  const titleElement = video_div.querySelector("div.video-card-row > a > p");
  if (!titleElement?.textContent)
    throw new VideoParseError("Could not find video title");
  const title = titleElement.textContent;

  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  if (!channelLinkElement?.textContent)
    throw new VideoParseError("Could not find channel name");
  const channelName = channelLinkElement.textContent.trim();

  const channelLink = normalizeUrl(channelLinkElement.getAttribute("href"));
  if (!channelLink) throw new VideoParseError("Could not find channel link");

  const videoLinkElement = video_div.querySelector("div.thumbnail > a");
  const videoLink = normalizeUrl(videoLinkElement?.getAttribute("href"));
  if (!videoLink) throw new VideoParseError("Could not find video link");

  const duration =
    video_div.querySelector("div.thumbnail > div > p.length")?.textContent ||
    null;

  return {
    title,
    channelName,
    channelLink,
    videoLink,
    duration,
    element: video_div,
  };
}

function parseWatchNext(video_div: HTMLDivElement): Video {
  const titleElement = video_div.querySelector("div.video-card-row > a > p");
  if (!titleElement?.textContent)
    throw new VideoParseError("Could not find video title");
  const title = titleElement.textContent;

  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  if (!channelLinkElement?.textContent)
    throw new VideoParseError("Could not find channel name");
  const channelName = channelLinkElement.textContent.trim();

  const channelLink = normalizeUrl(channelLinkElement.getAttribute("href"));
  if (!channelLink) throw new VideoParseError("Could not find channel link");

  const videoLinkElement = video_div.querySelector("div.thumbnail > a");
  const videoLink = normalizeUrl(videoLinkElement?.getAttribute("href"));
  if (!videoLink) throw new VideoParseError("Could not find video link");

  const duration =
    video_div.querySelector("div.thumbnail > div > p.length")?.textContent ||
    null;

  return {
    title,
    channelName,
    channelLink,
    videoLink,
    duration,
    element: video_div,
  };
}

function normalizeUrl(pathName: string | null | undefined): URL | null {
  if (typeof pathName !== "string") return null;
  return URL.parse(pathName, document.location.href);
}

// Run when document is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
