/**
 * Copy the current page URL to the clipboard.
 * Uses the modern Clipboard API with a fallback for older browsers.
 * Returns true on success, false on failure.
 */
export async function copyCurrentUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      return true;
    } catch {
      return false;
    }
  }
}
