import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "What formats can I type in the duration field?",
    answer:
      "Hours, minutes, and seconds as HH:MM:SS, minutes and seconds as MM:SS, or a plain number of minutes. So 90:00 and 1:30:00 both mean ninety minutes, and 90 on its own does as well. The field accepts spaces around the value and rejects anything that is not a whole number of seconds.",
  },
  {
    question: "What happens when the countdown reaches zero?",
    answer:
      "The clock stops at 00:00, the ring closes, a two tone chime plays, and the status changes to Time is up. The finish runs once, so the chime does not repeat while you leave the tab open. Press Start again to run the same length, or type a new duration first.",
  },
  {
    question: "Does the countdown stay accurate in a background tab?",
    answer:
      "Yes. The page records the finishing time when you press Start and recalculates from the clock, so a tab that was hidden for ten minutes shows the correct remaining time when you return. Browsers slow animation frames in the background, so the chime may arrive when you come back rather than at the exact second.",
  },
  {
    question: "Is the duration remembered after a reload?",
    answer:
      "No. The countdown keeps nothing in local storage, so a reload starts again at five minutes. That is deliberate for a shared computer, and it means there is no record of when you ran the timer or for how long.",
  },
  {
    question: "Why can I not hear the chime?",
    answer:
      "Browsers block audio until the page has received a click or key press, so the sound is unlocked when you press Start. Check the system volume, the tab mute button, and the site sound setting in your browser. If the tab was in the background for the whole countdown, the chime may have waited until you returned.",
  },
  {
    question: "How is this different from the Pomodoro Timer?",
    answer:
      "This page counts down one length that you set, then stops at zero. The Pomodoro Timer cycles through work and break phases, chooses the next phase for you, and keeps a daily session count. If you want a single timer with no history, use this page.",
  },
  {
    question: "What does the message under the duration field mean?",
    answer:
      "It means the text could not be read as a length. Zero, a negative number, seconds above 59 in the last position, or a total beyond 24 hours all produce it. The timer stays idle until you enter a value that it can run.",
  },
  {
    question: "Can I change the length while the countdown runs?",
    answer:
      "No. The duration field and the preset buttons are locked while the timer runs or is paused. Press Reset after pausing to return to an editable full length, or wait for the countdown to finish.",
  },
  {
    question: "Does the tab title show the time left?",
    answer:
      "Yes. While the countdown runs, the browser tab shows the remaining time next to the word Countdown, so a pinned tab gives you a glance from another tab. The original title comes back when you pause or reset.",
  },
  {
    question: "Is there a keyboard shortcut to start or pause?",
    answer:
      "No global shortcut is defined. The presets and the Start, Pause, and Resume buttons are native buttons, so tab to one and press Enter or Space. This leaves the Space key alone for whatever else you are doing in the browser.",
  },
];

export default function CountdownTimerContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Countdown Timer counts down from a length you choose, from one second to twenty four
        hours. A ring shows how much is left, the clock shows the exact time, and a chime marks
        the end. Nothing is uploaded and nothing is saved between visits.
      </p>

      <h2>Setting a countdown</h2>
      <p>
        Type a length in the Duration field. The field understands three shapes: hours, minutes,
        and seconds as <code>HH:MM:SS</code>, minutes and seconds as <code>MM:SS</code>, or a
        plain number of minutes. <code>00:30</code> is half a minute, <code>25:00</code> is
        twenty five minutes, and <code>1:30:00</code> is ninety minutes. A single number such as{" "}
        <code>10</code> means ten minutes.
      </p>
      <p>
        The four preset buttons set 1, 5, 10, or 25 minutes with one press. They stay available
        until the timer starts, and the active preset is marked so you can see which length is
        loaded. Choose a preset and press Start, or type your own value and press Start.
      </p>

      <h2>Reading the ring</h2>
      <p>
        The ring starts as a full circle and loses an arc as the countdown runs. The remaining
        time sits in the middle in large tabular figures, so the digits keep their position as
        they change instead of shifting left and right. Both the ring and the clock are driven by
        one signal, which is recalculated from the finishing time on every frame.
      </p>
      <p>
        When the countdown ends, the clock reads <code>00:00</code> and stops there. The
        remaining time never goes below zero, however long the page stays open. A short finished
        panel appears under the controls, and the status card changes to Time is up.
      </p>

      <h2>Pause, resume, and reset</h2>
      <p>
        Pause stores the remaining milliseconds and stops the frame loop. Resume sets a fresh
        finishing time from those milliseconds, so the countdown continues from the number that
        was on screen. Reset puts the full length back on the clock and makes the duration field
        editable again.
      </p>
      <p>
        The clock does not lose time while paused or while the tab is hidden. The browser may
        slow animation frames in a background tab, but the arithmetic still uses the recorded
        finishing time, so the display catches up as soon as you return.
      </p>

      <h2>Length limits and rejected input</h2>
      <p>
        The maximum length is 24 hours and the minimum is one second. A value of zero, a negative
        number, or a malformed time is rejected with a message next to the field rather than
        starting a broken timer. The countdown does not create system notifications, so the
        chime only works while the page is open in a tab.
      </p>

      <h2>How the chime works and what is saved</h2>
      <p>
        The chime is generated with the Web Audio API, so there is no audio file to download. The
        first press of Start unlocks audio for the page, which is the gesture browsers require.
        The timer runs entirely in the browser, keeps no history, and stores no duration, so
        closing the tab leaves nothing behind.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
