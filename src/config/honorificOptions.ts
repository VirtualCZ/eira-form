/** Stored value sent to API; labelKey = UI translation. */
const HONORIFIC_OPTIONS_BASE = [
  { value: 'mr', labelKey: 'form.options.honorific.mr' },
  { value: 'mrs', labelKey: 'form.options.honorific.mrs' },
  { value: 'ms', labelKey: 'form.options.honorific.ms' },
] as const;

const HONORIFIC_OPTION_MISS = {
  value: 'miss',
  labelKey: 'form.options.honorific.miss',
} as const;

export const HONORIFIC_VALUES = ['mr', 'mrs', 'ms', 'miss'] as const;

/** English UI includes Miss; Czech uses Pan / Paní / Slečna only. */
export function getHonorificOptions(language: string) {
  const isEnglish = language.startsWith('en');
  return isEnglish
    ? [...HONORIFIC_OPTIONS_BASE, HONORIFIC_OPTION_MISS]
    : [...HONORIFIC_OPTIONS_BASE];
}
