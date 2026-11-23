import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "When does the timer start?",
    answer:
      "The ten second window starts on the Start button, not on your first click on the target. That gives every attempt the same length and lets the zero click case produce an honest result. The panel shows the time left, and the test ends on its own when the window closes.",
  },
  {
    question: "How is CPS calculated?",
    answer:
      "Clicks per second is the number of accepted clicks divided by ten, the length of the window in seconds. Fifty clicks in ten seconds is 5.0 CPS. The result also lists the gaps between clicks, because two runs with the same total can have very different rhythms.",
  },
  {
    question: "Why do two very close clicks count as one?",
    answer:
      "A single tap can produce a duplicate event on some touch devices, and a switch or a mouse can bounce. Any event less than 40 milliseconds after the accepted click is ignored, so one physical action cannot inflate the count. That threshold is far below the pace of a normal run, so it is unlikely to affect a genuine attempt.",
  },
  {
    question: "Does the Space key count as a click?",
    answer:
      "Yes. While the window is running, pressing Space anywhere on the page records one click, as long as the key is not being held down. Holding Space does not repeat. If a text field ever has focus, Space is left alone so typing still works.",
  },
  {
    question: "Can I compare my score with other people?",
    answer:
      "The number depends on the device, the mouse or touch screen, the browser, and the position of your hand. It is useful for comparing your own attempts on the same setup, not as an official record. The best score is stored only in this browser, and the tool does not collect scores from anyone else.",
  },
];

export default function ClickSpeedTestContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Click Speed Test counts how many times you can click or tap a target in ten seconds. It
        reports the raw count, clicks per second, the gaps between clicks, and a consistency score
        so a fast but uneven run does not look the same as a steady one.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Press <strong>Start 10 second test</strong>. The target appears and the window begins.</li>
        <li>Click or tap the large target as often as you can, or press Space.</li>
        <li>Keep going until the timer reaches zero. The test stops on its own.</li>
        <li>
          Read the result, then press <strong>Try again</strong> for another ten second window.
        </li>
      </ol>
      <p>
        Clicks are counted only inside the window. A click on the Start button is not part of the
        count, and a click on the target after the window closes is ignored. The visible counter
        updates during the run, but it is not announced on every click, so screen reader speech
        does not fall behind.
      </p>

      <h2>How the numbers are measured</h2>
      <p>
        The timer starts from a high resolution clock reading and is checked on each animation
        frame against the real elapsed time. The window ends at ten seconds regardless of how many
        frames the browser managed to draw. Clicks per second is the accepted count divided by
        ten. Each accepted click also stores the time since the window began, and the gaps between
        those timestamps become the interval statistics.
      </p>
      <p>
        Consistency compares every gap to the average gap. It uses the standard deviation of the
        intervals: a run with an even rhythm scores near 100, while a run with a long pause and a
        burst scores lower. A single click has no gap to compare, so consistency is reported as
        zero rather than a perfect score.
      </p>

      <h2>Input and duplicate protection</h2>
      <p>
        Mouse clicks, taps, and the Space key all feed the same counter. Holding Space does not
        repeat, and the browser's default Space action is suppressed while the window is running
        so the page does not scroll. A native button supplies the click and keyboard behavior, and
        the target has a large touch area for a phone or tablet.
      </p>
      <p>
        A tap can sometimes produce more than one event, and a worn mouse switch can bounce. Any
        event less than 40 milliseconds after the previous accepted click is discarded. That
        threshold is far below a normal click cadence, so it protects the count without reshaping
        a genuine fast run.
      </p>

      <h2>What affects the result</h2>
      <p>
        The device and input method matter more than most people expect. A mouse, a trackpad, a
        touch screen, and a keyboard have different travel and different event paths. Browser
        scheduling, display refresh, the number of open tabs, and the position of your hand all
        add variation. Ten seconds is also a short sample: one slip or one long pause can move the
        result noticeably.
      </p>
      <p>
        The tool does not publish averages, percentiles, or rankings because it has no data to
        support them. The best CPS in the panel is your own previous result in this browser. A
        zero click run reports 0 CPS and does not replace a stored best.
      </p>

      <h2>Privacy</h2>
      <p>
        Everything happens in this tab. No click data, timing, or score is uploaded. The best CPS
        is kept in local storage so it survives a reload, and clearing site data removes it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
