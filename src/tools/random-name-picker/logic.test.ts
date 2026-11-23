import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT,
  NAME_LIMIT,
  buildTeams,
  createEntries,
  parseNames,
  pickEntry,
  pushHistory,
  removeEntry,
  resetPool,
} from "./logic";

function names(input: string): readonly string[] {
  const result = parseNames(input);
  if (!result.ok) throw new Error(result.error);
  return result.names;
}

describe("parseNames", () => {
  it("splits lines and commas", () => {
    expect(names("Ada\nGrace, Alan\n\nKatherine,")).toEqual([
      "Ada",
      "Grace",
      "Alan",
      "Katherine",
    ]);
  });

  it("trims whitespace around each name and keeps inner spaces", () => {
    expect(names("  Ada Lovelace  \n\tGrace   Hopper\t")).toEqual([
      "Ada Lovelace",
      "Grace   Hopper",
    ]);
  });

  it("drops blank lines, blank comma fields, and null-like whitespace", () => {
    expect(names(" \n , ,\n\t\n")).toEqual([]);
  });

  it("handles Windows line endings", () => {
    expect(names("Ada\r\nGrace\r\n")).toEqual(["Ada", "Grace"]);
  });

  it("keeps repeated labels as separate entries", () => {
    expect(names("Alex, Alex, Sam")).toEqual(["Alex", "Alex", "Sam"]);
    const entries = createEntries(names("Alex, Alex"));
    expect(entries).toHaveLength(2);
    expect(entries[0]?.id).not.toBe(entries[1]?.id);
    expect(entries[0]?.label).toBe("Alex");
    expect(entries[1]?.label).toBe("Alex");
  });

  it("rejects a list over the cap", () => {
    const input = Array.from({ length: NAME_LIMIT + 1 }, (_, index) => `Name ${index}`).join("\n");
    const result = parseNames(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("10,000");
  });

  it("accepts exactly the cap", () => {
    const input = Array.from({ length: NAME_LIMIT }, (_, index) => `Name ${index}`).join("\n");
    const result = parseNames(input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.names).toHaveLength(NAME_LIMIT);
  });
});

describe("pickEntry", () => {
  it("returns null for an empty pool", () => {
    expect(pickEntry([])).toBeNull();
  });

  it("returns the only entry for a single-name pool", () => {
    const pool = createEntries(["Ada"]);
    expect(pickEntry(pool)?.label).toBe("Ada");
  });

  it("stays inside the pool over many draws", () => {
    const pool = createEntries(["Ada", "Grace", "Alan"]);
    for (let index = 0; index < 500; index += 1) {
      const picked = pickEntry(pool);
      expect(pool).toContainEqual(picked);
    }
  });

  it("can reach every entry", () => {
    const pool = createEntries(["Ada", "Grace", "Alan"]);
    const seen = new Set<number>();
    for (let index = 0; index < 500; index += 1) {
      const picked = pickEntry(pool);
      if (picked) seen.add(picked.id);
    }
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });
});

describe("no-repeat pool", () => {
  it("removes a picked entry without touching a duplicate label", () => {
    const pool = createEntries(["Alex", "Alex", "Sam"]);
    const first = pool[0];
    if (!first) throw new Error("Expected an entry");
    const remaining = removeEntry(pool, first.id);
    expect(remaining.map((entry) => entry.label)).toEqual(["Alex", "Sam"]);
    expect(remaining).toHaveLength(2);
  });

  it("does nothing when the id is not in the pool", () => {
    const pool = createEntries(["Ada"]);
    expect(removeEntry(pool, 99)).toEqual(pool);
  });

  it("resets to the full list", () => {
    const pool = removeEntry(createEntries(["Ada", "Grace"]), 0);
    expect(pool).toHaveLength(1);
    expect(resetPool(["Ada", "Grace"])).toHaveLength(2);
  });

  it("exhausts every name and then returns null", () => {
    let pool = createEntries(["Ada", "Grace", "Alan"]);
    const picked: string[] = [];
    while (pool.length > 0) {
      const entry = pickEntry(pool);
      if (!entry) break;
      picked.push(entry.label);
      pool = removeEntry(pool, entry.id);
    }
    expect(picked.sort()).toEqual(["Ada", "Alan", "Grace"]);
    expect(pickEntry(pool)).toBeNull();
  });
});

describe("pushHistory", () => {
  it("puts the newest winner first", () => {
    expect(pushHistory(["Ada"], "Grace")).toEqual(["Grace", "Ada"]);
  });

  it("caps the list at fifty entries", () => {
    let history: string[] = [];
    for (let index = 0; index < HISTORY_LIMIT + 10; index += 1) {
      history = pushHistory(history, `Winner ${index}`);
    }
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0]).toBe("Winner 59");
  });
});

describe("buildTeams", () => {
  const names10 = Array.from({ length: 10 }, (_, index) => `Name ${index}`);

  it.each([1, 2, 3, 4, 7, 10])("creates %i teams with sizes within one", (count) => {
    const teams = buildTeams(names10, count);
    expect(teams).toHaveLength(count);
    const sizes = teams.map((team) => team.members.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    const members = teams.flatMap((team) => team.members);
    expect(members).toHaveLength(10);
    expect([...members].sort()).toEqual([...names10].sort());
  });

  it("caps the team count at the number of names", () => {
    const teams = buildTeams(["Ada", "Grace", "Alan"], 8);
    expect(teams).toHaveLength(3);
    expect(teams.every((team) => team.members.length === 1)).toBe(true);
  });

  it("returns no teams for an empty list", () => {
    expect(buildTeams([], 3)).toEqual([]);
  });

  it("keeps duplicate names as separate members", () => {
    const teams = buildTeams(["Alex", "Alex"], 2, (items) => [...items]);
    expect(teams.flatMap((team) => team.members)).toEqual(["Alex", "Alex"]);
    expect(teams.map((team) => team.members.length)).toEqual([1, 1]);
  });
});
