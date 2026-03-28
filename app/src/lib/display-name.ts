/** Truncate long aspiration names for pill/ribbon display. */
export function displayName(name: string): string {
  if (name.length <= 60) return name;
  const splits = [". ", " so ", " because ", " — ", " - "];
  for (const split of splits) {
    const idx = name.toLowerCase().indexOf(split);
    if (idx > 10 && idx < 80) return name.slice(0, idx);
  }
  const truncated = name.slice(0, 60);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
