/** Stored value = Czech SUBJ_CVAL11_LKP string sent to EIRA; labelKey = UI translation. */
export const PENSION_TYPE_OPTIONS = [
  { value: '-', labelKey: 'form.options.pensionType.none' },
  { value: 'Starobní důchod', labelKey: 'form.options.pensionType.oldAgePension' },
  { value: 'Předčasný starobní důchod', labelKey: 'form.options.pensionType.earlyOldAgePension' },
  { value: 'Plný invalidní důchod', labelKey: 'form.options.pensionType.fullDisabilityPension' },
  { value: 'Částečný invalidní důchod', labelKey: 'form.options.pensionType.partialDisabilityPension' },
  { value: 'Vdovský důchod', labelKey: 'form.options.pensionType.widowsPension' },
  { value: 'Vdovecký důchod', labelKey: 'form.options.pensionType.widowersPension' },
  { value: 'Sirotčí důchod', labelKey: 'form.options.pensionType.orphansPension' },
] as const;

export const PENSION_TYPE_VALUES = PENSION_TYPE_OPTIONS.map((o) => o.value);

const LEGACY_PENSION_TYPE_TO_CZ: Record<string, string> = {
  oldAgePension: 'Starobní důchod',
  earlyOldAgePension: 'Předčasný starobní důchod',
  fullDisabilityPension: 'Plný invalidní důchod',
  partialDisabilityPension: 'Částečný invalidní důchod',
  widowsPension: 'Vdovský důchod',
  widowersPension: 'Vdovecký důchod',
  orphansPension: 'Sirotčí důchod',
};

/** Map legacy English keys from saved/imported JSON to Czech API values. */
export function normalizePensionType(value: unknown): string | undefined {
  if (typeof value !== 'string' || value === '') return undefined;
  if (value === '-') return value;
  return LEGACY_PENSION_TYPE_TO_CZ[value] ?? value;
}
