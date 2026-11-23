import type { ReactionStats } from "./logic";

export function formatMs(value: number): string {
  return `${Math.round(value)} ms`;
}

export function formatRoundTimes(times: readonly number[]): string {
  return times.map((time) => formatMs(time)).join(", ");
}

/**
 * A plain note for a round that was much slower than the median. It never
 * guesses why, because the tool cannot know.
 */
export function outlierNote(stats: ReactionStats): string | null {
  if (stats.outliers.length === 0) return null;
  const rounds = stats.outliers.map((index) => index + 1);
  const label = rounds.length === 1 ? "Round" : "Rounds";
  const verb = rounds.length === 1 ? "was" : "were";
  return `${label} ${rounds.join(", ")} ${verb} more than twice the median. The mean includes every round, so the median is the steadier summary.`;
}
