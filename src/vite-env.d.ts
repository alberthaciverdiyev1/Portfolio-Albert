/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ayrı alan adındaki API kökü (ör. https://api.example.com). Boşsa göreli /api kullanılır. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
