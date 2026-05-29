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

/** Default data-controller name in GDPR text when API does not provide orgUnitName (ICUK build). */
export const ICUK_DATA_CONTROLLER_NAME = 'Inovační centrum Ústeckého kraje';
