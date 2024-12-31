// deno-lint-ignore-file no-unused-vars
// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";

/**
 * Types of requests that can be sent to the background script
 */
export type BackgroundRequest =
  | { type: "echo" }
  | { type: "isWatched"; videoId: string }
  | { type: "setWatched"; videoId: string; value: boolean }
  | { type: "deArrow"; videoId: string };

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
 * Record for storing video watch state
 */
type VideoRecord = {
  isWatched: boolean;
};

/**
 * Cache record for storing integration data
 */
type VideoCache = {
  deArrowTitle: string;
  deArrowThumbnailTime: number;
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
    `https://dearrow-thumb.ajay.app/api/v1/getThumbnail?videoID=${videoId}${time !== null ? `&time=${time}` : ""}`,
  );
}

/**
 * Handles deArrow requests by fetching title and thumbnail data
 * @param request The deArrow request
 */
async function handleDeArrow(
  request: Extract<BackgroundRequest, { type: "deArrow" }>,
): Promise<BackgroundResponse> {
  const videoKey = getVideoKey(request.videoId);
  const cache_records = await browser.storage.session.get(videoKey);

  let title = null;
  let thumbnailTime = null;
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
    cachedThumbnailTime = thumbnailResponse.headers.get("X-Timestamp");
  }

  if (!title && !thumbnailTime) {
    const brandingResponse = await fetch(
      `https://sponsor.ajay.app/api/branding/${await deArrowSha256Prefix(request.videoId)}`,
    );
    const brandingResponseJson = await brandingResponse.json();
    if (brandingResponse.status == 200 && brandingResponseJson) {
      try {
        thumbnailTime =
          brandingResponseJson[request.videoId]["thumbnails"][0]["timestamp"];
      } catch (_) {
        try {
          thumbnailTime =
            brandingResponseJson[request.videoId]["randomTime"] *
            brandingResponseJson[request.videoId]["videoDuration"];
        } catch (_) {
          thumbnailTime = null;
        }
      }

      if (!thumbnailTime && thumbnailUri) {
        try {
          const original =
            brandingResponseJson[request.videoId]["thumbnails"][0]["original"];
          if (original) {
            // Removing previously loaded thumbnail since original is specified in branding response
            thumbnailUri = null;
          }
        } catch (_) {
          // Keep thumbnail; there was no branding thumbnail data
        }
      }

      try {
        title = brandingResponseJson[request.videoId]["titles"][0]["title"];
        try {
          browser.storage.session.set({
            [videoKey]: {
              deArrowTitle: title,
            } as VideoCache,
          });
        } catch (_) {
          // Unable to store, likely due to exceeded quota.
          // TODO: Remove previous cache entries
        }
      } catch (_) {
        // No title returned
        title = null;
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
    thumbnailResponse = await requestThumbnail(
      request.videoId,
      thumbnailTime as number,
    );
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
