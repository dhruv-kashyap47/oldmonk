import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Why is the delay random?",
    answer:
      "A fixed delay lets you count down and click in anticipation, which measures timing rather than reaction. Each round waits between 1.5 and 4.5 seconds, drawn from the browser's cryptographic random source. The signal appears at a moment you cannot predict, so the click that follows is a response to the signal.",
  },
  {
    question: "What happens if I click too soon?",
    answer:
      "The attempt ends with a too soon message and the round is not recorded. The round number stays the same, and you can retry it. This keeps an anticipatory click out of the mean instead of letting it look like a very fast reaction.",
  },
  {
    question: "Should I look at the mean, the median, or the best time?",
    answer:
      "The mean is the arithmetic average of all five rounds. The median is the middle value, so one unusually slow round affects it less. The best time is your fastest single round. All three describe this set of five attempts. None of them is a stable personal rating, because a short test is sensitive to a single distraction.",
  },
  {
    question: "How accurate is browser timing?",
    answer:
      "The measurement uses the browser's high resolution clock, but the number still includes display refresh, the operating system's input path, the input device, and browser scheduling. On a 60 Hz display, a frame lasts about 16.7 milliseconds, so differences smaller than a frame cannot be seen reliably. Treat the result as a comparison between your own runs on the same device.",
  },
  {
    question: "Is this a medical or cognitive test?",
    answer:
      "No. It is a simple response time game. It does not diagnose anything and it does not measure attention, intelligence, or fitness. If you have a concern about reaction time or coordination, speak with a qualified professional rather than relying on a web page.",
  },
  {
    question: "What happens if I reload during the five rounds?",
    answer:
      "The run starts over. Only the best mean is kept in this browser, so the round times in progress are lost and the panel returns to Start test.",
  },
  {
    question: "Can I do the test with the keyboard?",
    answer:
      "Yes. The signal panel is a button and takes focus at the start of each round. Press Space or Enter as soon as it turns green, then use the same keys on the Next round button to continue.",
  },
  {
    question: "What does the note about a slow round mean?",
    answer:
      "The note appears when one round is more than twice the median time for the run. It describes that round and does not guess a cause, so fatigue, a distraction, or a missed signal are all possible.",
  },
  {
    question: "Does tapping the panel work on a touch screen?",
    answer:
      "Yes. The panel is one large touch target, and a tap is recorded the same way as a mouse click. A touch screen can add its own delay, so compare runs made on the same device.",
  },
  {
    question: "Is reaction time the same as clicking speed?",
    answer:
      "This test measures the delay between a signal and your response, in milliseconds, across five rounds. The Click Speed Test counts how many clicks you make in ten seconds and reports clicks per second. A quick reaction and a fast clicking pace are different measurements.",
  },
];

export default function ReactionTimeTestContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Reaction Time Test measures the gap between a visual signal and your response. It
        records five rounds, then reports the mean, median, and best time in milliseconds so you
        can see both the typical result and the spread.
      </p>

      <h2>Take five reaction rounds</h2>
      <ol>
        <li>Press <strong>Start test</strong>. The panel shows a waiting message.</li>
        <li>
          Keep your finger or cursor over the panel and wait. After a random delay between 1.5 and
          4.5 seconds, the panel turns green and says <strong>Click now</strong>.
        </li>
        <li>Click, tap, or press Space as soon as the green signal appears.</li>
        <li>
          Read the round time, then press <strong>Next round</strong>. After five recorded rounds
          the summary appears.
        </li>
      </ol>
      <p>
        A click before the signal is shown as <strong>Too soon</strong>. That attempt does not
        count as a round, and the same round number starts again. The signal is also announced to
        screen readers, so the test works without seeing the color change.
      </p>

      <h2>How the numbers are measured</h2>
      <p>
        Each round starts a timeout with a delay drawn from the browser's cryptographic random
        source. When the timeout fires, the tool reads the high resolution clock and marks the
        signal as shown. Your click stops the clock, and the difference between those two readings
        becomes the round time. Five valid rounds make a run. The mean adds all five times and
        divides by five. The median sorts the times and takes the middle value. The best time is
        the smallest of the five.
      </p>
      <p>
        The summary also notes a round that is more than twice the median. That note is a plain
        description of the data, not an explanation. A slow round can come from a distraction, a
        missed signal, a slow device, or simply a late movement. The mean includes it, while the
        median resists it, which is why both are shown.
      </p>

      <h2>What the result measures</h2>
      <p>
        A reaction time is specific to the task in front of you. This test uses a single visual
        change, one input, and a short run of five attempts. A different screen, a different input
        device, or a different kind of signal can produce a different number. Fatigue, recent
        caffeine, room light, screen brightness, and how comfortable your hand is all matter. The
        tool does not know any of those things, and it does not compare you with anyone else.
      </p>
      <p>
        There are no percentiles, rankings, or age bands here because the tool has no data that
        would support them. The best score stored in your browser is your own previous mean, not a
        standard. A smaller mean is better in this test, so the stored score only changes when a
        new run beats it.
      </p>

      <h2>What browser timing adds</h2>
      <p>
        Browser timing is good enough to compare your own attempts, and it has a floor. The display
        refreshes in steps, the operating system delivers input in steps, and the tab may be
        scheduled between other work. On a 60 Hz screen one refresh takes about 16.7 milliseconds,
        so a difference smaller than that is not meaningful. Wireless input devices and touch
        screens can add their own delay. Keep the tab visible and use the same device if you want
        to compare runs.
      </p>

      <h2>Your best mean in this browser</h2>
      <p>
        The test runs entirely in this tab. Nothing is uploaded, and no account is needed. Only
        your best mean is stored, in this browser, so it can be shown on a later visit. Clearing
        site data removes it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
