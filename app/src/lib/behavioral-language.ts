/**
 * Detects whether a response contains behavioral language that SHOULD
 * have produced a DECOMPOSITION or BEHAVIORS marker but didn't.
 */

const BEHAVIORAL_KEYWORDS = [
  "this week",
  "every day",
  "each day",
  "daily",
  "every morning",
  "every evening",
  "morning routine",
  "evening routine",
  "start with",
  "begin with",
  "try to",
  "aim for",
  "once a week",
  "twice a week",
  "three times",
  "specific days",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Pattern: numbered list of actions (e.g. "1. Walk 20 minutes") */
const NUMBERED_LIST_PATTERN = /\d+\.\s+[A-Z]/;

/**
 * Returns true if the text looks like it describes behaviors/actions
 * that should have been structured into markers.
 */
export function containsBehavioralLanguage(text: string): boolean {
  const lower = text.toLowerCase();

  // Need at least 2 behavioral keywords or a numbered list with 1 keyword
  let keywordHits = 0;
  for (const kw of BEHAVIORAL_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }

  const hasNumberedList = NUMBERED_LIST_PATTERN.test(text);

  return keywordHits >= 2 || (hasNumberedList && keywordHits >= 1);
}
