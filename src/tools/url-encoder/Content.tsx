import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "What is the difference between the two scopes?",
    answer:
      "Component mode uses encodeURIComponent, which escapes characters such as &, =, ?, /, and #. Whole URL mode uses encodeURI, which leaves the separators that give a URL its structure.",
  },
  {
    question: "Why did a space become %20 instead of a plus sign?",
    answer:
      "Percent encoding for a URL component uses %20. The plus sign for a space comes from HTML form encoding, which is a different convention. The query table reads a plus as a space, then writes %20 when it rebuilds the URL.",
  },
  {
    question: "Why do some escapes remain after decoding?",
    answer:
      "Whole URL mode uses decodeURI, which leaves escapes for reserved characters in place so the URL structure survives. Choose component mode when you want to decode a single parameter value completely.",
  },
  {
    question: "What causes a malformed percent escape error?",
    answer:
      "A percent sign must be followed by two hexadecimal digits, as in %20 or %C3%A9. A bare percent, a short pair, or a non-hex character fails. To encode a literal percent sign, use %25.",
  },
  {
    question: "Is my text sent anywhere?",
    answer:
      "No. Encoding, decoding, and query parsing happen in this tab. There is no upload and no storage.",
  },
  {
    question: "What happens if I encode text that is already encoded?",
    answer:
      "You get double encoding. A space that was %20 becomes %2520, because the percent sign is escaped too. Decode first when you are not sure whether a string is already encoded.",
  },
  {
    question: "Why does the rebuilt URL differ from the one I pasted?",
    answer:
      "Rebuilding decodes each value and then encodes it again in one standard form, so an escaped letter that did not need escaping can become plain. The values are the same, and the text can look different.",
  },
  {
    question: "How is percent encoding different from Base64?",
    answer:
      "Percent encoding keeps the text readable and escapes only the characters a URL cannot carry. Base64 packs the whole input into a different alphabet, so the output no longer looks like the original.",
  },
  {
    question: "Is the input kept if I reload the page?",
    answer:
      "No. The fields live in the page, not in storage, so a reload clears them. Copy the output before you leave.",
  },
  {
    question: "What happens to the fragment when I remove every parameter?",
    answer:
      "The question mark and the query string are dropped, and the part after # stays in place. A base without parameters is still a valid URL, so the fragment is kept.",
  },
];

export default function UrlEncoderContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        URL Encoder converts text to percent escapes and back. It can treat the input as a
        single component or as a whole URL, and it includes a table for reading and editing
        query parameters.
      </p>

      <h2>Component mode and whole URL mode</h2>
      <p>
        Reserved characters carry structure in a URL. A question mark starts the query, an
        ampersand separates parameters, an equals sign separates a name from a value, and a
        slash separates path segments. A value that contains one of them must be escaped, or a
        parser will read it as structure.
      </p>
      <p>
        <strong>Component</strong> mode escapes all of them, which suits a search term, a file
        name, a redirect target, or any value inside a query. <strong>Whole URL</strong> mode
        leaves the separators readable and escapes spaces and non-ASCII text. Use it for a
        complete URL.
      </p>

      <h2>Encode a value in three steps</h2>
      <ol>
        <li>Choose a scope and a direction.</li>
        <li>Paste the text on the left. The result appears on the right after the button.</li>
        <li>Copy the result, or switch direction to check a round trip.</li>
      </ol>
      <p>
        Decoding reports a malformed percent escape instead of guessing. A percent sign must
        have two hexadecimal digits after it, and the decoded bytes must form valid UTF-8 when
        the escape represents multibyte text.
      </p>

      <h2>Spaces, plus signs, and %20</h2>
      <p>
        RFC 3986 encodes a space as <code>%20</code>. HTML form submission uses a different
        convention, where a plus sign stands for a space in the query string. The main encoder
        writes <code>%20</code>. The query table reads a plus as a space because that is what a
        form would send, and it writes <code>%20</code> when it rebuilds. The value survives
        even though the spelling changes.
      </p>

      <h2>The query table</h2>
      <p>
        Paste a URL and press <strong>Parse URL</strong>. The page separates the base, the
        query string, and the fragment, then decodes each name and value into a row. Edit a
        field and the rebuilt URL updates. Add a parameter to append a row, or remove one to
        drop it. When every row is gone, the question mark is removed as well, and a fragment
        is kept.
      </p>
      <p>
        Rebuilding normalises the encoding. An escaped letter that did not need escaping may
        become plain, and a plus may become <code>%20</code>. The values are unchanged, but the
        text can differ from the original.
      </p>

      <h2>Malformed escapes and broken characters</h2>
      <p>
        Encoding can fail on an unpaired UTF-16 surrogate, which is a broken character rather
        than a normal emoji. Decoding can fail on a bad percent escape or on bytes that are not
        valid UTF-8. The page names the problem and leaves the output empty. There is no server
        round trip, so the practical limit is what a text field can hold.
      </p>

      <h2>Links stay in this tab</h2>
      <p>
        Everything runs locally. URLs often contain search terms, identifiers, and tokens, so
        the page does not send them anywhere, log them, or keep them in storage.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
