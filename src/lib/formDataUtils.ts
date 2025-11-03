// Utilities for checking if a field/value contains meaningful data

const isNonEmptyString = (val: unknown): boolean =>
  typeof val === 'string' && val.trim() !== '' && val.trim() !== 'none';

const isNonNullObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const arrayHasData = (arr: unknown[]): boolean => {
  if (arr.length === 0) return false;
  return arr.some((item) => hasFieldData(item));
};

export const hasFieldData = (val: unknown): boolean => {
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return arrayHasData(val);
  // Date objects are valid data if they're valid Date instances
  if (val instanceof Date) return !isNaN(val.getTime());
  if (isNonNullObject(val)) return Object.values(val).some(hasFieldData);
  if (typeof val === 'string') return isNonEmptyString(val);
  // numbers, booleans are considered data if present
  return true;
};



