/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORM_VARIANT?: string
  readonly VITE_HR_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
