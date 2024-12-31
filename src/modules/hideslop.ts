import { VideoInfo } from "../extractor.ts";

/**
 * Filters out unwanted videos from the feed based on criteria
 * @param feed_videos Array of video information from the feed
 * @param minDurationString Minimum duration string as taken by {@link parseDurationSeconds}
 * @param badTitleRegexString Regex pattern to match titles that should be hidden
 */
export function hideSlopFeedPage(
  feed_videos: Array<VideoInfo>,
  minDurationString: string,
  badTitleRegexString: string,
) {
  const minDuration = parseDurationSeconds(minDurationString);
  if (Number.isNaN(minDuration)) return;
  const badTitleRegex = new RegExp(badTitleRegexString);

  let removedCount = 0;
  for (const video of feed_videos) {
    if (badTitleRegex.test(video.title)) {
      hideDiv(video.element.parentElement as HTMLDivElement);
      removedCount++;
      continue;
    }

    if (!video.duration) continue;
    if (parseDurationSeconds(video.duration) < minDuration) {
      hideDiv(video.element.parentElement as HTMLDivElement);
      removedCount++;
    }
  }

  console.log(`Removed ${removedCount} videos matching criteria.`);
}

/**
 * Hides a div element by setting display to none
 * @param div The div element to hide
 */
function hideDiv(div: HTMLDivElement) {
  div.style.display = "none";
}

/**
 * Converts a duration string in format "SS", "MM:SS" or "HH:MM:SS" to seconds.
 *
 * @param duration_string - Duration string in format "SS", "MM:SS" or "HH:MM:SS"
 * @returns Total number of seconds
 */
export function parseDurationSeconds(duration_string: string): number {
  let seconds = 0;
  const segments = duration_string.split(":");
  for (let i = 0; i < segments.length; i++) {
    seconds += parseInt(segments[i]) * 60 ** (segments.length - i - 1);
  }
  return seconds;
}
