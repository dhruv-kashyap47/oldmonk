import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does decoding a JWT verify it?",
    answer:
      "No. Decoding only turns the base64url segments back into readable JSON. A signature check is a separate step and needs the key that signed the token. The decoder marks this clearly and offers an HMAC check only when you supply the shared secret.",
  },
  {
    question: "Which signature algorithms can it check?",
    answer:
      "HS256, HS384, and HS512, which use a shared secret. RS256, ES256, and other public key algorithms need a key pair, so they are shown in the header but cannot be verified here. Use your identity provider or a library with the public key for those tokens.",
  },
  {
    question: "Why is my token already expired?",
    answer:
      "The exp claim is a Unix timestamp in seconds, and the decoder compares it with your computer clock. A token that expired a minute ago is rejected by most servers even though the text still decodes. Check the clock on the machine that created the token as well.",
  },
  {
    question: "Is it safe to paste a production token?",
    answer:
      "Treat a token like a password. The payload is readable by anyone who holds it, and a session token can be replayed until it expires. Use a test token when you can. The page does not upload anything, but the token still passes through your clipboard and this tab.",
  },
  {
    question: "What does the nbf claim mean?",
    answer:
      "nbf means not before. The token is not valid until that Unix timestamp, which helps when a token is issued slightly ahead of the clock on the server that will check it. The decoder shows both the raw seconds and the UTC time so a clock skew is easy to spot.",
  },
];

export default function JwtDecoderContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A JSON Web Token carries identity claims in three base64url segments. This page turns
        those segments back into readable JSON, lists every claim, checks the expiry window, and
        can compare an HMAC signature with the secret you provide.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Paste a token in the input field. A leading <code>Bearer</code> word is removed for you.</li>
        <li>
          Press <strong>Decode token</strong> to read the header and payload and to see the claims
          table.
        </li>
        <li>
          Look at the expiry badges. A red badge means the token is past its <code>exp</code> time
          or has not reached its <code>nbf</code> time yet.
        </li>
        <li>
          If you know the HMAC secret, type it in the signature section, pick the algorithm, and
          press <strong>Verify signature</strong>.
        </li>
      </ol>

      <h2>The three parts</h2>
      <p>
        A JWT has a header, a payload, and a signature, separated by two dots. Each segment is
        base64url text, a variant of base64 that uses <code>-</code> and <code>_</code> instead of
        <code>+</code> and <code>/</code> and usually drops the padding. The decoder accepts
        padding when it is present and rejects characters that do not belong to the alphabet, so a
        token copied with a line break or a stray symbol fails with a clear message.
      </p>
      <p>
        The header names the signing algorithm and the token type. The payload is a JSON object of
        claims: who issued the token, who it is for, when it was issued, and when it expires. The
        signature is computed over the first two segments. Base64url is an encoding, not
        encryption, so the header and payload are readable by anyone who has the token.
      </p>

      <h2>Reading the claims</h2>
      <p>
        Registered claims appear first in the table, with their common names. <code>iss</code> is
        the issuer, <code>sub</code> is the subject, and <code>aud</code> is the audience.
        <code>exp</code>, <code>nbf</code>, and <code>iat</code> are Unix timestamps in seconds,
        and the table shows both the raw value and the UTC date. Custom claims keep their original
        names and are printed as JSON when they hold an object or an array.
      </p>
      <p>
        The expiry check follows the usual rule: a token is valid before <code>exp</code> and at or
        after <code>nbf</code>. The comparison uses your computer clock, which is why a large clock
        difference can make a fresh token look expired. Both badges are informational. A server
        still makes the final decision, and it may also check the issuer, the audience, and a
        revocation list.
      </p>

      <h2>Signature verification</h2>
      <p>
        For HS256, HS384, and HS512 the same secret signs and verifies the token. The browser
        recomputes the HMAC with WebCrypto and compares the bytes in constant time. A match means
        the header and payload have not changed since signing with that secret. It does not prove
        that the issuer is trustworthy or that the claims are allowed.
      </p>
      <p>
        Public key algorithms such as RS256 and ES256 are common in hosted identity systems. They
        cannot be checked with a shared secret, so this page reports the declared algorithm and
        leaves verification to a tool that has the public key. A token with <code>alg</code> set to
        <code>none</code> has no signature to check, and servers should reject it.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        The token is processed in this tab and is not stored in local storage. Nothing is uploaded
        or sent to an API. That protects the token from this site, not from your device, your
        clipboard history, or a browser extension with broad permissions. Clear the field when you
        are done, especially if the token came from a live session.
      </p>
      <p>
        Decoding is intentionally lenient about the header and payload contents and strict about
        their structure. Each segment must be base64url, must decode as UTF-8, and must parse as a
        JSON object. A token that fails one of those checks gets a message naming the segment, so
        you can tell a truncation from a changed signature.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
