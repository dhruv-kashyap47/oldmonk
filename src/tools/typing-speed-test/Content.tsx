import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "How is words per minute calculated?",
    answer:
      "Net WPM divides the number of correct characters by five, then converts that figure to a per-minute rate using the exact run duration. Five characters is the standard word length for typing tests. Wrong characters and characters typed past the end of the passage do not add to net speed.",
  },
  {
    question: "What is the difference between net WPM and raw WPM?",
    answer:
      "Raw WPM counts every character you typed, including mistakes and extra letters. Net WPM counts only characters that match the passage. A large gap between the two means speed is coming at the cost of accuracy. Accuracy is also shown directly as correct characters over characters typed.",
  },
  {
    question: "Why is paste blocked?",
    answer:
      "A pasted passage would finish the test without measuring typing. The input field rejects paste, drop, and the paste shortcut, and shows a notice when it happens. Typing, backspace, and normal keyboard editing still work.",
  },
  {
    question: "Does the timer drift if the tab is busy?",
    answer:
      "The clock is read from performance.now() on each animation frame, so the result uses the real elapsed time rather than a count of timer callbacks. If the browser throttles a background tab, the run can end late, but the reported duration is still measured from the first character to the finish. Keep the tab visible for a clean result.",
  },
  {
    question: "What does consistency mean?",
    answer:
      "Consistency compares each full second of typing to the average second. It uses the standard deviation of the per-second speed samples: a steady pace scores near 100, and a run with fast bursts and long pauses scores lower. The final partial second is not sampled, so a short pause at the end does not distort the figure.",
  },
  {
    question: "Is my best score kept after a reload?",
    answer:
      "Yes. The best net speed in this browser is stored and shown again on your next visit. The current run, the typed text, and the passage position are not saved. Clearing site data removes the stored best.",
  },
  {
    question: "Does the test work with an on-screen keyboard?",
    answer:
      "Yes. Tap the passage to place the cursor and type with the on-screen keyboard. Autocorrect, capitalization, and spellcheck are turned off on the input field, though some keyboards still offer suggestions that can change a word.",
  },
  {
    question: "Can I use Backspace and the arrow keys to fix a mistake?",
    answer:
      "Backspace deletes the last character and the clock keeps running. The arrow keys, Home, and End are blocked so the cursor stays at the end of your text, and clicking the field also moves it there. Restart clears everything and loads a new passage.",
  },
  {
    question: "Am I being timed while I read the passage?",
    answer:
      "No. The Start typing button only places the cursor in the field; the clock starts on your first character. That means you can read the opening line without losing time. The time left counter stays at the full length until then.",
  },
  {
    question: "How is this different from the Click Speed Test?",
    answer:
      "This test measures typing, so only correct characters count toward net speed and mistakes lower it. The Click Speed Test counts clicks in a fixed ten second window and reports clicks per second. Both keep a best result in this browser.",
  },
];

export default function TypingSpeedTestContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Typing Speed Test measures how quickly and accurately you copy a passage in a fixed
        window. Choose 15, 30, or 60 seconds, start typing, and the run reports net words per
        minute, raw speed, accuracy, and how steady your pace was.
      </p>

      <h2>Take a timed typing run</h2>
      <ol>
        <li>Choose a test length. The 15 second run is a quick check, while 60 seconds gives a steadier picture.</li>
        <li>Tap the passage or press <strong>Start typing</strong> to place the cursor.</li>
        <li>
          Type the passage exactly as it appears. The clock starts on your first character, not on
          the button, so you can read the opening line before you begin.
        </li>
        <li>
          Keep going until the timer reaches zero. Your result appears below the panel, and{" "}
          <strong>Try again</strong> starts a fresh passage in the same mode.
        </li>
      </ol>
      <p>
        Correct characters appear in the normal text color, wrong characters are marked in red,
        and anything typed past the end of the passage is flagged as extra. The next character
        carries a visible outline so the eye can find its place after a pause.
      </p>

      <h2>How the numbers are measured</h2>
      <p>
        Net WPM uses the standard five character word: correct characters divided by five,
        divided by the run length in minutes. If you type 250 correct characters in one minute,
        the result is 50 WPM. Raw WPM applies the same formula to every character you typed,
        including mistakes and extra letters. Accuracy is correct characters divided by characters
        typed, so an empty input reports 100 percent and a single wrong letter lowers the figure
        immediately.
      </p>
      <p>
        Consistency comes from per-second samples. The tool records how many characters you add
        in each full second, converts each sample to WPM, and compares the samples to their mean.
        A flat series of samples scores 100. A series with bursts and pauses scores lower. This is
        a description of the run you just completed, not a rating of your ability, and it will
        move with the passage and the keyboard you use.
      </p>

      <h2>Modes and passages</h2>
      <p>
        Each mode repeats the three original practice passages until there is enough text to fill
        the window. The passages are plain prose with ordinary punctuation, so the test measures
        typing rather than decoding unusual symbols. A new passage is selected when you restart.
        Mode changes are announced to screen readers, while the live timer and speed counters
        update silently so they do not interrupt the run.
      </p>

      <h2>What changes the measured speed</h2>
      <p>
        The score reflects this browser, this keyboard, and this moment. Key travel, keyboard
        layout, screen refresh, operating system input latency, and whether the tab stays visible
        all affect the measured time. The tool cannot see hardware delays, and it starts the clock
        on the input event rather than on the physical key press. Treat the number as a useful
        comparison between your own runs, not as an official record. Mobile keyboards can also
        autocorrect or suggest words, which is why those features are turned off on the input
        field; the result still depends on the device.
      </p>

      <h2>What is saved from a run</h2>
      <p>
        The passage and everything you type stay in this tab. There is no upload and no account.
        The best net speed is stored in this browser so you can see it on a later visit, and
        clearing site data removes it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
