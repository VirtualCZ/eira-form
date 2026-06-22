/** GAS form values (mapped to SUBJ_CVAL5_LKP labels in SmSubjectServiceBean). */
export const GAS_HIGHEST_EDUCATION_OPTIONS = [
  { value: 'basicEducation', labelKey: 'form.options.highestEducation.basicEducation' },
  { value: 'vocationalWithoutMatura', labelKey: 'form.options.highestEducation.vocationalWithoutMatura' },
  { value: 'secondaryOrVocationalWithMatura', labelKey: 'form.options.highestEducation.secondaryOrVocationalWithMatura' },
  { value: 'higherVocational', labelKey: 'form.options.highestEducation.higherVocational' },
  { value: 'bachelor', labelKey: 'form.options.highestEducation.bachelor' },
  { value: 'universityOrHigher', labelKey: 'form.options.highestEducation.universityOrHigher' },
  { value: 'mbaOrPostgraduate', labelKey: 'form.options.highestEducation.mbaOrPostgraduate' },
] as const;

export const GAS_HIGHEST_EDUCATION_VALUES = GAS_HIGHEST_EDUCATION_OPTIONS.map((o) => o.value);

/** ICUK: value = SUBJ_CVAL5_LKP string sent to EIRA; labelKey = UI translation. */
export const ICUK_HIGHEST_EDUCATION_OPTIONS = [
  { value: 'A Bez vzdělání', labelKey: 'form.options.highestEducationIcuk.A' },
  { value: 'B Neúplné základní vzdělání', labelKey: 'form.options.highestEducationIcuk.B' },
  { value: 'C Základní vzdělání', labelKey: 'form.options.highestEducationIcuk.C' },
  { value: 'D Nižší střední vzdělání', labelKey: 'form.options.highestEducationIcuk.D' },
  { value: 'E Nižší střední odborné vzdělání', labelKey: 'form.options.highestEducationIcuk.E' },
  { value: 'H Střední odborné vzdělání s výučním listem', labelKey: 'form.options.highestEducationIcuk.H' },
  { value: 'J Střední nebo střední odborné vzdělání bez maturity i výučního listu', labelKey: 'form.options.highestEducationIcuk.J' },
  { value: 'K Úplné střední všeobecné vzdělání', labelKey: 'form.options.highestEducationIcuk.K' },
  { value: 'L Úplné střední odborné vzdělání s vyučením i maturitou', labelKey: 'form.options.highestEducationIcuk.L' },
  { value: 'M Úplné střední odborné vzdělání s maturitou (bez vyučení)', labelKey: 'form.options.highestEducationIcuk.M' },
  { value: 'N Vyšší odborné vzdělání', labelKey: 'form.options.highestEducationIcuk.N' },
  { value: 'P Vyšší odborné vzdělání v konzervatoři', labelKey: 'form.options.highestEducationIcuk.P' },
  { value: 'R Vysokoškolské bakalářské vzdělání', labelKey: 'form.options.highestEducationIcuk.R' },
  { value: 'T Vysokoškolské magisterské vzdělání', labelKey: 'form.options.highestEducationIcuk.T' },
  { value: 'V Vysokoškolské doktorské vzdělání', labelKey: 'form.options.highestEducationIcuk.V' },
] as const;

export const ICUK_HIGHEST_EDUCATION_VALUES = ICUK_HIGHEST_EDUCATION_OPTIONS.map((o) => o.value);
