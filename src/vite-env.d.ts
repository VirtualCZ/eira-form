/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORM_VARIANT?: string
  readonly VITE_HR_API_BASE?: string
  readonly VITE_GAS_NAME?: string
  readonly VITE_GAS_PASS?: string
  readonly VITE_ICUK_NAME?: string
  readonly VITE_ICUK_PASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
