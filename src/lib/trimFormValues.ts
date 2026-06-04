/** Plain form object/array container — not Date, File, etc. */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

/**
 * Recursively trims string values only (text inputs, table cells, etc.).
 * Dates, numbers, booleans, files, and other non-strings are left unchanged.
 */
export const trimStringValuesDeep = <T>(value: T): T => {
  if (value == null || typeof value !== 'object') {
    if (typeof value === 'string') {
      return value.trim() as T;
    }
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => trimStringValuesDeep(item)) as T;
  }

  if (isPlainObject(value)) {
    const trimmed: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      trimmed[key] = trimStringValuesDeep(entry);
    }
    return trimmed as T;
  }

  return value;
};

/** Trim a single text input on blur. */
export const trimTextInputValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;
