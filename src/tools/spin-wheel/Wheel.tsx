import { createEffect, onSettled } from "solid-js";

const PALETTE_TOKENS = [
  "--color-cat-random",
  "--color-accent",
  "--color-accent-warm",
  "--color-cat-dev",
  "--color-cat-text",
  "--color-cat-timer",
] as const;

function truncateLabel(label: string, limit = 18): string {
  return label.length > limit ? `${label.slice(0, limit - 1)}…` : label;
}

export function Wheel(props: { entries: readonly string[]; rotation: number }) {
  let canvas: HTMLCanvasElement | undefined;

  function draw(
    entries: readonly string[] = props.entries,
    rotation: number = props.rotation,
  ) {
    const element = canvas;
    if (!element || typeof window === "undefined") return;

    const cssWidth = element.clientWidth > 0 ? element.clientWidth : 320;
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const pixelWidth = Math.round(cssWidth * ratio);
    if (element.width !== pixelWidth || element.height !== pixelWidth) {
      element.width = pixelWidth;
      element.height = pixelWidth;
    }

    const context = element.getContext("2d");
    if (!context) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssWidth);

    const center = cssWidth / 2;
    const radius = center - 7;
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string) => styles.getPropertyValue(name).trim();
    const palette = PALETTE_TOKENS.map(read).filter((color) => color.length > 0);
    const paper = read("--color-paper");
    const surface = read("--color-surface");
    const surfaceTwo = read("--color-surface-2");
    const line = read("--color-line");
    const muted = read("--color-muted");
    const accentWarm = read("--color-accent-warm");

    const list = entries;

    if (list.length === 0) {
      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.fillStyle = surfaceTwo;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = line;
      context.stroke();

      context.fillStyle = muted;
      context.font = "500 14px ui-sans-serif, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Add entries to spin", center, center);
      return;
    }

    const sector = (Math.PI * 2) / list.length;
    const offset = (rotation * Math.PI) / 180;
    const colors = palette.length > 0 ? palette : [surfaceTwo];
    const showLabels = list.length <= 24;
    const fontSize = Math.max(9, Math.min(14, 150 / Math.max(1, list.length)));

    for (let index = 0; index < list.length; index += 1) {
      const start = index * sector + offset - Math.PI / 2;
      const end = start + sector;
      context.beginPath();
      context.moveTo(center, center);
      context.arc(center, center, radius, start, end);
      context.closePath();
      context.fillStyle = colors[index % colors.length] ?? surfaceTwo;
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = surface;
      context.stroke();
    }

    if (showLabels) {
      context.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      context.fillStyle = paper;
      context.textAlign = "right";
      context.textBaseline = "middle";
      for (let index = 0; index < list.length; index += 1) {
        const middle = index * sector + offset - Math.PI / 2 + sector / 2;
        context.save();
        context.translate(center, center);
        context.rotate(middle);
        context.fillText(truncateLabel(list[index] ?? ""), radius - 12, 0);
        context.restore();
      }
    }

    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.lineWidth = 2;
    context.strokeStyle = line;
    context.stroke();

    context.beginPath();
    context.arc(center, center, Math.max(14, cssWidth * 0.075), 0, Math.PI * 2);
    context.fillStyle = surface;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = line;
    context.stroke();

    const pointerHalf = Math.max(7, cssWidth * 0.026);
    context.beginPath();
    context.moveTo(center - pointerHalf, 3);
    context.lineTo(center + pointerHalf, 3);
    context.lineTo(center, 3 + pointerHalf * 2.1);
    context.closePath();
    context.fillStyle = accentWarm;
    context.fill();
    context.lineWidth = 1.5;
    context.strokeStyle = surface;
    context.stroke();
  }

  createEffect(
    () => [props.entries, props.rotation] as const,
    ([entries, rotation]) => draw(entries, rotation),
  );

  onSettled(() => {
    draw();
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(() => draw()) : null;
    if (resizeObserver && canvas) resizeObserver.observe(canvas);

    const themeObserver =
      typeof MutationObserver === "function" ? new MutationObserver(() => draw()) : null;
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      resizeObserver?.disconnect();
      themeObserver?.disconnect();
    };
  });

  return (
    <canvas
      ref={(element: HTMLCanvasElement) => {
        canvas = element;
      }}
      width={360}
      height={360}
      aria-hidden="true"
      class="block h-auto w-full max-w-[360px]"
    />
  );
}
