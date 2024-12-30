console.log("Content script loaded");

type Video = {
  title: string;
  channelName: string;
  channelLink: string;
  videoLink: string;
  duration: string;
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
  const title =
    video_div.querySelector("div.video-card-row > a > p")?.textContent || "";
  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  const channelName = (channelLinkElement?.textContent || "").trim();
  const channelLink = channelLinkElement?.getAttribute("href") || "";
  const videoLink =
    video_div.querySelector("div.thumbnail > a")?.getAttribute("href") || "";
  const duration =
    video_div.querySelector("div.thumbnail > div > p.length")?.textContent ||
    "";

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
  const title =
    video_div.querySelector("div.video-card-row > a > p")?.textContent || "";
  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  const channelName = (channelLinkElement?.textContent || "").trim();
  const channelLink = channelLinkElement?.getAttribute("href") || "";
  const videoLink =
    video_div.querySelector("div.thumbnail > a")?.getAttribute("href") || "";
  const duration =
    video_div.querySelector("div.thumbnail > div > p.length")?.textContent ||
    "";

  return {
    title,
    channelName,
    channelLink,
    videoLink,
    duration,
    element: video_div,
  };
}

// Run when document is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScript);
} else {
  injectScript();
}
