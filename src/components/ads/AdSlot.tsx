import { adsConfig } from "../../monetization/config";
import type { AdPlacement } from "../../monetization/config";

/**
 * Ads stay off until a publisher ID exists. Without one this renders nothing,
 * so there is no empty box and no layout shift. Live inventory also needs a
 * consent flow and a reviewed privacy policy before this can be enabled.
 */
export function AdSlot(props: { placement: AdPlacement; class?: string }) {
  if (!adsConfig.enabled) return null;

  return (
    <aside
      aria-label="Advertisement"
      class={`flex min-h-[250px] items-center justify-center rounded-panel border border-line bg-surface-2/50 ${props.class ?? ""}`}
      data-ad-placement={props.placement}
    >
      <span class="font-mono text-xs tracking-[0.03em] text-muted">Advertisement</span>
    </aside>
  );
}
