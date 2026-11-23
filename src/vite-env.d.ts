/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT_TOOL_BELOW?: string;
  readonly VITE_ADSENSE_SLOT_TOOL_CONTENT?: string;
  readonly VITE_ADSENSE_SLOT_CATEGORY_BELOW?: string;
  readonly VITE_ADSENSE_SLOT_HOME_BELOW?: string;
  readonly VITE_GSC_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
