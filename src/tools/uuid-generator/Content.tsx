import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Where does the randomness come from?",
    answer:
      "The generator calls crypto.getRandomValues, the browser interface to a cryptographically secure random source. It never uses Math.random. That matters because predictable identifiers can collide or be guessed, and a UUID often ends up in a database key, a log line, or a URL.",
  },
  {
    question: "Should I choose version 4 or version 7?",
    answer:
      "Version 4 is the safe default when you only need a unique value. Version 7 is useful for database keys because its first 48 bits hold a Unix millisecond timestamp, so values created at different times sort close to their creation order. Both versions keep enough random bits for practical uniqueness.",
  },
  {
    question: "Is a UUID safe to use as a password or API token?",
    answer:
      "No. A UUID is designed to be unique and easy to exchange, not to be secret. Version 7 even exposes its creation time. Use a dedicated token generator with enough random bytes for anything that grants access, and store only a hash of the token on the server.",
  },
  {
    question: "Can two generated UUIDs collide?",
    answer:
      "A version 4 UUID has 122 random bits, so a collision needs an enormous number of values before it becomes likely. A version 7 UUID has 74 random bits plus the timestamp, which is still ample for normal application volumes. Uniqueness is a probability, not a promise enforced by the format.",
  },
  {
    question: "Why does the hyphen toggle keep the same value?",
    answer:
      "Hyphens are punctuation in the canonical 8-4-4-4-12 form, not part of the value. Turning them off gives the 32 hex digits used by compact storage, and the underlying bytes are unchanged. Databases and APIs differ on which form they accept, so check the target format.",
  },
  {
    question: "Why is 1,000 the maximum batch size?",
    answer:
      "The page stops at 1,000 values per run so the list and the download stay responsive. For a larger set, generate another batch and keep the files separate.",
  },
  {
    question: "Does the list survive a page reload?",
    answer:
      "No. The list is held in the page and is not saved, so a reload clears it. Copy or download a batch you want to keep.",
  },
  {
    question: "Do I get new values when I press Generate again?",
    answer:
      "Yes. Every press makes a fresh batch from the random source, even with the same version, count, and format settings.",
  },
  {
    question: "What does the count error mean?",
    answer:
      "The field accepts a whole number from 1 to 1,000. Zero, a negative number, a decimal, or text fails, and the message repeats the allowed range.",
  },
  {
    question: "How is this different from a random number generator?",
    answer:
      "A random number generator returns numbers in a range you choose. This tool sets the version and variant bits and returns a 128-bit identifier in a fixed hexadecimal layout.",
  },
];

export default function UuidGeneratorContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A UUID is a 128-bit identifier written as 32 hexadecimal digits with four hyphens. This
        generator produces version 4 random values and version 7 time ordered values, in batches
        large enough for fixtures and seed data.
      </p>

      <h2>Generate a batch in four steps</h2>
      <ol>
        <li>Enter a count from 1 to 1,000.</li>
        <li>
          Pick <strong>Version 4</strong> for a random identifier or <strong>Version 7</strong> for
          one that carries a millisecond timestamp.
        </li>
        <li>Choose whether the output uses uppercase letters and hyphens.</li>
        <li>Press <strong>Generate UUIDs</strong>, then copy the list or download it as a text file.</li>
      </ol>
      <p>
        Changing the case or hyphen setting reformats the list you already have. It does not
        generate new values, so you can keep a batch and adjust its presentation.
      </p>

      <h2>When to use version 4</h2>
      <p>
        A version 4 UUID is almost entirely random. Six bits mark the version and the variant, and
        the other 122 bits come from the random source. That leaves enough combinations that a
        collision is not a practical concern for normal application volumes. The value has no
        meaning and no order: two UUIDs generated a second apart are unrelated.
      </p>
      <p>
        Version 4 is the usual choice for a primary key, a request id, or a filename suffix. It
        works well when creation order does not matter and when you do not want the identifier to
        reveal when the record was made.
      </p>

      <h2>When to use version 7</h2>
      <p>
        A version 7 UUID starts with a 48-bit Unix timestamp in milliseconds, followed by a version
        marker, random bits, and a variant marker. Because the timestamp sits at the front, values
        created at different times sort in roughly the order they were made. That property helps
        database indexes, which insert new keys near the end instead of scattering them like
        version 4 values.
      </p>
      <p>
        Values created within the same millisecond share a timestamp, and their order comes from
        the random part. The format does not require the random part to increase, so this page does
        not promise strict monotonic order inside one millisecond. If you need that guarantee, use
        a library that implements the monotonic variant.
      </p>

      <h2>Format and storage</h2>
      <p>
        The canonical form is 36 characters: five groups of 8, 4, 4, 4, and 12 hex digits separated
        by hyphens. The compact form drops the hyphens and keeps 32 hex digits. Both encode the
        same 16 bytes. PostgreSQL has a native UUID type, many APIs accept the canonical string, and
        some systems prefer the compact form for URLs.
      </p>
      <p>
        Store a UUID as the native type when the database has one. A 36-character text column works
        too, but it takes more space and invites inconsistent casing. Whatever you choose, compare
        values in one canonical form so a lowercase and an uppercase copy do not look different.
      </p>

      <h2>Batch size and local generation</h2>
      <p>
        Each run is capped at 1,000 values so the page stays responsive. Generation happens in this
        tab with the browser random source, and the list is not sent anywhere. The values are not
        stored between visits, so download or copy a batch before you reload if you need it later.
      </p>
      <p>
        Treat generated identifiers as public data. A password or session token needs a dedicated
        generator with its own randomness and storage rules, and version 7 deliberately reveals a
        creation time.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
