import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Why are 11 and 12 digit numbers rejected?",
    answer:
      "Ten digits are enough for Unix seconds until the year 2286, while current millisecond values need 13 digits. An 11 or 12 digit number could be either a far future date in seconds or a date near 1970 in milliseconds. The converter asks you to choose the unit instead of guessing and showing the wrong year.",
  },
  {
    question: "Is the timestamp in my database in seconds or milliseconds?",
    answer:
      "Look at the digit count. A current value near 1,763,000,000 is seconds, and 1,763,000,000,000 is milliseconds. Some systems store microseconds, which add three more digits. This converter handles seconds and milliseconds, so divide or multiply first when the source uses another unit.",
  },
  {
    question: "Why does the same timestamp show a different hour in another zone?",
    answer:
      "A Unix timestamp counts from one fixed moment, 1 January 1970 at 00:00 UTC. A time zone changes how that moment is written, not the moment itself. The converter keeps the timestamp fixed and rewrites the clock time for each zone, including daylight saving rules from the browser's time zone data.",
  },
  {
    question: "Does daylight saving time affect the conversion?",
    answer:
      "It affects the display, not the timestamp. New York is five hours behind UTC in January and four hours behind in July, and the zone formatter applies the rule for the date you are converting. A stored timestamp never repeats or skips an hour during a daylight saving change.",
  },
  {
    question: "What is the difference between ISO 8601 and a Unix timestamp?",
    answer:
      "A Unix timestamp is a count of seconds or milliseconds since the epoch, and it carries no zone because it is a single instant. ISO 8601 is a written date and time, optionally with an offset or a Z suffix for UTC. The converter reads both and shows the result in both forms.",
  },
  {
    question: "What changes when I pick seconds or milliseconds myself?",
    answer:
      "Automatic detection uses the digit count to choose a unit. A manual choice tells the converter how to read the number, which is the way to convert an 11 or 12 digit value that auto refuses.",
  },
  {
    question: "Why is the ISO output in UTC when I picked another zone?",
    answer:
      "The ISO field always ends in Z, which means UTC, so the string reads the same on every device. Changing the display zone updates the zone card, not the ISO row.",
  },
  {
    question: "What does Outside the date range mean?",
    answer:
      "The number is beyond the largest date JavaScript can represent, about 8.64e15 milliseconds either side of the epoch. Nothing is rounded, so try a smaller value or check the unit.",
  },
  {
    question: "Is the last timestamp still there after a reload?",
    answer:
      "No. The field and the result are cleared when the page loads again. The Use now button reads the clock fresh each time it is pressed.",
  },
  {
    question: "How precise is the relative phrase?",
    answer:
      "It rounds to one unit, from seconds up to years, and it is calculated once when you press Convert. It does not count up while the page stays open.",
  },
];

export default function TimestampConverterContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A Unix timestamp is a number of seconds or milliseconds since 1 January 1970 at 00:00 UTC.
        This converter turns that number into a readable date, reads an ISO 8601 date back into a
        timestamp, and shows the same moment in the zone you pick.
      </p>

      <h2>Convert a value in four steps</h2>
      <ol>
        <li>Paste a Unix timestamp or an ISO 8601 date in the input field.</li>
        <li>
          Leave the unit on <strong>Detect automatically</strong>, or choose seconds or
          milliseconds when the length is not enough to decide.
        </li>
        <li>Pick a display zone, or keep the local time of this device.</li>
        <li>Press <strong>Convert</strong>. Each value has its own copy button.</li>
      </ol>
      <p>
        The <strong>Use now</strong> button fills the field with the current Unix seconds and
        converts it in one step, which is useful when you need a quick reference point.
      </p>

      <h2>Seconds and milliseconds</h2>
      <p>
        Unix time originally counted whole seconds. As systems needed more precision, milliseconds
        became common in JavaScript and in many APIs. A current second value has 10 digits, and a
        current millisecond value has 13. The converter uses that length to choose a unit
        automatically, and it refuses 11 or 12 digits because either reading is plausible.
      </p>
      <p>
        Fractions are accepted. A value such as <code>1763000000.5</code> means half a second after
        the whole second, and the converter keeps the fraction in the milliseconds output. Negative
        values count backwards from the epoch, which is how dates before 1970 are represented.
      </p>

      <h2>ISO 8601 input</h2>
      <p>
        ISO 8601 writes a date as year, month, and day, followed by a time and a zone designator.
        <code>2026-11-23T12:00:00Z</code> is noon UTC, and{" "}
        <code>2026-11-23T12:00:00+05:30</code> is noon in a zone five and a half hours ahead of UTC,
        which is 06:30 UTC. A date without a time, such as <code>2026-11-23</code>, is read as
        midnight UTC.
      </p>
      <p>
        Not every date string is ISO 8601. The converter relies on the browser date parser, which
        also accepts some local formats, so a result can depend on the device locale. When the
        source is an API, prefer the full form with an explicit offset to avoid ambiguity.
      </p>

      <h2>Zones and daylight saving</h2>
      <p>
        The output shows UTC, the local time of this device, and a zone you select from a list of
        common zones. Zone names come from the IANA database, and the browser applies the offset
        that was in force on the converted date. A January date in New York is five hours behind
        UTC, while a July date is four hours behind.
      </p>
      <p>
        The selected zone is a display choice. Changing it does not change the timestamp or the ISO
        output, and it does not need another conversion.
      </p>

      <h2>Date range and local conversion</h2>
      <p>
        JavaScript dates cover roughly 273,000 years on either side of the epoch. A number outside
        that range cannot be represented and is reported instead of being silently rounded.
        Conversion runs in this tab with the browser's <code>Intl</code> data. Nothing is uploaded,
        and no timestamp is stored between visits.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
