import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Which dice can I roll?",
    answer:
      "The roller supports d4, d6, d8, d10, d12, d20, and d100. You can roll from 1 to 100 dice of the chosen size and add a modifier between -100 and 100.",
  },
  {
    question: "How does the notation work?",
    answer:
      "The form is a count, the letter d, and the number of sides, with an optional modifier. Examples are 2d6+1, 1d20, and 3d8-2. A bare d20 means one twenty-sided die. Spaces around the parts are allowed.",
  },
  {
    question: "Does the modifier change each die?",
    answer:
      "No. The modifier is added once, after the individual dice are summed. Rolling 2d6+1 produces two values from 1 to 6, then adds 1 to their total. The card shows the sum and the modifier separately so the arithmetic is visible.",
  },
  {
    question: "Does the roller use Math.random?",
    answer:
      "No. Every face comes from crypto.getRandomValues through a helper that uses rejection sampling. The face you see is one plus a uniform integer from zero to sides minus one, with no bias from a plain modulo step.",
  },
  {
    question: "Are the rolls saved anywhere?",
    answer:
      "Only in the page's memory. The history keeps the 20 most recent rolls for the session. Nothing is written to local storage, sent to a server, or attached to analytics, and a reload clears it.",
  },
];

export default function DiceRollerContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Dice Roller handles the standard polyhedral set, from d4 to d100, with a count and a flat
        modifier. You can click the controls or type tabletop notation such as 2d6+1.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Choose a die size. The selected die is highlighted and reads as pressed to a screen reader.</li>
        <li>Set how many dice to roll, from 1 to 100.</li>
        <li>Add a modifier if the roll needs a bonus or penalty. Leave it at zero for a plain roll.</li>
        <li>
          Press <strong>Roll</strong>. Every individual face, the sum, and the final total appear
          below the controls.
        </li>
        <li>
          Or type notation in the second field and press <strong>Roll notation</strong>.
        </li>
      </ol>

      <h2>The notation</h2>
      <p>
        The parser accepts an optional count, the letter d in either case, the number of sides, and
        an optional plus or minus modifier. That covers <code>2d6+1</code>, <code>1d20</code>,{" "}
        <code>3d8-2</code>, and a bare <code>d20</code>. Spaces are allowed between the parts, so{" "}
        <code>2 d 10 + 4</code> reads the same as <code>2d10+4</code>.
      </p>
      <p>
        The parser is deliberately strict about the dice it knows. A d7 or a d13 is rejected rather
        than rounded to a nearby size. A count of zero, a count above 100, or a modifier outside
        plus or minus 100 is also rejected with a specific message. Multiplication, repeated
        modifiers, and keep-highest forms belong to other dice systems and are not accepted here.
      </p>

      <h2>How each face is chosen</h2>
      <p>
        A die result is one plus an integer from zero to sides minus one. The integer comes from{" "}
        <code>crypto.getRandomValues</code>, not from <code>Math.random</code>. The helper rejects a
        slice of the 32-bit space so that the remaining values divide evenly by the number of sides.
        Without that rejection step, a naive modulo would give some faces a slightly higher chance.
      </p>
      <p>
        The rolls are independent. A d20 does not remember its last result, and rolling ten dice is
        ten separate draws. The total is the sum of those draws plus the modifier, applied once.
        This matches the usual tabletop reading of 2d6+1, where the plus one is not added to each
        die.
      </p>

      <h2>Totals, history, and limits</h2>
      <p>
        A roll can include up to 100 dice, which keeps the individual list readable and the draw
        quick. The history keeps the 20 most recent rolls with their notation and total. Copy result
        puts the notation, total, and individual faces on the clipboard as plain text, which is
        useful for a session log or a message to the rest of the table.
      </p>

      <h2>Privacy</h2>
      <p>
        The roller runs entirely in this tab. The notation, the history, and the results are not
        uploaded or stored. When analytics is enabled at build time, the tool sends anonymous
        interaction events that contain the tool slug and, for a roll, the number of dice. It never
        sends the values you rolled.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
