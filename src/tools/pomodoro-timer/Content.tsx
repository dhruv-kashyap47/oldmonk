import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does the timer keep running when I switch tabs?",
    answer:
      "Yes. The page stores the time the current phase should end and works out the remaining time from the clock, so a hidden tab does not fall behind. Browsers slow animation frames in the background, so the ring may stop moving for a while. When you come back, the display catches up at once. The chime plays when the page is active again, because a background tab cannot reliably play audio.",
  },
  {
    question: "Are my durations and session count saved?",
    answer:
      "They are stored in this browser under an oldmonk key. Your work, short break, long break, and cadence settings come back after a reload, and the session count stays until the local date changes. Clearing site data for this site removes both.",
  },
  {
    question: "Why did a finished work session not increase the count?",
    answer:
      "Only a work phase that reaches zero counts as a session. Pressing Skip phase moves to the next phase without credit, so the count and the streak stay where they were. Reset also leaves both counters alone.",
  },
  {
    question: "Can I use a cadence other than four sessions?",
    answer:
      "Yes. The Long break every field accepts 2 to 12 work sessions. The next long break follows the new number as soon as the current streak reaches it. Changing the number does not rewrite the sessions you have already finished.",
  },
  {
    question: "Is this the official Pomodoro Technique?",
    answer:
      "It follows the common cycle of a focus block, a short break, and a longer break after a set of blocks. The technique itself comes from Francesco Cirillo, and this page is an independent timer with adjustable lengths. It is not affiliated with him or with any training material.",
  },
  {
    question: "Does the timer keep my screen awake?",
    answer:
      "While a phase runs, the page asks for a screen wake lock where the browser supports it. That can keep a laptop or phone screen on. The lock is released when you pause, reset, skip, or the phase ends.",
  },
  {
    question: "What happens if I reload in the middle of a focus block?",
    answer:
      "The running clock is not saved, so a reload brings back an idle work phase at its full length. Your duration settings, today's session count, and the streak are restored. The phase that was in progress does not gain credit.",
  },
  {
    question: "How is this different from the Countdown Timer?",
    answer:
      "This timer moves between work, short break, and long break on its own, and it keeps today's count and the streak. The Countdown Timer runs one length that you type in, then stops, and it saves nothing.",
  },
  {
    question: "What does the Until long break card count?",
    answer:
      "It shows how many work sessions are left before the long break: the cadence minus your current streak. A finished work session lowers it by one, and a long break fills it back up. Skipping a work phase leaves the streak unchanged.",
  },
  {
    question: "Can I run the timer from the keyboard?",
    answer:
      "Yes. Start, Pause, Reset, Skip phase, and the phase buttons are native buttons in tab order, so Tab moves between them and Enter or Space presses one. The duration fields accept typed numbers, and there is no global shortcut.",
  },
];

export default function PomodoroTimerContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Pomodoro Timer runs one focus block at a time, follows it with a short break, and
        saves the long break for the end of a set. The clock is large enough to read from across
        a desk, and every control is a button you can reach with the keyboard.
      </p>

      <h2>Start a focus block</h2>
      <ol>
        <li>Choose work, short break, or long break. Work is selected when the page opens.</li>
        <li>Press Start. The ring empties as the clock counts down.</li>
        <li>
          When a phase reaches zero, a two tone chime plays and the timer moves to the next
          phase on its own.
        </li>
        <li>
          Press Pause when you step away. Resume continues from the exact remaining time that
          was on screen, then Reset returns the current phase to its full length.
        </li>
        <li>
          Use Skip phase when you want to move on early. The skipped phase does not count as a
          finished session.
        </li>
      </ol>

      <h2>How the phases follow each other</h2>
      <p>
        A work phase adds one to today's count and one to the streak. Before the cadence is
        reached, the break that follows is a short one. When the streak reaches the cadence, the
        next break is the long one, and finishing that long break clears the streak so the cycle
        starts again.
      </p>
      <p>
        Settings start at 25 minutes of work, a 5 minute short break, a 15 minute long break, and
        a long break after four work sessions. The page shows how many sessions are left before
        the long break, and the session card counts what you have finished today.
      </p>

      <h2>Changing the durations</h2>
      <p>
        The Durations row holds four labelled number inputs. Work accepts 1 to 120 minutes, the
        short break 1 to 60, the long break 1 to 90, and the cadence 2 to 12 sessions. A value
        outside a range is pulled back to the nearest end of it, so the timer always has a
        length it can run.
      </p>
      <p>
        When the timer is idle, a new duration appears on the clock immediately. When a phase is
        running, the change applies to the next phase and leaves the current countdown alone,
        apart from capping it at the new full length. The settings are saved as soon as you
        commit a field.
      </p>

      <h2>Timing in a background tab</h2>
      <p>
        A timer built from a repeating interval drifts, because every tick adds a little error
        and a throttled tab skips ticks altogether. This page works differently. Starting a
        phase records the moment it should end, and each frame subtracts the current clock
        reading from that moment. The ring is drawn from the result, and returning to the tab
        forces an immediate recalculation.
      </p>
      <p>
        Audio has its own limit. Browsers require a click or key press before a page may play
        sound, so the first chime becomes possible after you press Start. A tab that is fully in
        the background may not play the chime at the exact second a phase ends. The display and
        the counters are still correct when you return.
      </p>

      <h2>What stays on this device</h2>
      <p>
        Two small records live in this browser. One holds the four duration settings, and the
        other holds the local date, today's session count, and the current streak. Neither
        record contains notes, task names, or anything you type. Nothing is uploaded, and there
        is no account to sign in to.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
