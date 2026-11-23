import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Can I get the same numbers again?",
    answer:
      "Not by design. The generator uses the browser's cryptographic source, which has no visible seed and no save state. If you need a repeatable sequence for a simulation or a test, generate the numbers once and keep the output.",
  },
  {
    question: "Why does unique mode reject my range?",
    answer:
      "A unique draw has to find a new value on every attempt. If the range holds fewer possible values than the count you asked for, the request cannot be completed. The message names the number of values that fit so you can widen the range or lower the count.",
  },
  {
    question: "How are decimal values generated?",
    answer:
      "The minimum and maximum are scaled by a power of ten, then an integer is drawn between the scaled bounds and divided back. With two decimal places, the integer range runs from 100 times the minimum to 100 times the maximum, rounded inward when needed, so every step of 0.01 is one integer.",
  },
  {
    question: "Are the ends of the range included?",
    answer:
      "Yes. A draw from 1 to 6 can return 1 or 6. The lower and upper bounds are rounded inward when the chosen precision cannot represent them exactly, so a decimal draw never lands outside the values you entered.",
  },
  {
    question: "Is there a limit on the range or the count?",
    answer:
      "The count runs from 1 to 1,000 values per batch, and the precision runs from 0 to 6 decimal places. The scaled range must fit in one 32-bit crypto draw. A wider range is rejected with a message instead of being silently compressed.",
  },
];

export default function RandomNumberGeneratorContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Random Number Generator draws integers or decimals between a minimum and a maximum. It can
        return one value, a batch of up to 1,000, or a batch where every value is distinct.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Enter a minimum and a maximum. Both ends of the range are allowed.</li>
        <li>Choose how many numbers you need, from 1 to 1,000.</li>
        <li>
          Leave the precision at zero for integers, or choose one to six decimal places for a
          decimal draw.
        </li>
        <li>
          Turn on <strong>Unique values only</strong> when the same value must not appear twice in
          the batch.
        </li>
        <li>
          Press <strong>Generate numbers</strong>. Copy the list, or keep it in the history while
          you try another range.
        </li>
      </ol>

      <h2>How the randomness works</h2>
      <p>
        Each value starts as an integer from <code>secureRandomRange</code>, a helper in this project
        that reads 32 bits from <code>crypto.getRandomValues</code>. Turning a 32-bit value into a
        number in a smaller range with a simple modulo can favour some results, because the 32-bit
        space rarely divides evenly by the range size. The helper uses rejection sampling instead:
        it throws away values above the largest multiple of the range and draws again.
      </p>
      <p>
        The browser's cryptographic generator is the same source used for keys and tokens. It is not
        seeded with a number you can set, so this page cannot replay a previous run. That is honest
        about what browsers provide. It also means the tool is not a replacement for a statistical
        library when you need seeded, reproducible simulations.
      </p>

      <h2>Decimals without floating point drift</h2>
      <p>
        A decimal range is handled in scaled integers. With three decimal places, the tool
        multiplies both bounds by 1,000, draws a whole number in that space, and divides by 1,000
        for display. This avoids the situation where a stored decimal is a tiny fraction above the
        maximum you asked for. The lower bound is rounded up and the upper bound is rounded down
        when the chosen precision cannot represent them exactly, so the output stays inside the
        range you entered.
      </p>

      <h2>Unique values</h2>
      <p>
        Unique mode keeps a set of values already drawn and rejects a repeat until the batch is
        full. The count is capped at 1,000, which keeps this approach quick even when the range is
        only slightly larger than the count. If the range cannot supply enough distinct values, the
        tool stops before drawing and tells you how many fit. Nothing is silently dropped or
        padded.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        The scaled range must fit within one 32-bit draw, which covers roughly 4.29 billion integer
        steps. A very wide range with six decimal places can exceed that, and the tool asks you to
        narrow it or lower the precision rather than return an approximation. The generator runs on
        the main thread. Your range and results stay in this tab for the current page only.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
