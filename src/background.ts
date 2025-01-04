// deno-lint-ignore-file no-unused-vars
// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";
import { getConfig } from "./config_popup.ts";

/**
 * Types of requests that can be sent to the background script
 */
export type BackgroundRequest =
  | { type: "echo" }
  | { type: "isWatched"; videoId: string }
  | { type: "setWatched"; videoId: string; value: boolean }
  | { type: "deArrow"; videoId: string; videoDuration: number | null };

/**
 * Types of responses that can be returned from the background script
 */
export type BackgroundResponse =
  | { type: "echo"; response: string }
  | { type: "isWatched"; value: boolean }
  | { type: "completed" }
  | { type: "error"; description: string }
  | { type: "deArrow"; title: string | null; thumbnailUri: string | null };

/**
 * Record for storing module state
 */
type VideoRecord = {
  isWatched: boolean;
};

/**
 * Cache record for storing integration data
 */
type VideoCache = {
  deArrowTitle: string;
  deArrowThumbnailTime: number | null;
};

/**
 * Response from DeArrow hashed ID branding API
 */
type BrandingData = {
  [videoId: string]: BrandingVideo;
};

type BrandingTitle = {
  title: string;
  original: boolean;
  votes: number;
  locked: boolean;
  UUID: string;
  userID?: string;
};

type BrandingThumbnail = {
  timestamp: number | null;
  original: boolean;
  votes: number;
  locked: boolean;
  UUID: string;
  userID?: string;
};

type BrandingVideo = {
  titles: BrandingTitle[];
  thumbnails: BrandingThumbnail[];
  randomTime: number;
  videoDuration: number | null;
};

browser.runtime.onMessage.addListener(
  async (
    message: unknown,
    sender: browser.Runtime.MessageSender,
    sendResponse: (response: BackgroundResponse) => void,
  ): Promise<BackgroundResponse> => {
    const request = message as BackgroundRequest;
    console.log("Received message:", request);

    // Process the message and send a response
    switch (request.type) {
      case "echo":
        return {
          type: "echo",
          response: "Echo!",
        };
      case "deArrow":
        return await handleDeArrow(request);
      case "isWatched":
        return await handleIsWatched(request);
      case "setWatched":
        return await handleSetWatched(request);
      default:
        return { type: "error", description: "Unknown message type." };
    }
  },
);

/**
 * Requests a thumbnail from the DeArrow API
 * @param videoId YouTube video ID
 * @param time Optional timestamp for the thumbnail
 */
async function requestThumbnail(
  videoId: string,
  time: number | null,
): Promise<Response> {
  return await fetch(
    `https://dearrow-thumb.ajay.app/api/v1/getThumbnail?videoID=${videoId}${
      time !== null ? `&time=${time}` : ""
    }`,
  );
}

/**
 * Handles deArrow requests by fetching title and thumbnail data
 * @param request The deArrow request
 */
