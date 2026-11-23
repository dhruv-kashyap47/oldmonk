import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "jwt-decoder",
  name: "JWT Decoder",
  title: "JWT Decoder: read claims and verify",
  description:
    "Paste a JSON Web Token to read its header, payload, and claims, check the exp and nbf times, and verify an HS256, HS384, or HS512 signature with a secret.",
  summary: "Decode a JWT, inspect its claims and expiry, and check an HMAC signature locally.",
  category: "developer",
  topics: ["jwt", "security"],
  keywords: ["jwt decoder", "decode jwt", "jwt claims", "verify jwt signature", "json web token"],
  related: ["base64", "json-formatter", "timestamp-converter", "regex-tester"],
  specs: [
    { label: "Input", value: "A signed JWT, with or without the Bearer prefix" },
    { label: "Output", value: "Header and payload JSON, plus a claims table" },
    { label: "Time checks", value: "exp and nbf compared with the current clock" },
    { label: "Verification", value: "HMAC HS256, HS384, or HS512 with a secret" },
    { label: "Limits", value: "Textarea-sized input, processed locally" },
    { label: "Privacy", value: "Decoding happens in this tab. Nothing is uploaded." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
