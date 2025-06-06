import { PageType } from "../content.ts";
import { VideoInfo } from "../extractor.ts";

/**
 * Filters out unwanted videos from the feed based on criteria
 * @param feed_videos Array of video information from the feed
 * @param minDurationString Minimum duration string as taken by {@link parseDurationSeconds}
 * @param badTitleRegexString Regex pattern to match titles that should be hidden
 */
export function hideSlopFeed(
  feed_videos: Array<VideoInfo>,
  minDurationString: string,
  badTitleRegexString: string,
  pageType: PageType,
) {
  const minDuration = parseDurationSeconds(minDurationString);
  if (Number.isNaN(minDuration)) return;
  const badTitleRegex = badTitleRegexString.length > 0
    ? new RegExp(badTitleRegexString)
    : null;

  let removedCount = 0;
  for (const video of feed_videos) {
    const toRemove = (
      pageType === PageType.Feed ? video.element.parentElement : video.element
    ) as HTMLDivElement;

    if (badTitleRegex && badTitleRegex.test(video.title)) {
      hideDiv(toRemove);
      removedCount++;
      continue;
    }

    if (!video.duration) continue;
    if (parseDurationSeconds(video.duration) < minDuration) {
      hideDiv(toRemove);
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
