import { describe, expect, it } from "vitest";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  claimRows,
  claimTiming,
  decodeJwt,
  isHmacAlgorithm,
  splitJwt,
  verifyHmacSignature,
} from "./logic";

const encoder = new TextEncoder();

function segment(value: unknown): string {
  return bytesToBase64Url(encoder.encode(JSON.stringify(value)));
}

function token(header: unknown, payload: unknown, signature = ""): string {
  return `${segment(header)}.${segment(payload)}.${signature}`;
}

const KNOWN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function decode(tokenText: string) {
  const result = decodeJwt(tokenText);
  if (!result.ok) throw new Error(`Expected a decode, got ${result.error.title}`);
  return result;
}

describe("base64url", () => {
  it("round-trips text with the url alphabet", () => {
    const bytes = encoder.encode("hello? ~ ünïcode 😀");
    const encoded = bytesToBase64Url(bytes);
    expect(encoded).not.toMatch(/[+/=]/);
    const decoded = base64UrlToBytes(encoded);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(new TextDecoder().decode(decoded.bytes)).toBe("hello? ~ ünïcode 😀");
  });

  it("accepts padding", () => {
    const encoded = bytesToBase64Url(encoder.encode("hello"));
    expect(encoded.length % 4).toBe(3);
    const padded = `${encoded}=`;
    const decoded = base64UrlToBytes(padded);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(new TextDecoder().decode(decoded.bytes)).toBe("hello");
  });

  it("rejects characters outside the alphabet", () => {
    const result = base64UrlToBytes("ab$c");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("not a base64url character");
  });

  it("rejects impossible lengths", () => {
    expect(base64UrlToBytes("abcde").ok).toBe(false);
  });

  it("rejects padding that does not match the length", () => {
    expect(base64UrlToBytes("QQ=").ok).toBe(false);
    expect(base64UrlToBytes("QUJD=").ok).toBe(false);
    expect(base64UrlToBytes("QQ==").ok).toBe(true);
  });
});

describe("splitJwt", () => {
  it("splits three segments and accepts a bearer prefix", () => {
    const result = splitJwt(`Bearer ${KNOWN_TOKEN}`);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.parts.header).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(result.parts.signature.length).toBeGreaterThan(0);
  });

  it("reports a token with the wrong number of parts", () => {
    const result = splitJwt("abc.def");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.title).toBe("A JWT has three parts");
    expect(result.error.message).toContain("2 parts");
  });

  it("reports an empty token", () => {
    expect(splitJwt("   ").ok).toBe(false);
  });

  it("reports an empty header", () => {
    const result = splitJwt(".e30.");
    expect(result.ok).toBe(false);
  });
});

describe("decodeJwt", () => {
  it("decodes the header and payload of a valid token", () => {
    const result = decode(KNOWN_TOKEN);
    expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payload.sub).toBe("1234567890");
    expect(result.payload.name).toBe("John Doe");
    expect(result.headerJson).toContain('"alg": "HS256"');
    expect(result.payloadJson).toContain('"name": "John Doe"');
  });

  it("decodes unicode claims without mangling them", () => {
    const result = decode(token({ alg: "none" }, { name: "Jöhn 😀", city: "Zürich" }));
    expect(result.payload.name).toBe("Jöhn 😀");
    expect(result.payload.city).toBe("Zürich");
  });

  it("rejects a segment that is not base64url", () => {
    const result = decodeJwt("###.e30.");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.title).toBe("Invalid header encoding");
  });

  it("rejects a base64url segment that is not JSON", () => {
    const result = decodeJwt(`${bytesToBase64Url(encoder.encode("not json"))}.e30.`);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.title).toBe("Header is not JSON");
  });

  it("rejects a JSON array payload", () => {
    const result = decodeJwt(token({ alg: "none" }, ["not", "an", "object"]));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.title).toBe("Payload is not an object");
  });

  it("rejects invalid UTF-8 bytes", () => {
    const invalid = bytesToBase64Url(new Uint8Array([0xff, 0xfe, 0xfd]));
    const result = decodeJwt(`${invalid}.e30.`);
    expect(result.ok).toBe(false);
  });
});

describe("claims", () => {
  it("lists registered claims first and labels known names", () => {
    const payload = { custom: 7, sub: "user-1", exp: 1_700_000_000, iss: "oldmonk" };
    const rows = claimRows(payload);
    expect(rows.map((row) => row.name)).toEqual(["iss", "sub", "exp", "custom"]);
    expect(rows[0]?.label).toBe("Issuer");
    expect(rows[2]?.value).toContain("2023-11-14T22:13:20.000Z");
  });

  it("formats audience arrays and null values", () => {
    const rows = claimRows({ aud: ["a", "b"], empty: null });
    expect(rows[0]?.value).toBe('["a","b"]');
    expect(rows[1]?.value).toBe("null");
  });
});

describe("claimTiming", () => {
  it("marks a token expired at or after exp", () => {
    expect(claimTiming({ exp: 1000 }, 1000).exp?.state).toBe("expired");
    expect(claimTiming({ exp: 1000 }, 999).exp?.state).toBe("valid");
  });

  it("marks a token not yet valid before nbf", () => {
    expect(claimTiming({ nbf: 1000 }, 999).nbf?.state).toBe("not-yet-valid");
    expect(claimTiming({ nbf: 1000 }, 1000).nbf?.state).toBe("valid");
  });

  it("reports non-numeric time claims", () => {
    expect(claimTiming({ exp: "soon" }, 0).exp?.state).toBe("invalid");
    expect(claimTiming({ nbf: null }, 0).nbf?.state).toBe("invalid");
  });

  it("reports a time claim outside the date range", () => {
    expect(claimTiming({ exp: 1e20 }, 0).exp?.state).toBe("invalid");
  });

  it("returns null when the claims are absent", () => {
    expect(claimTiming({ sub: "x" }, 0)).toEqual({ exp: null, nbf: null });
  });
});

describe("HMAC verification", () => {
  it("isHmacAlgorithm accepts only the three HS names", () => {
    expect(isHmacAlgorithm("HS256")).toBe(true);
    expect(isHmacAlgorithm("RS256")).toBe(false);
    expect(isHmacAlgorithm(undefined)).toBe(false);
  });

  it("matches the published HS256 example", async () => {
    const result = await verifyHmacSignature(KNOWN_TOKEN, "your-256-bit-secret", "HS256");
    expect(result).toEqual({ ok: true, valid: true });
  });

  it("rejects a wrong secret", async () => {
    const result = await verifyHmacSignature(KNOWN_TOKEN, "wrong-secret", "HS256");
    expect(result).toEqual({ ok: true, valid: false });
  });

  it("refuses an algorithm that does not match the header", async () => {
    const result = await verifyHmacSignature(KNOWN_TOKEN, "your-256-bit-secret", "HS512");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("HS256");
  });

  it("explains that a non-HMAC token cannot be checked here", async () => {
    const rsaToken = token({ alg: "RS256", typ: "JWT" }, { sub: "123" });
    const result = await verifyHmacSignature(rsaToken, "secret", "HS256");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("RS256");
    expect(result.message).toContain("HMAC");
  });

  it("reports a missing secret", async () => {
    const result = await verifyHmacSignature(KNOWN_TOKEN, "", "HS256");
    expect(result.ok).toBe(false);
  });

  it("reports a malformed signature", async () => {
    const broken = `${KNOWN_TOKEN.slice(0, -1)}$`;
    const result = await verifyHmacSignature(broken, "your-256-bit-secret", "HS256");
    expect(result.ok).toBe(false);
  });
});
