import { For, Show, createMemo, createSignal } from "solid-js";
import { track } from "../../analytics";
import {
  HISTORY_LIMIT,
  buildTeams,
  createEntries,
  parseNames,
  pickEntry,
  pushHistory,
  removeEntry,
  resetPool,
  type NameEntry,
  type Team,
} from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";

const SAMPLE = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
  "Margaret Hamilton",
  "Linus Torvalds",
].join("\n");

export default function RandomNamePickerTool() {
  const [input, setInput] = createSignal(SAMPLE);
  const [pool, setPool] = createSignal<NameEntry[]>(createEntries(SAMPLE.split("\n")));
  const [winner, setWinner] = createSignal<NameEntry | null>(null);
  const [history, setHistory] = createSignal<string[]>([]);
  const [noRepeat, setNoRepeat] = createSignal(true);
  const [teamCount, setTeamCount] = createSignal("2");
  const [teams, setTeams] = createSignal<Team[]>([]);
  const [notice, setNotice] = createSignal("");
  let sentFirstInput = false;

  const parsed = createMemo(() => parseNames(input()));
  const names = () => {
    const result = parsed();
    return result.ok ? result.names : [];
  };
  const parseError = () => {
    const result = parsed();
    return result.ok ? "" : result.error;
  };
  const winnerStillInPool = () => {
    const current = winner();
    return current !== null && pool().some((entry) => entry.id === current.id);
  };

  function onNamesInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "random-name-picker" });
    }
    const result = parseNames(value);
    setWinner(null);
    setTeams([]);
    if (result.ok) {
      setPool(createEntries(result.names));
      setNotice("");
    } else {
      setPool([]);
      setNotice(result.error);
    }
  }

  function pick() {
    const result = parsed();
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    if (result.names.length === 0) {
      setNotice("Add at least one name before drawing.");
      return;
    }
    const entry = pickEntry(pool());
    if (!entry) {
      setNotice("The pool is empty. Reset it to include every name again.");
      return;
    }
    setWinner(entry);
    setNotice("");
    setHistory(pushHistory(history(), entry.label));
    if (noRepeat()) setPool(removeEntry(pool(), entry.id));
    track("tool_complete", { slug: "random-name-picker" });
  }

  function removeWinner() {
    const current = winner();
    if (!current) return;
    setPool(removeEntry(pool(), current.id));
    setWinner(null);
    setNotice("");
  }

  function reset() {
    const result = parsed();
    setPool(resetPool(result.ok ? result.names : []));
    setWinner(null);
    setTeams([]);
    setNotice("");
  }

  function makeTeams() {
    const result = parsed();
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    if (result.names.length === 0) {
      setNotice("Add at least one name before splitting into teams.");
      return;
    }
    const requested = Number.parseInt(teamCount(), 10);
    if (!Number.isFinite(requested) || requested < 2) {
      setNotice("Choose at least two teams.");
      return;
    }
    setTeams(buildTeams(result.names, requested));
    setNotice("");
    track("tool_complete", { slug: "random-name-picker", mode: "teams" });
  }

  function toggleNoRepeat(checked: boolean) {
    setNoRepeat(checked);
    setNotice("");
  }

  return (
    <>
      <ToolPanel label="Random name picker">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={noRepeat()}
              onChange={(event) => toggleNoRepeat(event.currentTarget.checked)}
              class="size-4 accent-[var(--color-accent)]"
            />
            No repeat
          </label>
          <p class={monoMeta}>
            {names().length.toLocaleString("en")} names, {pool().length.toLocaleString("en")} left
          </p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <ToolTextarea
            name="name-list"
            label="Names"
            value={input()}
            onInput={onNamesInput}
            placeholder={"Ada\nGrace\nAlan"}
            rows={14}
            hint="One name per line, or separate names with commas. Duplicate names stay as separate entries."
          />

          <div class="flex min-w-0 flex-col gap-4">
            <div aria-live="polite">
              <ResultCard
                label="Winner"
                value={<span class="break-words">{winner()?.label ?? "Not drawn yet"}</span>}
              >
                <Show
                  when={history().length > 0}
                  fallback="Press Draw a name to make the first pick."
                >
                  {history().length === 1
                    ? "1 name drawn in this session."
                    : `${history().length} names drawn in this session.`}
                </Show>
              </ResultCard>
            </div>

            <ToolActions>
              <Button variant="primary" onClick={pick} disabled={names().length === 0}>
                Draw a name
              </Button>
              <Button variant="secondary" onClick={removeWinner} disabled={!winnerStillInPool()}>
                Remove winner
              </Button>
              <Button variant="quiet" onClick={reset} disabled={names().length === 0}>
                Reset pool
              </Button>
            </ToolActions>

            <Show when={notice().length > 0}>
              <p role="status" class="text-sm leading-relaxed text-accent-warm">
                {notice()}
              </p>
            </Show>

            <div class="rounded-panel border border-line bg-surface-2/60 p-4">
              <div class="flex flex-wrap items-end gap-3">
                <label class="block">
                  <span class="block text-xs text-muted">Teams</span>
                  <input
                    type="number"
                    min="2"
                    step="1"
                    value={teamCount()}
                    onInput={(event) => setTeamCount(event.currentTarget.value)}
                    class={`${inputBase} mt-1 h-11 w-24`}
                  />
                </label>
                <Button variant="secondary" onClick={makeTeams} disabled={names().length === 0}>
                  Make teams
                </Button>
              </div>
              <p class="mt-3 text-xs leading-relaxed text-muted">
                Names are shuffled, then dealt one at a time, so team sizes differ by at most one.
              </p>
            </div>
          </div>
        </div>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-5">
        <Show when={!parsed().ok}>
          <ErrorState title="The name list is too long">{parseError()}</ErrorState>
        </Show>

        <Show when={parsed().ok && names().length === 0}>
          <EmptyState title="No names yet">
            Type or paste one name per line, or separate names with commas.
          </EmptyState>
        </Show>

        <Show when={teams().length > 0}>
          <section aria-labelledby="teams-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <h2 id="teams-heading" class="font-serif text-xl font-semibold text-ink">
              Teams
            </h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <For each={teams()}>
                {(team) => (
                  <div class="min-w-0 rounded-control border border-line bg-surface-2/60 p-3">
                    <p class="text-sm font-medium text-ink">{team.name}</p>
                    <ul class="mt-2 list-disc pl-5 text-sm text-muted">
                      <For each={team.members} keyed={false}>
                        {(member) => <li class="break-words">{member()}</li>}
                      </For>
                    </ul>
                  </div>
                )}
              </For>
            </div>
          </section>
        </Show>

        <Show when={history().length > 0}>
          <section aria-labelledby="history-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="history-heading" class="font-serif text-xl font-semibold text-ink">
                History
              </h2>
              <p class={monoMeta}>
                {history().length} of {HISTORY_LIMIT}
              </p>
            </div>
            <ol class="mt-4 grid gap-2">
              <For each={history().slice(0, 10)} keyed={false}>
                {(name, index) => (
                  <li class="flex min-w-0 items-baseline gap-3 border-t border-line pt-2 text-sm">
                    <span class={`${monoMeta} shrink-0`}>{index + 1}</span>
                    <span class="min-w-0 break-words text-ink">{name()}</span>
                  </li>
                )}
              </For>
            </ol>
            <Show when={history().length > 10}>
              <p class="mt-3 text-xs text-muted">
                Plus {history().length - 10} earlier{" "}
                {history().length - 10 === 1 ? "winner" : "winners"}.
              </p>
            </Show>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <CopyButton text={history().join("\n")} label="Copy history" />
              <Button variant="quiet" onClick={() => setHistory([])}>
                Clear history
              </Button>
            </div>
          </section>
        </Show>
      </div>
    </>
  );
}
