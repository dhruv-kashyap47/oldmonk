import { describe, expect, it } from "vitest";
import {
  MAX_DELAY_MS,
  MIN_DELAY_MS,
  REACTION_ROUNDS,
  beginWaiting,
  initialReactionRun,
  isSlowRound,
  markReady,
  markTooSoon,
  randomReactionDelay,
  recordReaction,
  summarizeReaction,
} from "./logic";

describe("randomReactionDelay", () => {
  it("stays inside the 1.5 to 4.5 second band", () => {
    for (let index = 0; index < 200; index += 1) {
      const delay = randomReactionDelay();
      expect(delay).toBeGreaterThanOrEqual(MIN_DELAY_MS);
      expect(delay).toBeLessThanOrEqual(MAX_DELAY_MS);
      expect(Number.isInteger(delay)).toBe(true);
    }
  });

  it("uses a band that does not let a player anticipate one fixed time", () => {
    expect(MAX_DELAY_MS - MIN_DELAY_MS).toBe(3000);
  });
});

describe("round flow", () => {
  it("moves idle to waiting to ready", () => {
    const waiting = beginWaiting(initialReactionRun);
    expect(waiting.phase).toBe("waiting");
    expect(waiting.round).toBe(1);
    const ready = markReady(waiting);
    expect(ready.phase).toBe("ready");
    expect(ready.times).toEqual([]);
  });

  it("ignores a signal when the round is not waiting", () => {
    expect(markReady(initialReactionRun)).toBe(initialReactionRun);
  });

  it("ignores an early click after the signal", () => {
    const ready = markReady(beginWaiting(initialReactionRun));
    expect(markTooSoon(ready)).toBe(ready);
    expect(markTooSoon(ready).times).toEqual([]);
  });

  it("does not record a time from a round that is not ready", () => {
    expect(recordReaction(initialReactionRun, 250).times).toEqual([]);
    const waiting = beginWaiting(initialReactionRun);
    expect(recordReaction(waiting, 250).times).toEqual([]);
  });

  it("runs five rounds and ends on the summary", () => {
    let run = initialReactionRun;
    for (let round = 1; round <= REACTION_ROUNDS; round += 1) {
      run = beginWaiting(run);
      run = markReady(run);
      run = recordReaction(run, 200 + round * 10);
      if (round < REACTION_ROUNDS) {
        expect(run.phase).toBe("result");
        expect(run.round).toBe(round + 1);
      }
    }
    expect(run.phase).toBe("summary");
    expect(run.times).toEqual([210, 220, 230, 240, 250]);
    expect(run.round).toBe(5);
  });

  it("treats an early click as a retry and keeps the round number", () => {
    let run = beginWaiting(initialReactionRun);
    run = markTooSoon(run);
    expect(run.phase).toBe("tooSoon");
    expect(run.round).toBe(1);
    expect(run.times).toEqual([]);

    run = beginWaiting(run);
    expect(run.phase).toBe("waiting");
    run = markReady(run);
    run = recordReaction(run, 280);
    expect(run.times).toEqual([280]);
    expect(run.round).toBe(2);
  });

  it("needs five valid reactions even after early clicks", () => {
    let run = initialReactionRun;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      run = beginWaiting(run);
      run = markTooSoon(run);
    }
    for (let round = 0; round < REACTION_ROUNDS; round += 1) {
      run = beginWaiting(run);
      run = markReady(run);
      run = recordReaction(run, 300);
    }
    expect(run.phase).toBe("summary");
    expect(run.times).toHaveLength(REACTION_ROUNDS);
  });

  it("ignores a negative or non-finite time", () => {
    const ready = markReady(beginWaiting(initialReactionRun));
    expect(recordReaction(ready, -1)).toBe(ready);
    expect(recordReaction(ready, Number.NaN)).toBe(ready);
  });
});

describe("summarizeReaction", () => {
  it("reports the mean", () => {
    const stats = summarizeReaction([200, 250, 300]);
    expect(stats?.mean).toBe(250);
  });

  it("reports the median for odd and even counts", () => {
    expect(summarizeReaction([100, 300, 200])?.median).toBe(200);
    expect(summarizeReaction([100, 200, 300, 400])?.median).toBe(250);
  });

  it("reports the best and worst times", () => {
    const stats = summarizeReaction([240, 190, 310]);
    expect(stats?.best).toBe(190);
    expect(stats?.worst).toBe(310);
    expect(stats?.count).toBe(3);
  });

  it("returns null for an empty series", () => {
    expect(summarizeReaction([])).toBeNull();
  });

  it("ignores invalid entries", () => {
    const stats = summarizeReaction([200, Number.NaN, -5, 300]);
    expect(stats?.count).toBe(2);
    expect(stats?.mean).toBe(250);
  });

  it("marks a round slower than twice the median", () => {
    const stats = summarizeReaction([200, 220, 240, 260, 900]);
    expect(stats?.median).toBe(240);
    expect(stats?.outliers).toEqual([4]);
  });

  it("uses a strict threshold", () => {
    expect(isSlowRound(400, 200)).toBe(false);
    expect(isSlowRound(401, 200)).toBe(true);
    expect(isSlowRound(900, 0)).toBe(false);
  });

  it("does not flag an evenly spread series", () => {
    const stats = summarizeReaction([180, 220, 260, 300, 340]);
    expect(stats?.outliers).toEqual([]);
  });
});
