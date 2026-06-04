import { getFormVariant } from '@/config/formVariants';

/** Basic auth for HR REST (credentials inlined at build via VITE_* — temporary until one-time codes). */
export const getHrBasicAuthHeader = (): string => {
  const icuk = getFormVariant() === 'icuk';
  const name = icuk
    ? (import.meta.env.VITE_ICUK_NAME ?? import.meta.env.VITE_GAS_NAME)
    : import.meta.env.VITE_GAS_NAME;
  const pass = icuk
    ? (import.meta.env.VITE_ICUK_PASS ?? import.meta.env.VITE_GAS_PASS)
    : import.meta.env.VITE_GAS_PASS;

  if (!name || !pass) {
    console.warn('[eira-form] Missing VITE_GAS_NAME/PASS or VITE_ICUK_NAME/PASS for HR API');
    return '';
  }

  return `Basic ${btoa(`${name}:${pass}`)}`;
};
