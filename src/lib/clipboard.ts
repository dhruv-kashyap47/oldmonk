export type CopyResult = { ok: true } | { ok: false; message: string };

/**
 * Clipboard writes happen only after an explicit user action. There is no
 * execCommand fallback: when the async API is missing, the UI asks the person
 * to select the text instead.
 */
export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return { ok: false, message: "Copy is not available in this browser. Select the text to copy it." };
  }
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, message: "The browser blocked clipboard access. Select the text to copy it." };
  }
}
