// List of all country IDs
export const COUNTRY_IDS: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71
];

// Get country options for select dropdown (with translations)
// Labels come from translation files: form.options.countries.{id}
export const getCountryOptions = (t: (key: string) => string): Array<{ value: string; label: string }> => {
  return COUNTRY_IDS
    .map(id => ({
      id,
      label: t(`form.options.countries.${id}`)
    }))
    .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by translated label
    .map(({ id, label }) => ({
      value: String(id),
      label
    }));
};

// Get country name by ID (from translations)
export const getCountryName = (id: number | string | null | undefined, t: (key: string) => string): string | undefined => {
  if (id === null || id === undefined) return undefined;
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numId) || !COUNTRY_IDS.includes(numId)) return undefined;
  return t(`form.options.countries.${numId}`);
};

