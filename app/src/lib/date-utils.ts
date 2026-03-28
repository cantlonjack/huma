/**
 * Returns today's date in the operator's local timezone as YYYY-MM-DD.
 * Replaces `new Date().toISOString().split("T")[0]` which returns UTC
 * and drifts near midnight.
 */
export function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns a past date in the operator's local timezone as YYYY-MM-DD.
 */
export function getLocalDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
