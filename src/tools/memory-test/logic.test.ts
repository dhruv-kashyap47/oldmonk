import { describe, expect, it } from "vitest";
import {
  BASE_FLASH_MS,
  GAP_MS,
  GRID_SIZE,
  MIN_FLASH_MS,
  advanceLevel,
  applyMemoryInput,
  beginInput,
  extendSequence,
  flashDurationMs,
  keyToTile,
  memoryScore,
  nextTile,
  playbackTiming,
  startMemoryRun,
  type MemoryRun,
} from "./logic";

function fixedDraw(value: number) {
  return () => value;
}

function completeCurrentSequence(run: MemoryRun): MemoryRun {
  let current = run;
  for (const tile of run.sequence) {
    current = applyMemoryInput(current, tile).run;
  }
  return current;
}

describe("nextTile", () => {
  it("skips the previous tile and shifts the rest of the range up", () => {
    expect(nextTile(null, fixedDraw(0))).toBe(0);
    expect(nextTile(0, fixedDraw(0))).toBe(1);
    expect(nextTile(3, fixedDraw(0))).toBe(0);
    expect(nextTile(3, fixedDraw(4))).toBe(5);
    expect(nextTile(8, fixedDraw(7))).toBe(7);
  });

  it("never returns the previous tile for any draw", () => {
    for (let previous = 0; previous < GRID_SIZE; previous += 1) {
      for (let draw = 0; draw < GRID_SIZE - 1; draw += 1) {
        expect(nextTile(previous, fixedDraw(draw))).not.toBe(previous);
      }
    }
  });

  it("stays inside the grid", () => {
    for (let draw = 0; draw < GRID_SIZE - 1; draw += 1) {
      const tile = nextTile(null, fixedDraw(draw));
      expect(tile).toBeGreaterThanOrEqual(0);
      expect(tile).toBeLessThan(GRID_SIZE);
    }
  });

  it("rejects a draw outside the offered range", () => {
    expect(() => nextTile(null, fixedDraw(-1))).toThrow(RangeError);
    expect(() => nextTile(null, fixedDraw(GRID_SIZE))).toThrow(RangeError);
    expect(() => nextTile(null, fixedDraw(1.5))).toThrow(RangeError);
  });
});

describe("sequence generation", () => {
  it("starts at level one with a single tile", () => {
    const run = startMemoryRun(fixedDraw(0));
    expect(run.level).toBe(1);
    expect(run.cleared).toBe(0);
    expect(run.sequence).toHaveLength(1);
    expect(run.phase).toBe("playback");
  });

  it("never repeats the same tile twice in a row over a long sequence", () => {
    const sequence = extendSequence([], 200);
    expect(sequence).toHaveLength(200);
    for (let index = 1; index < sequence.length; index += 1) {
      expect(sequence[index]).not.toBe(sequence[index - 1]);
    }
  });

  it("keeps every tile inside the 3 by 3 grid", () => {
    for (const tile of extendSequence([], 100)) {
      expect(tile).toBeGreaterThanOrEqual(0);
      expect(tile).toBeLessThan(GRID_SIZE);
    }
  });
});

describe("level flow", () => {
  it("advances one step after a completed level", () => {
    const start = startMemoryRun(fixedDraw(0));
    const input = beginInput(start);
    const completed = completeCurrentSequence(input);
    const advanced = advanceLevel(completed, fixedDraw(0));

    expect(completed.phase).toBe("input");
    expect(advanced.level).toBe(2);
    expect(advanced.cleared).toBe(1);
    expect(advanced.sequence).toHaveLength(2);
    expect(advanced.sequence.slice(0, 1)).toEqual(start.sequence);
    expect(advanced.sequence[1]).not.toBe(advanced.sequence[0]);
    expect(advanced.phase).toBe("playback");
    expect(advanced.cursor).toBe(0);
  });

  it("advances the cursor on a correct input", () => {
    const run = beginInput(startMemoryRun(fixedDraw(0)));
    const result = applyMemoryInput(run, run.sequence[0] as number);
    expect(result.outcome).toBe("complete");
    expect(result.run.cursor).toBe(0);

    const longer = advanceLevel(result.run, fixedDraw(0));
    const input = beginInput(longer);
    const first = applyMemoryInput(input, longer.sequence[0] as number);
    expect(first.outcome).toBe("correct");
    expect(first.run.cursor).toBe(1);
  });

  it("ignores tile input outside the input phase", () => {
    const run = startMemoryRun(fixedDraw(0));
    expect(applyMemoryInput(run, run.sequence[0] as number).outcome).toBe("ignored");
  });
});

describe("wrong input and scoring", () => {
  it("ends the run on a wrong tile", () => {
    const run = beginInput(startMemoryRun(fixedDraw(0)));
    const wrongTile = ((run.sequence[0] as number) + 1) % GRID_SIZE;
    const result = applyMemoryInput(run, wrongTile);
    expect(result.outcome).toBe("wrong");
    expect(result.run.phase).toBe("over");
  });

  it("ignores further input after the run ends", () => {
    const run = beginInput(startMemoryRun(fixedDraw(0)));
    const wrong = applyMemoryInput(run, 8);
    const again = applyMemoryInput(wrong.run, 8);
    expect(again.outcome).toBe("ignored");
    expect(again.run).toBe(wrong.run);
  });

  it("scores the number of levels cleared, not the failed level", () => {
    let run = beginInput(startMemoryRun(fixedDraw(0)));
    run = completeCurrentSequence(run);
    run = advanceLevel(run, fixedDraw(0));

    run = beginInput(run);
    run = completeCurrentSequence(run);
    run = advanceLevel(run, fixedDraw(0));
    expect(memoryScore(run)).toBe(2);
    expect(run.level).toBe(3);

    run = beginInput(run);
    const wrongTile = ((run.sequence[0] as number) + 1) % GRID_SIZE;
    const failed = applyMemoryInput(run, wrongTile).run;
    expect(failed.phase).toBe("over");
    expect(memoryScore(failed)).toBe(2);
    expect(failed.level).toBe(3);
  });

  it("keeps a failed first level at zero", () => {
    const run = beginInput(startMemoryRun(fixedDraw(0)));
    const failed = applyMemoryInput(run, 8).run;
    expect(memoryScore(failed)).toBe(0);
  });
});

describe("playback pacing", () => {
  it("starts at 460 ms and clamps at 260 ms", () => {
    expect(flashDurationMs(1)).toBe(BASE_FLASH_MS);
    expect(flashDurationMs(2)).toBe(440);
    expect(flashDurationMs(50)).toBe(MIN_FLASH_MS);
  });

  it("uses a 450 ms gap at normal motion", () => {
    expect(playbackTiming(1, false)).toEqual({ flashMs: 460, gapMs: GAP_MS });
  });

  it("shortens both phases for reduced motion", () => {
    const normal = playbackTiming(4, false);
    const reduced = playbackTiming(4, true);
    expect(reduced.flashMs).toBeLessThan(normal.flashMs);
    expect(reduced.gapMs).toBeLessThan(normal.gapMs);
    expect(reduced.flashMs).toBeGreaterThanOrEqual(140);
  });
});

describe("keyboard mapping", () => {
  it("maps number keys 1 to 9 to the grid in reading order", () => {
    expect(keyToTile("1")).toBe(0);
    expect(keyToTile("4")).toBe(3);
    expect(keyToTile("9")).toBe(8);
  });

  it("ignores other keys", () => {
    expect(keyToTile("0")).toBeNull();
    expect(keyToTile("a")).toBeNull();
    expect(keyToTile("10")).toBeNull();
    expect(keyToTile(" ")).toBeNull();
  });
});
