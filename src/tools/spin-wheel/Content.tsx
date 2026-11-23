import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "How is the winning entry chosen?",
    answer:
      "The tool first picks an index with crypto.getRandomValues, then picks a stop angle inside that sector. The animation only moves the wheel to the angle that was already chosen, so the spin cannot change the winner.",
  },
  {
    question: "Why does the pointer stop short of a dividing line?",
    answer:
      "A stop angle is kept 8 percent of a sector away from each edge. With an even split, the needle lands in the middle 84 percent of the winning sector, which makes the result easy to read and keeps it away from thin divider lines.",
  },
  {
    question: "What happens with reduced motion turned on?",
    answer:
      "The browser setting is checked when you press Spin. If reduced motion is requested, the wheel jumps straight to the final angle and the result appears at once. Nothing loops, and the result is still announced.",
  },
  {
    question: "Is the wheel usable without seeing the drawing?",
    answer:
      "Yes. The entries are also printed as a numbered list below the wheel, and the result sits in a polite live region. The Spin button is a normal keyboard-operable button, so Tab and Enter are enough.",
  },
  {
    question: "Where does the randomness come from?",
    answer:
      "Both the winning index and the stop position use the helper in src/lib/random.ts, which reads crypto.getRandomValues and rejects values that would introduce modulo bias. Math.random is never used.",
  },
];

export default function SpinWheelContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Spin Wheel gives each entry an equal slice, draws a winner with the browser's
        cryptographic random source, and animates the wheel to a stop inside the winning sector.
        The result, the entries, and the history stay in the page.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Type or paste one entry per line in the Entries field.</li>
        <li>
          Press <strong>Spin the wheel</strong>, or focus it with Tab and press Enter or Space.
        </li>
        <li>
          Read the result above the wheel. It is also announced through a polite live region for
          screen readers.
        </li>
        <li>
          Spin again for another draw, or press <strong>Reset wheel</strong> to clear the result and
          the history.
        </li>
      </ol>

      <h2>Equal sectors, one winner</h2>
      <p>
        Every entry gets the same sector width, computed as 360 degrees divided by the number of
        entries. The winner is selected first, using the same secure helper as the other random
        tools. Only after that does the tool choose where inside the sector the needle should rest.
        The stop position is held at least 8 percent of a sector width from either edge, so the
        pointer never sits on a divider.
      </p>
      <p>
        The rotation shown on screen is derived from the stop angle. A sector at angle A needs the
        wheel to turn to 360 minus A for that point to meet the pointer at the top. That mapping is
        calculated before the animation starts, which is why the wheel cannot drift into a
        neighbouring sector at the end of a long spin.
      </p>

      <h2>The animation</h2>
      <p>
        The spin uses requestAnimationFrame with an ease-out curve over roughly three seconds. The
        animation is plain browser code, so the page gains no new dependency. Each frame updates
        the rotation and redraws the wheel on a canvas that accounts for the screen pixel ratio, so
        lines and labels stay sharp on a high-density display.
      </p>
      <p>
        If your system asks for reduced motion, the wheel skips the animation and shows the final
        angle immediately. The result is still recorded in the same way. The wheel also redraws when
        the canvas changes size or when the light and dark theme changes, because the sector colours
        come from the page tokens.
      </p>

      <h2>Accessibility and the text alternative</h2>
      <p>
        The canvas is decorative and is hidden from assistive technology. The entries appear as a
        numbered list under the wheel, so the same information is available without the drawing.
        The spin control is a real button, the result is announced politely rather than
        interruptively, and the history is a plain ordered list. Colour is not the only signal:
        number, label, and order all carry the meaning.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        The editor accepts one entry per line and ignores blank lines. Entries are not deduplicated,
        because two people may share a name. History keeps the 20 most recent results for the
        session. The list is never uploaded, stored, or sent to an API, and a reload starts with a
        fresh page.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
