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
  videoLink: URL;
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

  const videoLink = normalizeUrl(
    video_div.querySelector("div.thumbnail > a")?.getAttribute("href"),
  );
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

export function extractFromPage(): Array<VideoInfo> {
  let videos: Array<VideoInfo> = [];
  const video_iterator = document
    .querySelectorAll("div[class = 'video-card-row']")
    .values()
    .map((x) => x.parentElement as HTMLDivElement);

  // It is likely that the document will have breaking changes,
  // so I split these into methods for easy maintenance.
  //
  // For now, they are all using the same extractor.
  if (document.location.pathname === "/watch") {
    videos = Array.from(video_iterator.map((x) => extractWatchNext(x)));
  } else if (document.location.pathname.startsWith("/feed")) {
    videos = Array.from(video_iterator.map((x) => extractFeed(x)));
  }

  return videos;
}
