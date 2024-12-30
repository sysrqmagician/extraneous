// deno-lint-ignore-file no-unused-vars
// @deno-types="npm:@types/webextension-polyfill"
import browser from "webextension-polyfill";

export type BackgroundResponse =
  | { type: "echo"; response: string }
  | { type: "isWatched"; value: boolean }
  | { type: "completed" }
  | { type: "error"; description: string };
export type BackgroundRequest =
  | { type: "echo" }
  | { type: "isWatched"; videoId: string }
  | { type: "setWatched"; videoId: string; value: boolean };

type VideoRecord = {
  isWatched: boolean;
  dearrow_cache: string | null;
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
      case "isWatched":
        return await handleIsWatched(request);
      case "setWatched":
        return await handleSetWatched(request);
      default:
        return { type: "error", description: "Unknown message type." };
    }
  },
);

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
