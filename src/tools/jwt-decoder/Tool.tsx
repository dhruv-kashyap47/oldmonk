import { For, Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";
import {
  claimRows,
  claimTiming,
  decodeJwt,
  isHmacAlgorithm,
  verifyHmacSignature,
  type HmacAlgorithm,
  type JwtDecodeResult,
  type JwtError,
  type TimeClaimState,
} from "./logic";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

type Decoded = Extract<JwtDecodeResult, { ok: true }>;
type VerifyMessage = { tone: "ok" | "bad" | "error"; text: string };

function statusClass(state: TimeClaimState): string {
  if (state === "valid") return "border-success/40 bg-success/5 text-success";
  if (state === "invalid") return "border-accent-warm/40 bg-accent-warm/5 text-accent-warm";
  return "border-danger/40 bg-danger/5 text-danger";
}

export default function JwtDecoderTool() {
  const [token, setToken] = createSignal("");
  const [decoded, setDecoded] = createSignal<Decoded | null>(null);
  const [error, setError] = createSignal<JwtError | null>(null);
  const [secret, setSecret] = createSignal("");
  const [algorithm, setAlgorithm] = createSignal<HmacAlgorithm>("HS256");
  const [verifyMessage, setVerifyMessage] = createSignal<VerifyMessage | null>(null);
  const [verifying, setVerifying] = createSignal(false);
  let sentFirstInput = false;

  function onInput(value: string) {
    setToken(value);
    if (decoded() || error()) {
      setDecoded(null);
      setError(null);
      setVerifyMessage(null);
    }
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "jwt-decoder" });
    }
  }

  function run() {
    const result = decodeJwt(token());
    setVerifyMessage(null);
    if (result.ok) {
      setDecoded(result);
      setError(null);
      const alg = result.header.alg;
      if (isHmacAlgorithm(alg)) setAlgorithm(alg);
      track("tool_complete", { slug: "jwt-decoder" });
    } else {
      setDecoded(null);
      setError(result.error);
    }
  }

  async function verify() {
    setVerifying(true);
    setVerifyMessage(null);
    const result = await verifyHmacSignature(token(), secret(), algorithm());
    setVerifying(false);
    if (!result.ok) {
      setVerifyMessage({ tone: "error", text: result.message });
      return;
    }
    setVerifyMessage(
      result.valid
        ? { tone: "ok", text: "Signature matches. The token was signed with this secret." }
        : {
            tone: "bad",
            text: "Signature does not match. The token changed, the secret is different, or the algorithm is wrong.",
          },
    );
  }

  function loadSample() {
    setToken(SAMPLE);
    setDecoded(null);
    setError(null);
    setVerifyMessage(null);
  }

  function clear() {
    setToken("");
    setDecoded(null);
    setError(null);
    setSecret("");
    setVerifyMessage(null);
  }

  const timing = () => {
    const payload = decoded()?.payload;
    return payload ? claimTiming(payload) : { exp: null, nbf: null };
  };

  return (
    <>
      <ToolPanel label="JWT decoder">
        <ToolTextarea
          name="jwt-token"
          label="JSON Web Token"
          value={token()}
          onInput={onInput}
          placeholder="Paste a JWT here, or load the sample"
          rows={8}
          hint="The Bearer prefix is optional. Decoding itself does not check the signature."
        />

        <ToolActions>
          <Button variant="primary" onClick={run} disabled={token().trim().length === 0}>
            Decode token
          </Button>
          <Button variant="quiet" onClick={loadSample}>
            Load sample
          </Button>
          <Button variant="quiet" onClick={clear} disabled={token().length === 0}>
            Clear
          </Button>
          <p role="status" aria-live="polite" class={monoMeta}>
            {decoded() ? "Decoded header and payload." : ""}
          </p>
        </ToolActions>

        <Show when={error()}>
          {(current) => (
            <div class="mt-5">
              <ErrorState title={current().title}>{current().message}</ErrorState>
            </div>
          )}
        </Show>

        <Show when={decoded()}>
          {(current) => (
            <div class="mt-6">
              <div class="grid gap-4 lg:grid-cols-2">
                <ToolTextarea
                  name="jwt-header"
                  label="Header"
                  value={current().headerJson}
                  onInput={() => undefined}
                  readonly
                  rows={10}
                  hint="The algorithm and token type declared by the issuer."
                />
                <ToolTextarea
                  name="jwt-payload"
                  label="Payload"
                  value={current().payloadJson}
                  onInput={() => undefined}
                  readonly
                  rows={10}
                  hint="Claims are readable by anyone who holds the token."
                />
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <CopyButton text={current().payloadJson} label="Copy payload" />
                <CopyButton text={current().headerJson} label="Copy header" />
              </div>

              <Show when={timing().exp || timing().nbf}>
                <div class="mt-6 flex flex-wrap gap-3">
                  <Show when={timing().exp}>
                    {(status) => (
                      <div class={`rounded-control border px-3 py-2 text-sm ${statusClass(status().state)}`}>
                        <span class="font-medium">{status().label}</span>
                        <span class="ml-2 text-muted">{status().detail}</span>
                      </div>
                    )}
                  </Show>
                  <Show when={timing().nbf}>
                    {(status) => (
                      <div class={`rounded-control border px-3 py-2 text-sm ${statusClass(status().state)}`}>
                        <span class="font-medium">{status().label}</span>
                        <span class="ml-2 text-muted">{status().detail}</span>
                      </div>
                    )}
                  </Show>
                </div>
              </Show>

              <section aria-labelledby="jwt-claims" class="mt-8">
                <h2 id="jwt-claims" class="font-serif text-xl font-semibold text-ink">
                  Claims
                </h2>
                <Show
                  when={claimRows(current().payload).length > 0}
                  fallback={<p class="mt-2 text-sm text-muted">The payload has no claims.</p>}
                >
                  <table class="mt-3 w-full border-collapse text-left text-sm">
                    <thead>
                      <tr class="border-b border-line">
                        <th scope="col" class="py-2 pr-4 font-medium text-muted">
                          Claim
                        </th>
                        <th scope="col" class="py-2 font-medium text-muted">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={claimRows(current().payload)}>
                        {(row) => (
                          <tr class="border-b border-line align-top">
                            <th scope="row" class="w-44 py-2 pr-4 font-mono text-xs font-normal text-muted">
                              {row.name}
                              <span class="block text-[11px] text-muted/80">{row.label}</span>
                            </th>
                            <td class="break-all py-2 font-mono text-[13px] text-ink">{row.value}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </Show>
              </section>

              <section aria-labelledby="jwt-signature" class="mt-8 border-t border-line pt-6">
                <h2 id="jwt-signature" class="font-serif text-xl font-semibold text-ink">
                  Signature
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-muted">
                  <span class="font-medium text-ink">Signature not verified.</span> Decoding shows
                  what the token says, which anyone can read. Type the shared secret to recompute
                  an HMAC signature and compare it with the token.
                </p>
                <div class="mt-4 flex flex-wrap items-end gap-4">
                  <div class="min-w-56 flex-1">
                    <label for="jwt-secret" class="block text-xs text-muted">
                      Secret
                    </label>
                    <input
                      id="jwt-secret"
                      type="password"
                      autocomplete="off"
                      value={secret()}
                      onInput={(event) => {
                        setSecret(event.currentTarget.value);
                        setVerifyMessage(null);
                      }}
                      class={`${inputBase} mt-1`}
                      placeholder="HMAC shared secret"
                    />
                  </div>
                  <div>
                    <label for="jwt-algorithm" class="block text-xs text-muted">
                      Algorithm
                    </label>
                    <select
                      id="jwt-algorithm"
                      value={algorithm()}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        if (isHmacAlgorithm(value)) {
                          setAlgorithm(value);
                          setVerifyMessage(null);
                        }
                      }}
                      class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
                    >
                      <option value="HS256">HS256</option>
                      <option value="HS384">HS384</option>
                      <option value="HS512">HS512</option>
                    </select>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void verify()}
                    disabled={secret().length === 0 || verifying()}
                  >
                    {verifying() ? "Checking" : "Verify signature"}
                  </Button>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  class={`mt-3 text-sm ${
                    verifyMessage()?.tone === "ok"
                      ? "text-success"
                      : verifyMessage()?.tone === "bad" || verifyMessage()?.tone === "error"
                        ? "text-danger"
                        : "text-muted"
                  }`}
                >
                  {verifyMessage()?.text ?? ""}
                </p>
              </section>
            </div>
          )}
        </Show>

        <Show when={!decoded() && !error() && token().length === 0}>
          <div class="mt-5">
            <EmptyState title="Nothing to decode yet">
              Paste a token to see its header, payload, and claims. Decoding never sends the token
              anywhere.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
