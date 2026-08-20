/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production API origin, e.g. https://api.example.com. Empty in local dev (Vite proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
