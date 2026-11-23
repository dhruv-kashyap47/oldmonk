import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/solid/field";
import { Textarea } from "@ui-sdk/solid/textarea";
import { inputBase, monoMeta } from "../ui/styles";

export function ToolTextarea(props: {
  name: string;
  label: string;
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  hint?: JSX.Element;
  error?: string;
  rows?: number;
  readonly?: boolean;
  mono?: boolean;
  describedBy?: string;
}) {
  return (
    <Field name={props.name} invalid={props.error ? true : undefined}>
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel class="text-sm font-medium text-ink">{props.label}</FieldLabel>
        <span class={monoMeta}>{props.value.length.toLocaleString("en")} characters</span>
      </div>
      <Textarea
        value={props.value}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        rows={props.rows ?? 12}
        readonly={props.readonly}
        placeholder={props.placeholder}
        spellcheck={false}
        autocomplete="off"
        aria-describedby={props.describedBy}
        class={`${inputBase} mt-2 resize-y ${props.mono === false ? "" : "font-mono text-[13px] leading-relaxed"}`}
      />
      <Show when={props.hint}>
        <FieldDescription class="mt-2 text-xs leading-relaxed text-muted">
          {props.hint}
        </FieldDescription>
      </Show>
      <Show when={props.error}>
        <FieldError match class="mt-2 text-sm text-danger">
          {props.error}
        </FieldError>
      </Show>
    </Field>
  );
}
