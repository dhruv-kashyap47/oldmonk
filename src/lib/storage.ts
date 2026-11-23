const PREFIX = "oldmonk:v1:";

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): boolean {
  try {
    localStorage.setItem(PREFIX + key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}

export function readStoredJson<T>(key: string, fallback: T): T {
  const raw = readStored(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key: string, value: unknown): boolean {
  try {
    return writeStored(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/** Clears only oldmonk keys, never another site's storage on the same origin. */
export function clearOldmonkStorage(): void {
  try {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable.
  }
}
