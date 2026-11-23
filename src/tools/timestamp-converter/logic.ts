/**
 * Unix timestamp and ISO 8601 conversion, zone formatting, and relative time.
 * Framework-free: no Solid import, no DOM, no network, no storage.
 */

export type TimestampUnit = "seconds" | "milliseconds";
export type TimestampUnitChoice = "auto" | TimestampUnit;

export interface TimestampError {
  readonly title: string;
  readonly message: string;
}

export type TimestampParseResult =
  | {
      readonly ok: true;
      readonly ms: number;
      readonly unit: TimestampUnit | "iso";
      readonly seconds: number;
    }
  | { readonly ok: false; readonly error: TimestampError };

export interface TimeZoneOption {
  readonly id: string;
  readonly label: string;
}

export const TIME_ZONE_OPTIONS: readonly TimeZoneOption[] = [
  { id: "UTC", label: "UTC" },
  { id: "America/New_York", label: "New York" },
  { id: "America/Chicago", label: "Chicago" },
  { id: "America/Denver", label: "Denver" },
  { id: "America/Los_Angeles", label: "Los Angeles" },
  { id: "Europe/London", label: "London" },
  { id: "Europe/Berlin", label: "Berlin" },
  { id: "Europe/Paris", label: "Paris" },
  { id: "Europe/Moscow", label: "Moscow" },
  { id: "Asia/Dubai", label: "Dubai" },
  { id: "Asia/Kolkata", label: "Kolkata" },
  { id: "Asia/Shanghai", label: "Shanghai" },
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "Australia/Sydney", label: "Sydney" },
  { id: "Pacific/Auckland", label: "Auckland" },
];

/** Number of digits decides the unit: up to 10 is seconds, 13 or more is ms. */
export function detectTimestampUnit(value: string): TimestampUnit | null {
  const trimmed = value.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/^[+-]/, "").length;
  if (digits <= 10) return "seconds";
  if (digits >= 13) return "milliseconds";
  return null;
}

const MAX_DATE_MS = 8.64e15;

function digitCount(value: string): number {
  const magnitude = value.replace(/^[+-]/, "").split(".")[0] ?? "";
  return magnitude.length;
}

/**
 * Parses Unix seconds, Unix milliseconds, or an ISO 8601 string. With `auto`,
 * an 11 or 12 digit number is rejected because it could be either unit.
 */
export function parseTimestamp(
  input: string,
  choice: TimestampUnitChoice = "auto",
): TimestampParseResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: { title: "Nothing to convert", message: "Enter a timestamp or an ISO 8601 date." },
    };
  }

  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return {
        ok: false,
        error: { title: "Not a number", message: "The value could not be read as a number." },
      };
    }

    let unit: TimestampUnit;
    if (choice === "auto") {
      const digits = digitCount(trimmed);
      if (digits > 10 && digits < 13) {
        return {
          ok: false,
          error: {
            title: "Length is ambiguous",
            message: `${digits} digits could be seconds far in the future or milliseconds close to 1970. Choose the unit explicitly.`,
          },
        };
      }
      unit = digits >= 13 ? "milliseconds" : "seconds";
    } else {
      unit = choice;
    }

    const ms = unit === "seconds" ? numeric * 1000 : numeric;
    if (!Number.isFinite(ms) || Math.abs(ms) > MAX_DATE_MS) {
      return {
        ok: false,
        error: {
          title: "Outside the date range",
          message: "The value is too large to represent as a JavaScript date.",
        },
      };
    }
    return {
      ok: true,
      ms,
      unit,
      seconds: unit === "seconds" ? numeric : numeric / 1000,
    };
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return {
      ok: false,
      error: {
        title: "Not a timestamp or date",
        message:
          "Enter Unix seconds, Unix milliseconds, or an ISO 8601 value such as 2026-11-23T12:00:00Z.",
      },
    };
  }
  return { ok: true, ms: parsed, unit: "iso", seconds: parsed / 1000 };
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a date in a zone as "23 Nov 2026, 12:00:00". The parts are assembled
 * by hand so the result does not depend on the host locale's punctuation.
 */
export function formatZone(ms: number, timeZone?: string): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      ...(timeZone ? { timeZone } : {}),
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    return `${part("day")} ${part("month")} ${part("year")}, ${part("hour")}:${part("minute")}:${part("second")}`;
  } catch {
    return "Unknown time zone";
  }
}

function formatRelative(value: number, unit: string): string {
  const amount = Math.abs(value);
  const label = `${amount} ${unit}${amount === 1 ? "" : "s"}`;
  return value < 0 ? `${label} ago` : `in ${label}`;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const MONTH_MS = 2_592_000_000;
const YEAR_MS = 31_536_000_000;

/** A rounded relative phrase, for example "in 2 hours" or "3 days ago". */
export function relativeTime(targetMs: number, nowMs: number = Date.now()): string {
  const difference = targetMs - nowMs;
  const distance = Math.abs(difference);
  if (distance < 1_000) return "now";
  if (distance < MINUTE_MS) return formatRelative(Math.round(difference / 1_000), "second");
  if (distance < HOUR_MS) return formatRelative(Math.round(difference / MINUTE_MS), "minute");
  if (distance < DAY_MS) return formatRelative(Math.round(difference / HOUR_MS), "hour");
  if (distance < 30 * DAY_MS) return formatRelative(Math.round(difference / DAY_MS), "day");
  if (distance < YEAR_MS) return formatRelative(Math.round(difference / MONTH_MS), "month");
  return formatRelative(Math.round(difference / YEAR_MS), "year");
}

export interface TimestampDescription {
  readonly seconds: string;
  readonly milliseconds: string;
  readonly iso: string;
  readonly utc: string;
  readonly local: string;
  readonly relative: string;
}

export function describeTimestamp(
  ms: number,
  nowMs: number = Date.now(),
): TimestampDescription {
  const date = new Date(ms);
  return {
    seconds: String(ms / 1000),
    milliseconds: String(ms),
    iso: Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString(),
    utc: formatZone(ms, "UTC"),
    local: formatZone(ms),
    relative: relativeTime(ms, nowMs),
  };
}
