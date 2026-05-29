/** GAS and ICUK REST paths: `/rest/sm/{variant}/v1` (SMRest on rest-war). */
export type FormVariant = 'gas' | 'icuk';

export const getFormVariant = (): FormVariant => {
  const raw = import.meta.env.VITE_FORM_VARIANT;
  if (raw === 'icuk' || raw === 'gas') {
    return raw;
  }
  if (raw !== undefined && raw !== '') {
    console.warn(`[eira-form] Invalid VITE_FORM_VARIANT="${raw}", defaulting to "gas".`);
  }
  return 'gas';
};

export const isGas = (): boolean => getFormVariant() === 'gas';
export const isIcuk = (): boolean => getFormVariant() === 'icuk';