async function handleDeArrow(
  request: Extract<BackgroundRequest, { type: "deArrow" }>,
): Promise<BackgroundResponse> {
  const config = await getConfig();
  const videoKey = getVideoKey(request.videoId);
  const cache_records = await browser.storage.session.get(videoKey);

  let title: string | null = null;
  let thumbnailTime: number | null = null;
  if (videoKey in cache_records) {
    const record = cache_records[videoKey] as VideoCache;
    title = record.deArrowTitle;
    thumbnailTime = record.deArrowThumbnailTime;
  }

  let thumbnailResponse = await requestThumbnail(request.videoId, null);
  let thumbnailBlob = await thumbnailResponse.blob();

  let thumbnailUri = null;
  let cachedThumbnailTime = null;
  if (thumbnailBlob.size !== 0) {
    thumbnailUri = await blobToUri(thumbnailBlob);
    const x_timestamp = thumbnailResponse.headers.get("X-Timestamp");
    if (x_timestamp) {
      try {
        cachedThumbnailTime = parseInt(x_timestamp);
      } catch {
        // X-Timestamp was invalid, keep null
      }
    }
  }

  // If title and time weren't cached, fetch them
  if (!title && !thumbnailTime) {
    const brandingResponse = await fetch(
      `https://sponsor.ajay.app/api/branding/${await deArrowSha256Prefix(
        request.videoId,
      )}`,
    );
    const brandingData = (await brandingResponse.json()) as BrandingData;

    // If the request was successful and returned the video's data
    if (
      brandingResponse.status == 200 &&
      brandingData &&
      brandingData[request.videoId]
    ) {
      const videoBranding = brandingData[request.videoId];

      // If a thumbnail is specified, use its timestamp
      // This could be null in the case of original = true
      // If there is no thumbnail, derive timestamp from server-provided random value
      if (videoBranding.thumbnails && videoBranding.thumbnails.length > 0) {
        thumbnailTime = videoBranding.thumbnails[0].timestamp;
      } else {
        // The server usually doesn't know the duration,
        // so we supplement the response with locally obtained information, if available.
        const videoDuration = videoBranding.videoDuration ??
          request.videoDuration;

        if (videoDuration !== null) {
          thumbnailTime = videoBranding.randomTime * videoDuration;
        }
      }

      // If the branding response specifies to use the original, remove any previously loaded thumbnail
      if (
        !thumbnailTime &&
        thumbnailUri &&
        videoBranding.thumbnails.length > 0 &&
        videoBranding.thumbnails[0].original
      ) {
        thumbnailUri = null;
      }

      if (videoBranding.titles.length > 0) {
        const brandingTitle = videoBranding.titles[0];

        // Make sure title is trusted per documentation or user doesn't care
        if (
          !config.deArrow.trustedOnly ||
          brandingTitle.locked ||
          brandingTitle.votes >= 0
        ) {
          // Remove DeArrow auto-formatting ignore indicator '>'
          title = videoBranding.titles[0].title.replace(
            />[^\s]/g,
            (match) => match.substring(1),
          );
        }

        if (title) {
          try {
            browser.storage.session.set({
              [videoKey]: {
                deArrowTitle: title,
                deArrowThumbnailTime: thumbnailTime,
              } as VideoCache,
            });
          } catch (e) {
            // Unable to store, likely due to exceeded quota.
            // TODO: Remove previous cache entries
            console.log(`Unable to cache title for ${videoKey}: ${e}`);
          }
        }
      }
    } else {
      // Fall back to X-Title returned from thumbnail server in the event of a main server outage.
      const x_title = thumbnailResponse.headers.get("X-Title");
      if (x_title) {
        title = x_title;
      }
    }
  }

  // Request again, if
  // there wasn't a thumbnail cached, try again with the provided time
  // OR if there was a cached thumbnail that doesn't match the branding timestamp
  if (
    (thumbnailTime &&
      thumbnailBlob.size == 0 &&
      thumbnailResponse.status == 204) ||
    (thumbnailUri &&
      cachedThumbnailTime &&
      thumbnailTime &&
      cachedThumbnailTime !== thumbnailTime)
  ) {
    thumbnailResponse = await requestThumbnail(request.videoId, thumbnailTime);
    thumbnailBlob = await thumbnailResponse.blob();

    if (thumbnailBlob.size !== 0) {
      thumbnailUri = await blobToUri(thumbnailBlob);
    }
  }

  return {
    type: "deArrow",
    thumbnailUri,
    title,
  };
}

/**
 * Converts a Blob to a data URI string
 * @param blob The blob to convert
 */
function blobToUri(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.addEventListener("loadend", function () {
      resolve(reader.result as string);
    });
  });
}

/**
 * Generates a SHA-256 prefix for a video ID
 * @param videoId YouTube video ID
 */
async function deArrowSha256Prefix(videoId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(videoId);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 4);
}

/**
 * Retrieves a video record from storage
 * @param videoId YouTube video ID
 */
async function getRecord(videoId: string): Promise<VideoRecord | null> {
  const videoKey = getVideoKey(videoId);
  const storageResponse = await browser.storage.local.get(videoKey);

  if (videoKey in storageResponse) {
    return storageResponse[videoKey] as VideoRecord;
  }
  return null;
}

/**
 * Handles isWatched requests
 * @param request The isWatched request
 */
async function handleIsWatched(
  request: Extract<BackgroundRequest, { type: "isWatched" }>,
): Promise<BackgroundResponse> {
  const record = await getRecord(request.videoId);
  if (record) {
    return {
      type: "isWatched",
      value: record.isWatched,
    };
  }

  return { type: "isWatched", value: false };
}

/**
 * Handles setWatched requests
 * @param request The setWatched request
 */
async function handleSetWatched(
  request: Extract<BackgroundRequest, { type: "setWatched" }>,
): Promise<BackgroundResponse> {
  let record = await getRecord(request.videoId);
  if (!record) {
    record = {} as VideoRecord;
  }
  record.isWatched = request.value;

  await browser.storage.local.set({
    [getVideoKey(request.videoId)]: record,
  });
  return { type: "completed" };
}

/**
 * Generates a storage key for a video ID
 * @param videoId YouTube video ID
 */
function getVideoKey(videoId: string): string {
  return `video_${videoId}`;
}
