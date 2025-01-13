import { PageType } from "./content.ts";

class VideoExtractorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoExtractorError";
  }
}

export type VideoInfo = {
  title: string;
  channelName: string;
  channelLink: URL | null;
  channelId: string | null;
  videoLink: URL;
  videoId: string;
  duration: string | null; // Is not sent for Livestreams and on certain pages
  element: Element;
};

/**
 * Extracts video info from a feed video div element
 * @param video_div The video div element to extract from
 */
function extractFeed(video_div: HTMLDivElement): VideoInfo {
  return extractBasic(video_div);
}

/**
 * Extracts video info from a watch next video div element
 * @param video_div The video div element to extract from
 */
function extractWatchNext(video_div: HTMLDivElement): VideoInfo {
  return extractBasic(video_div);
}

/**
 * Basic extraction logic shared between feed and watch next videos
 * @param video_div The video div element to extract from
 */
function extractBasic(video_div: HTMLDivElement): VideoInfo {
  const title = video_div.querySelector(
    "div.video-card-row > a > p",
  )?.textContent;
  if (!title) throw new VideoExtractorError("Could not find video title");
  const channelLinkElement = video_div.querySelector("a[href^='/channel/']");
  const channelName = channelLinkElement?.textContent?.trim();
  if (!channelName) {
    throw new VideoExtractorError("Could not find channel name");
  }
  const channelLink = normalizeUrl(channelLinkElement?.getAttribute("href"));
  if (!channelLink) {
    throw new VideoExtractorError("Could not find channel link");
  }
  const channelId = channelLink.pathname.split("/")[2];
  if (!channelId) throw new VideoExtractorError("Could not find channel ID");

  const videoLink = normalizeUrl(
    video_div.querySelector("div.thumbnail > a")?.getAttribute("href"),
  );
  if (!videoLink) throw new VideoExtractorError("Could not find video link");
  const videoId = videoLink.searchParams.get("v");
  if (!videoId) throw new VideoExtractorError("Could not find video ID");

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

/**
 * Converts a relative URL string to a proper {@link URL}, using the current page as base
 * @param pathName The path to convert
 */
function normalizeUrl(pathName: string | null | undefined): URL | null {
  if (typeof pathName !== "string") return null;
  return URL.parse(pathName, document.location.href);
}

/**
 * Extracts information about the currently playing video
 */
export function extractCurrentVideo(): VideoInfo {
  const listenLink = document.querySelector("i.icon.ion-md-headset");
  const title = listenLink?.parentElement?.parentElement?.innerText.trim();
  if (!title) throw new VideoExtractorError("Could not find video title");
  const channelNameElement = document.querySelector("div.channel-profile");
  const channelName = channelNameElement?.textContent?.trim();
  if (!channelName) {
    throw new VideoExtractorError("Could not find channel name");
  }
  const channelLink = normalizeUrl(
    channelNameElement?.parentElement?.getAttribute("href"),
  );
  if (!channelLink) {
    throw new VideoExtractorError("Could not find channel link");
  }
  const channelId = channelLink.pathname.split("/")[2];
  if (!channelId) throw new VideoExtractorError("Could not find channel ID");
  const videoLink = normalizeUrl(
    `${document.location.pathname}?v=${
      new URLSearchParams(
        document.location.search,
      ).get("v")
    }`,
  );
  if (!videoLink) throw new VideoExtractorError("Could not find video link");
  const videoId = videoLink.searchParams.get("v");
  if (!videoId) throw new VideoExtractorError("Could not find video ID");

  const player_container = document.getElementById(
    "player-container",
  ) as HTMLDivElement;
  if (!player_container) {
    throw new VideoExtractorError("Could not find player container");
  }

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

/**
 * Extracts information about a video displayed in the sidebar playlist view
 */
export function extractMiniPlaylistVideo(videoLi: Element): VideoInfo {
  const title = videoLi.querySelector("a > p:nth-child(2)")?.textContent;
  if (!title) throw new VideoExtractorError("Could not find video title");
  const channelName = videoLi
    .querySelector("a > p:nth-child(3) > b")
    ?.textContent?.trim();
  if (!channelName) {
    throw new VideoExtractorError("Could not find channel name");
  }

  const videoLink = normalizeUrl(
    videoLi.querySelector("a")?.getAttribute("href"),
  );
  if (!videoLink) throw new VideoExtractorError("Could not find video link");
  const videoId = videoLink.searchParams.get("v");
  if (!videoId) throw new VideoExtractorError("Could not find video ID");

  const duration =
    videoLi.querySelector("div.thumbnail > p.length")?.textContent || null;

  return {
    title,
    channelName,
    channelLink: null,
    channelId: null,
    videoLink,
    videoId,
    duration,
    element: videoLi,
  };
}

/**
 * Extracts video information from all videos in the current page
 * @param pageType Type of page being processed
 */
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
      videos = Array.from(
        video_iterator
          .map((x) => {
            // May be unable to extract information for privated videos on playlists
            // TODO: Better handling
            try {
              return extractFeed(x);
            } catch (e) {
              console.log(`Error while extracting video information: ${e}`, x);
              return null;
            }
          })
          .filter((x) => x !== null),
      );
      break;
  }

  return videos;
}

/**
 * Extracts video information from all videos in the sidebar playlist view
 */
export async function extractFeedFromMiniPlaylist(): Promise<Array<VideoInfo>> {
  const playlistDiv = document.getElementById("playlist");
  if (!playlistDiv) {
    throw new VideoExtractorError("Could not find playlistDiv");
  }
  const observerConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
  };

  const playListPromise = new Promise<void>((resolve) => {
    const observer = new MutationObserver((mutationRecords) => {
      for (const entry of mutationRecords) {
        const innerListDiv = entry.addedNodes
          .entries()
          .find(
            (x) =>
              x[1].nodeType == Node.ELEMENT_NODE &&
              (x[1] as Element).matches(
                ".pure-menu.pure-menu-scrollable.playlist-restricted",
              ),
          );

        if (innerListDiv) {
          observer.disconnect();
          resolve();
        }
      }
    });

    observer.observe(playlistDiv, observerConfig);
  });

  await playListPromise;
  return Array.from(
    playlistDiv
      .querySelectorAll("div > ol > li")
      .values()
      .map((x) => {
        // May be unable to extract information for privated videos on playlists
        try {
          return extractMiniPlaylistVideo(x);
        } catch (e) {
          console.log(
            `Error while extracting video information for ${x}: ${e}`,
          );
          return null;
        }
      })
      .filter((x) => x !== null),
  );
}
