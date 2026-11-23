import { describe, expect, it } from "vitest";
import {
  describeTimestamp,
  detectTimestampUnit,
  formatZone,
  isValidTimeZone,
  parseTimestamp,
  relativeTime,
} from "./logic";

function parse(input: string, choice: "auto" | "seconds" | "milliseconds" = "auto") {
  const result = parseTimestamp(input, choice);
  if (!result.ok) throw new Error(`Expected a parse, got ${result.error.title}`);
  return result;
}

function parseError(input: string, choice: "auto" | "seconds" | "milliseconds" = "auto") {
  const result = parseTimestamp(input, choice);
  if (result.ok) throw new Error("Expected a parse error");
  return result.error;
}

describe("detectTimestampUnit", () => {
  it("treats up to ten digits as seconds", () => {
    expect(detectTimestampUnit("1763000000")).toBe("seconds");
    expect(detectTimestampUnit("9999999999")).toBe("seconds");
    expect(detectTimestampUnit("0")).toBe("seconds");
    expect(detectTimestampUnit("-1")).toBe("seconds");
  });

  it("treats thirteen digits or more as milliseconds", () => {
    expect(detectTimestampUnit("1763000000000")).toBe("milliseconds");
    expect(detectTimestampUnit("1763000000000000")).toBe("milliseconds");
  });

  it("marks eleven and twelve digits as ambiguous", () => {
    expect(detectTimestampUnit("17630000000")).toBeNull();
    expect(detectTimestampUnit("176300000000")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(detectTimestampUnit("2026-11-23")).toBeNull();
    expect(detectTimestampUnit("hello")).toBeNull();
  });
});

describe("parseTimestamp", () => {
  it("converts seconds to milliseconds", () => {
    const result = parse("1763000000");
    expect(result.unit).toBe("seconds");
    expect(result.ms).toBe(1_763_000_000_000);
    expect(result.seconds).toBe(1_763_000_000);
  });

  it("keeps milliseconds as milliseconds", () => {
    const result = parse("1763000000123");
    expect(result.unit).toBe("milliseconds");
    expect(result.ms).toBe(1_763_000_000_123);
    expect(result.seconds).toBe(1_763_000_000.123);
  });

  it("rejects an ambiguous length in auto mode", () => {
    const error = parseError("17630000000");
    expect(error.title).toBe("Length is ambiguous");
  });

  it("accepts an ambiguous length when the unit is explicit", () => {
    expect(parse("17630000000", "seconds").ms).toBe(17_630_000_000_000);
    expect(parse("17630000000", "milliseconds").ms).toBe(17_630_000_000);
  });

  it("handles fractional seconds", () => {
    const result = parse("1763000000.5");
    expect(result.ms).toBe(1_763_000_000_500);
    expect(result.seconds).toBe(1_763_000_000.5);
  });

  it("parses ISO 8601 with a zone", () => {
    const result = parse("2026-11-23T12:00:00Z");
    expect(result.unit).toBe("iso");
    expect(result.ms).toBe(Date.UTC(2026, 10, 23, 12, 0, 0));
  });

  it("parses ISO 8601 with an offset", () => {
    const result = parse("2026-11-23T12:00:00+05:30");
    expect(result.ms).toBe(Date.UTC(2026, 10, 23, 6, 30, 0));
  });

  it("parses a date-only ISO string as UTC midnight", () => {
    expect(parse("2026-11-23").ms).toBe(Date.UTC(2026, 10, 23));
  });

  it("handles zero and negative timestamps", () => {
    expect(parse("0").ms).toBe(0);
    expect(parse("-1").ms).toBe(-1000);
    expect(parse("-1000", "milliseconds").ms).toBe(-1000);
  });

  it("rejects text that is neither a number nor a date", () => {
    expect(parseError("hello").title).toBe("Not a timestamp or date");
  });

  it("rejects an empty input", () => {
    expect(parseError("   ").title).toBe("Nothing to convert");
  });

  it("rejects a value outside the JavaScript date range", () => {
    expect(parseError("99999999999999999999").title).toBe("Outside the date range");
  });
});

describe("formatZone", () => {
  it("formats UTC with stable punctuation", () => {
    expect(formatZone(Date.UTC(2026, 10, 23, 12, 0, 0), "UTC")).toBe("23 Nov 2026, 12:00:00");
  });

  it("uses the zone offset in winter and summer", () => {
    const winter = Date.UTC(2026, 0, 15, 12, 0, 0);
    const summer = Date.UTC(2026, 6, 15, 12, 0, 0);
    expect(formatZone(winter, "America/New_York")).toBe("15 Jan 2026, 07:00:00");
    expect(formatZone(summer, "America/New_York")).toBe("15 Jul 2026, 08:00:00");
  });

  it("handles a zone east of UTC", () => {
    expect(formatZone(Date.UTC(2026, 10, 23, 12, 0, 0), "Asia/Kolkata")).toBe(
      "23 Nov 2026, 17:30:00",
    );
  });

  it("reports an unknown zone instead of throwing", () => {
    expect(formatZone(0, "Not/AZone")).toBe("Unknown time zone");
  });

  it("validates zone names", () => {
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });
});

describe("relativeTime", () => {
  it("says now inside one second", () => {
    expect(relativeTime(1_000, 1_500)).toBe("now");
    expect(relativeTime(1_500, 1_000)).toBe("now");
  });

  it("reports past and future seconds, minutes, and hours", () => {
    const now = 1_700_000_000_000;
    expect(relativeTime(now - 30_000, now)).toBe("30 seconds ago");
    expect(relativeTime(now + 90_000, now)).toBe("in 2 minutes");
    expect(relativeTime(now - HOUR, now)).toBe("1 hour ago");
  });

  it("reports days, months, and years", () => {
    const now = 1_700_000_000_000;
    expect(relativeTime(now + 3 * 86_400_000, now)).toBe("in 3 days");
    expect(relativeTime(now - 60 * 86_400_000, now)).toBe("2 months ago");
    expect(relativeTime(now + 2 * 31_536_000_000, now)).toBe("in 2 years");
  });
});

const HOUR = 3_600_000;

describe("describeTimestamp", () => {
  it("describes the epoch", () => {
    const result = describeTimestamp(0, 0);
    expect(result.seconds).toBe("0");
    expect(result.milliseconds).toBe("0");
    expect(result.iso).toBe("1970-01-01T00:00:00.000Z");
    expect(result.utc).toBe("01 Jan 1970, 00:00:00");
    expect(result.relative).toBe("now");
    expect(result.local.length).toBeGreaterThan(0);
  });

  it("keeps the fraction in seconds", () => {
    expect(describeTimestamp(1_500, 0).seconds).toBe("1.5");
  });
});
