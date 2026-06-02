/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WIDGET_BACKEND_URL?: string;
  readonly VITE_WIDGET_API_KEY?: string;
  /** Optional endpoint that completed Q&A pairs are logged to (test phase). */
  readonly VITE_CONVO_LOG_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
