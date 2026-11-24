import { Show, createSignal, onCleanup } from "solid-js";
import { track } from "../../analytics";
import { copyText } from "../../lib/clipboard";
import { Button } from "./Button";

export function CopyButton(props: {
  text: string;
  label?: string;
  class?: string;
  slug?: string;
  target?: string;
}) {
  const [state, setState] = createSignal<"idle" | "copied" | "error">("idle");
  const [message, setMessage] = createSignal("");
  let timer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (timer) clearTimeout(timer);
  });

  async function copy() {
    if (timer) clearTimeout(timer);
    const result = await copyText(props.text);
    if (result.ok) {
      setState("copied");
      setMessage("Copied to clipboard.");
      if (props.slug) {
        track("copy_result", { slug: props.slug, target: props.target ?? "output" });
      }
      timer = setTimeout(() => setState("idle"), 2000);
    } else {
      setState("error");
      setMessage(result.message);
    }
  }

  return (
    <span class={`inline-flex flex-wrap items-center gap-2 ${props.class ?? ""}`}>
      <Button
        variant="secondary"
        class={state() === "copied" ? "copy-pop" : undefined}
        onClick={() => void copy()}
        disabled={props.text.length === 0}
      >
        {state() === "copied" ? "Copied" : (props.label ?? "Copy")}
      </Button>
      <span role="status" aria-live="polite" class="text-xs text-muted">
        <Show when={state() !== "idle"}>{message()}</Show>
      </span>
    </span>
  );
}
