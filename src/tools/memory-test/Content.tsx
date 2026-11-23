import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "How does the sequence grow?",
    answer:
      "Level one shows a single tile. When you repeat it correctly, the next level adds one new tile to the end of the same sequence, so every level asks you to replay everything so far plus one step. The run ends on the first wrong tile, and the score is the number of levels you cleared.",
  },
  {
    question: "Why does playback get faster?",
    answer:
      "The first levels flash each tile for 460 milliseconds, with a 450 millisecond gap between tiles. Each level shortens the flash by 20 milliseconds until it reaches 260 milliseconds, then stays there. The gap stays at 450 milliseconds on every level. Faster playback makes the later levels harder without changing the sequence rules.",
  },
  {
    question: "Can two tiles in a row be the same?",
    answer:
      "No. The next tile is drawn from the eight tiles other than the previous one, so an immediate repeat cannot occur. That removes a case where two identical flashes would look like one longer flash. The sequence is still random, and all nine tiles can appear across a longer run.",
  },
  {
    question: "What do the keys 1 to 9 do?",
    answer:
      "They map to the tiles in reading order: 1 is the top left, 2 is the top middle, 3 is the top right, and 9 is the bottom right. Clicking or tapping a tile does the same thing. Keys 1 to 4 are the first four tiles, so a keyboard works for the whole grid rather than only part of it.",
  },
  {
    question: "Does a high level mean I have a good memory?",
    answer:
      "It means you repeated this particular sequence well in this particular run. A short grid game cannot measure memory in general, and it is not a clinical or cognitive assessment. Sleep, attention, screen size, and familiarity with the game all affect the result. Use it as a light challenge or a way to compare your own runs.",
  },
];

export default function MemoryTestContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        The Memory Test is a sequence game on a three by three grid. Tiles light up in order, then
        you repeat the order. Each level adds one step and shortens the playback. The run ends on
        the first wrong tile, and the number of cleared levels becomes your score.
      </p>

      <h2>How to play</h2>
      <ol>
        <li>Press <strong>Start</strong>. The first tile flashes.</li>
        <li>
          Watch the whole sequence. The panel says <strong>Your turn</strong> when the playback
          finishes.
        </li>
        <li>
          Click or tap the tiles in the same order, or press number keys 1 to 9 in reading order.
        </li>
        <li>
          Clear the sequence to start the next level, which adds one tile. One wrong tile ends the
          run.
        </li>
      </ol>
      <p>
        The grid shows a number on every tile so the keyboard mapping stays visible. A correct
        tile lights briefly as confirmation. The status line announces the level when playback
        begins and the final score when the run ends, without reading every flash aloud.
      </p>

      <h2>How the sequence and pacing work</h2>
      <p>
        A new sequence starts with one random tile. The next tile is drawn from the eight tiles
        other than the one before it, which guarantees that the same tile never appears twice in a
        row. When you clear a level, the tool appends one new tile to the existing sequence and
        starts the next level. The full sequence is replayed each time, so level five contains
        five steps and level ten contains ten.
      </p>
      <p>
        Playback timing starts at 460 milliseconds per tile with a 450 millisecond gap. Every
        level shortens the flash by 20 milliseconds until the floor of 260 milliseconds is
        reached. The gap stays constant. If your system asks for reduced motion, the flash and the
        gap are both shortened, which makes the display calmer without changing the sequence or
        the scoring.
      </p>

      <h2>What the score means</h2>
      <p>
        The best score is the number of levels you cleared, stored in this browser. A run that
        fails on level one scores zero. A run that clears level four and fails on level five
        scores four, while the result card also shows that the run reached level five. This keeps
        the score and the level number separate: the level is where you stopped, and the score is
        what you completed.
      </p>
      <p>
        The score is specific to this game. It is not a percentile, a rank, or a comparison with
        other people, and the tool does not collect any data that would support those claims. Two
        runs on different screens can produce different results because tile size, contrast, and
        input method all change the task.
      </p>

      <h2>Limits</h2>
      <p>
        This is a short visual sequence game, not a memory assessment. It cannot separate memory
        from attention, strategy, or familiarity with the grid. A distraction between two tiles,
        a slow display, or a missed flash can end a run that would otherwise have continued.
        Mobile browsers may pause animation in a background tab, so keep the page visible while
        the sequence plays. Reduced motion settings are respected, and the sequence is never
        shortened to compensate.
      </p>

      <h2>Privacy</h2>
      <p>
        The game runs locally in this tab. Nothing is sent anywhere, and no account is required.
        Only the best number of cleared levels is stored, in this browser, and clearing site data
        removes it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
