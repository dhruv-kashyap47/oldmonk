export type AdPlacement =
  | "tool-below"
  | "tool-content"
  | "category-below"
  | "home-below";

const client = import.meta.env.VITE_ADSENSE_CLIENT ?? "";

export const adsConfig = {
  enabled: client.length > 0,
  client,
  slots: {
    "tool-below": import.meta.env.VITE_ADSENSE_SLOT_TOOL_BELOW ?? "",
    "tool-content": import.meta.env.VITE_ADSENSE_SLOT_TOOL_CONTENT ?? "",
    "category-below": import.meta.env.VITE_ADSENSE_SLOT_CATEGORY_BELOW ?? "",
    "home-below": import.meta.env.VITE_ADSENSE_SLOT_HOME_BELOW ?? "",
  },
} as const;

export function placementSlot(placement: AdPlacement): string {
  return adsConfig.slots[placement];
}
