import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Is Base64 encryption?",
    answer:
      "No. Base64 is a reversible encoding with no key. Anyone who sees the text can decode it, so it must not be used to protect a password, a token, or a private file.",
  },
  {
    question: "Why does the output end with one or two equals signs?",
    answer:
      "Base64 works in groups of three bytes, which become four characters. When the input length is not a multiple of three, equals signs pad the final group. URL-safe mode removes that padding.",
  },
  {
    question: "What is URL-safe Base64?",
    answer:
      "The standard alphabet uses plus and slash, which have meanings inside a URL. The URL-safe variant uses a hyphen and an underscore instead, and it usually drops the padding. This decoder accepts both variants.",
  },
  {
    question: "Why did decoding fail with a UTF-8 error?",
    answer:
      "The bytes decoded correctly, but they are not text in UTF-8. That happens with images, archives, and other binary files. Text mode is for text; the Base64 itself is still valid.",
  },
  {
    question: "Are my files uploaded?",
    answer:
      "No. A chosen file is read with the browser File API, turned into bytes in this tab, and encoded locally. There is no network request.",
  },
  {
    question: "Does decoding ignore line breaks?",
    answer:
      "Yes. Whitespace anywhere in the input is removed before decoding, so Base64 wrapped across several lines still works.",
  },
  {
    question: "Can I paste a full data URL?",
    answer:
      "No. Paste only the Base64 part after the comma. The colon and semicolon in a data URL are outside the alphabet, so the decoder rejects them.",
  },
  {
    question: "Can I turn Base64 back into a file here?",
    answer:
      "No. File mode only encodes a local file, and decoding produces text in the panel. Use a binary-aware decoder for images, archives, or other files.",
  },
  {
    question: "What happens to a file over 10 MB?",
    answer:
      "The page rejects it before reading and shows a message, so the tab stays responsive. The same 10 MB cap applies to text input.",
  },
  {
    question: "Do the byte counts measure characters or bytes?",
    answer:
      "They measure bytes. Text is converted to UTF-8 first, so an emoji counts as four bytes even though it looks like one character.",
  },
];

export default function Base64Content() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Base64 turns bytes into a short alphabet of letters, digits, plus, and slash. This page
        encodes UTF-8 text or a local file, and decodes Base64 back to text, with a URL-safe
        option for tokens and query values.
      </p>

      <h2>Encode or decode text in four steps</h2>
      <ol>
        <li>Choose <strong>Text</strong> as the mode and pick a direction.</li>
        <li>
          Paste text to encode, or paste Base64 to decode. Empty input is reported before any
          work starts.
        </li>
        <li>
          Turn on <strong>URL-safe output</strong> if the result will sit in a URL, a filename,
          or a JWT segment. Decoding does not need the switch, because both alphabets are
          accepted.
        </li>
        <li>Copy the result or download it as a text file.</li>
      </ol>
      <p>
        Text is converted to UTF-8 before encoding, so an emoji that occupies four bytes
        produces four bytes of Base64 input, not one character. The decoded side uses a strict
        UTF-8 decoder. If the bytes are not valid text, the page says so instead of showing
        replacement characters.
      </p>

      <h2>Encoding a local file</h2>
      <p>
        Choose a file and press <strong>Encode file</strong>. The browser reads the file with
        the File API and hands the bytes to the encoder. The bytes stay in this tab, and the
        page only shows the Base64 text. Files up to 10 MB are accepted. A larger file is
        rejected before it is read, which keeps the tab responsive.
      </p>
      <p>
        File mode only encodes. To recover a binary file from Base64 text, use a binary-aware
        decoder.
      </p>

      <h2>Why the output is about a third larger</h2>
      <p>
        Base64 uses 64 symbols, which fit in six bits. Three input bytes hold 24 bits, and
        those become four output characters. The encoded text is therefore about one third
        larger than the raw bytes, plus a little padding. That overhead is the price of
        keeping the data inside a text channel.
      </p>

      <h2>Choosing the URL-safe alphabet</h2>
      <p>
        The standard alphabet uses <code>+</code> and <code>/</code>. Both characters have
        jobs in URLs, where a plus can mean a space and a slash separates path segments. The
        URL-safe variant swaps them for <code>-</code> and <code>_</code>, and it can drop the
        trailing equals signs without losing information. This decoder normalises both forms
        before reading, so a token copied from a URL decodes without manual replacement.
      </p>

      <h2>Why decoding can fail</h2>
      <p>
        Base64 text can fail for a few reasons. A character outside the alphabet is rejected
        with its position named. Padding in the middle, more than two equals signs, or a length
        that cannot come from whole bytes also fails. Whitespace is ignored, so line-wrapped
        output from another tool still decodes.
      </p>

      <h2>The 10 MB cap and local files</h2>
      <p>
        The cap is 10 MB for text input and for a chosen file. Encoding and decoding run on the
        main thread, so work near the cap can take a moment. No request is made, and no file or
        text is stored after the tab closes.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
