import { describe, expect, it } from "vitest";
import { uuidV7Timestamp } from "../../lib/random";
import { formatUuid, generateUuids, UUID_MAX_COUNT, UUID_MIN_COUNT } from "./logic";

const V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function generate(version: 4 | 7, count: number, uppercase = false, hyphens = true) {
  const result = generateUuids(version, count, { uppercase, hyphens }, 1_700_000_000_000);
  if (!result.ok) throw new Error(`Expected UUIDs, got ${result.error}`);
  return result.uuids;
}

describe("generateUuids", () => {
  it("generates version 4 UUIDs with the right version and variant", () => {
    const uuids = generate(4, 50);
    for (const uuid of uuids) expect(uuid).toMatch(V4);
  });

  it("generates version 7 UUIDs with the right version and variant", () => {
    const uuids = generate(7, 50);
    for (const uuid of uuids) expect(uuid).toMatch(V7);
  });

  it("encodes the requested millisecond timestamp in version 7", () => {
    const [uuid] = generate(7, 1);
    expect(uuid).toBeDefined();
    if (!uuid) return;
    expect(uuidV7Timestamp(uuid)).toBe(1_700_000_000_000);
  });

  it("returns the requested count", () => {
    expect(generate(4, 1)).toHaveLength(1);
    expect(generate(4, 1000)).toHaveLength(1000);
  });

  it("keeps generated values unique", () => {
    const uuids = generate(4, 500);
    expect(new Set(uuids).size).toBe(uuids.length);
  });

  it("keeps version 7 values unique within one millisecond", () => {
    const uuids = generate(7, 500);
    expect(new Set(uuids).size).toBe(uuids.length);
  });

  it("applies uppercase and hyphen settings", () => {
    const [upper] = generate(4, 1, true, true);
    expect(upper).toMatch(/^[0-9A-F-]+$/);
    const [compact] = generate(4, 1, false, false);
    expect(compact).toMatch(/^[0-9a-f]{32}$/);
    const [upperCompact] = generate(4, 1, true, false);
    expect(upperCompact).toMatch(/^[0-9A-F]{32}$/);
  });

  it("rejects counts outside the bounds", () => {
    for (const count of [0, -1, 1.5, Number.NaN, UUID_MAX_COUNT + 1]) {
      const result = generateUuids(4, count);
      expect(result.ok).toBe(false);
    }
  });

  it("accepts the exact bounds", () => {
    expect(generateUuids(4, UUID_MIN_COUNT).ok).toBe(true);
    expect(generateUuids(4, UUID_MAX_COUNT).ok).toBe(true);
  });

  it("rejects an unknown version", () => {
    const result = generateUuids(5 as 4, 2);
    expect(result.ok).toBe(false);
  });
});

describe("formatUuid", () => {
  const uuid = "018f3e2a-7b1c-7d4e-8f01-2a3b4c5d6e7f";

  it("keeps the canonical form by default", () => {
    expect(formatUuid(uuid)).toBe(uuid);
  });

  it("uppercases every hex letter", () => {
    expect(formatUuid(uuid, { uppercase: true })).toBe(uuid.toUpperCase());
  });

  it("removes hyphens without changing anything else", () => {
    expect(formatUuid(uuid, { hyphens: false })).toBe(uuid.replaceAll("-", ""));
  });
});
