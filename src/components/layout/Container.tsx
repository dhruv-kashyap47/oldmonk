import type { JSX } from "@solidjs/web";

const widths = {
  default: "max-w-[1180px]",
  tool: "max-w-[880px]",
  wide: "max-w-[1200px]",
  prose: "max-w-[66ch]",
} as const;

export function Container(props: {
  children: JSX.Element;
  class?: string;
  width?: keyof typeof widths;
}) {
  return (
    <div class={`mx-auto w-full px-5 sm:px-6 ${widths[props.width ?? "default"]} ${props.class ?? ""}`}>
      {props.children}
    </div>
  );
}
