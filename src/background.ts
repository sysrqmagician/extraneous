// deno-lint-ignore-file no-unused-vars
// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";

export type BackgroundRequest =
  | { type: "echo" }
  | { type: "isWatched"; videoId: string }
  | { type: "setWatched"; videoId: string; value: boolean }
  | { type: "deArrow"; videoId: string };
export type BackgroundResponse =
  | { type: "echo"; response: string }
  | { type: "isWatched"; value: boolean }
  | { type: "completed" }
  | { type: "error"; description: string }
  | { type: "deArrow"; title: string | null; thumbnailUri: string };

type VideoRecord = {
  isWatched: boolean;
};

type VideoCache = {
  deArrowTitle: string;
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

async function handleDeArrow(
  request: Extract<BackgroundRequest, { type: "deArrow" }>,
): Promise<BackgroundResponse> {
  const videoKey = getVideoKey(request.videoId);
  const cache_records = await browser.storage.session.get(videoKey);

  let title = null;
  if (videoKey in cache_records) {
    const record = cache_records[videoKey] as VideoCache;
    title = record.deArrowTitle;
  }

  const thumbnailResponse = await fetch(
    `https://dearrow-thumb.ajay.app/api/v1/getThumbnail?videoID=${request.videoId}`,
  );
  const thumbnailBlob = await thumbnailResponse.blob();
  const thumbnailUri = await blobToUri(thumbnailBlob);

  if (!title) {
    const titleResponse = await fetch(
      `https://sponsor.ajay.app/api/branding/${await deArrowSha256Prefix(request.videoId)}`,
    );

    const titleResponseJson = await titleResponse.json();
    try {
      title = titleResponseJson[request.videoId]["titles"][0]["title"];
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
  }

  return {
    type: "deArrow",
    thumbnailUri,
    title,
  };
}

function blobToUri(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.addEventListener("loadend", function () {
      resolve(reader.result as string);
    });
  });
}

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

async function getRecord(videoId: string): Promise<VideoRecord | null> {
  const videoKey = getVideoKey(videoId);
  const storageResponse = await browser.storage.local.get(videoKey);

  if (videoKey in storageResponse) {
    return storageResponse[videoKey] as VideoRecord;
  }
  return null;
}

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

function getVideoKey(videoId: string): string {
  return `video_${videoId}`;
}
