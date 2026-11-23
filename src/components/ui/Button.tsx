import type { JSX } from "@solidjs/web";
import { Button as UiButton } from "@ui-sdk/solid/button";
import { primaryButton, quietButton, secondaryButton } from "./styles";

type Variant = "primary" | "secondary" | "quiet";

export function Button(props: {
  children: JSX.Element;
  class?: string;
  variant?: Variant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  pendingAnnouncement?: string;
  title?: string;
  "aria-label"?: string;
  onClick?: (event: MouseEvent) => void;
}) {
  const variantClass = () =>
    props.variant === "primary"
      ? primaryButton
      : props.variant === "quiet"
        ? quietButton
        : secondaryButton;

  return (
    <UiButton
      type={props.type ?? "button"}
      class={`${variantClass()} ${props.class ?? ""}`}
      disabled={props.disabled}
      pendingAnnouncement={props.pendingAnnouncement}
      title={props.title}
      aria-label={props["aria-label"]}
      onClick={props.onClick}
    >
      {props.children}
    </UiButton>
  );
}
