import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does the picker use Math.random?",
    answer:
      "No. It calls crypto.getRandomValues, the random source the browser exposes for security work. The helper in this tool uses rejection sampling, so the modulo step that maps a 32-bit value to an index does not favour any entry.",
  },
  {
    question: "What happens when no-repeat mode runs out of names?",
    answer:
      "The pool becomes empty and the picker stops rather than repeating a winner. Press Reset pool to put every name back. History is separate, so you can keep the list of winners while starting a fresh round.",
  },
  {
    question: "Why are two people with the same name kept apart?",
    answer:
      "Each parsed name gets a stable id, and the pool tracks ids instead of labels. Two entries called Alex are two separate chances to be drawn, and removing one Alex leaves the other one in the pool.",
  },
  {
    question: "How does team splitting work?",
    answer:
      "The names are shuffled, then dealt one at a time to Team 1, Team 2, and so on, wrapping back to the start. With ten names and three teams the sizes are four, three, and three. Each entry goes to exactly one team, and duplicate labels stay separate.",
  },
  {
    question: "Is there a list size limit?",
    answer:
      "Yes, one list can hold 10,000 names. That cap keeps parsing and redrawing responsive in a browser tab. Blank lines and empty comma fields are dropped before the count is checked.",
  },
];

export default function RandomNamePickerContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Random Name Picker draws a winner from a list you type or paste. It handles lines or
        commas, keeps repeated names as separate entries, and can exclude earlier winners until
        the pool is reset.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>
          Paste one name per line, or separate names with commas. Spaces around each name are
          trimmed, and blank lines are ignored.
        </li>
        <li>
          Keep <strong>No repeat</strong> on when a person should not win twice in the same round.
          Turn it off when every name stays eligible after each draw.
        </li>
        <li>
          Press <strong>Draw a name</strong>. The winner appears above the controls and joins the
          history.
        </li>
        <li>
          Use <strong>Remove winner</strong> when you want to exclude the current winner from later
          draws, or <strong>Reset pool</strong> to allow everyone again.
        </li>
        <li>
          Enter a team count and press <strong>Make teams</strong> for a round-robin split.
        </li>
      </ol>

      <h2>How the draw works</h2>
      <p>
        The picker reads a random 32-bit value from <code>crypto.getRandomValues</code> and maps it
        to an index in the pool. A plain modulo operation would slightly favour lower indexes when
        the pool size does not divide the 32-bit range, so the helper rejects values above the
        largest multiple of the pool size and draws again. That rejection step is what makes each
        remaining index equally likely.
      </p>
      <p>
        The random source is the browser's cryptographic generator. It is not seeded by a visible
        number, so the same list and the same settings will not replay an earlier result. That is
        usually what you want for a draw. If you need a repeatable sequence for a test, this tool
        is not the right instrument.
      </p>

      <h2>Duplicates and the exclusion pool</h2>
      <p>
        A name is not treated as a key. Each parsed entry receives an id in list order, which means
        two entries called Alex are two distinct participants. In no-repeat mode the picked id
        leaves the pool, while its twin stays in. The winner card and history show the label, so
        two winners with the same label can look alike, but the pool still tracks them separately.
      </p>
      <p>
        History keeps the 50 most recent winners, newest first. It survives picks and pool resets
        during the session because it is a record of what happened, not part of the draw. A page
        reload clears it, along with the list.
      </p>

      <h2>Teams</h2>
      <p>
        Team building shuffles the full list with the same crypto source, then deals names one at a
        time across the teams. If the names do not divide evenly, the first teams receive one extra
        member, so the largest and smallest team differ by at most one. The split always starts
        from the full name list, not from the current no-repeat pool.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        A single list is capped at 10,000 names. Parsing and drawing happen on the main thread, so a
        very large list can take a moment to update. The list stays in this tab, with no network
        request and no saved copy. Closing the tab discards everything.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
