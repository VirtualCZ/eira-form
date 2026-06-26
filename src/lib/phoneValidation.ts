/** Minimum count of digits (country code + subscriber number) for mobile/phone. */
export const PHONE_MIN_DIGIT_COUNT = 7;

export function isValidInternationalPhone(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed.startsWith('+')) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= PHONE_MIN_DIGIT_COUNT;
}
