export type CopyResult = { ok: true } | { ok: false; message: string };

const COPY_TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Clipboard request timed out.")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Clipboard writes happen only after an explicit user action. There is no
 * execCommand fallback: when the async API is missing, the UI asks the person
 * to select the text instead. A pending permission prompt is capped so the
 * button never sits silent.
 */
export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return { ok: false, message: "Copy is not available in this browser. Select the text to copy it." };
  }
  try {
    await withTimeout(navigator.clipboard.writeText(text), COPY_TIMEOUT_MS);
    return { ok: true };
  } catch {
    return { ok: false, message: "The browser blocked clipboard access. Select the text to copy it." };
  }
}
