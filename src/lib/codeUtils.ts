export const MIN_CODE_LENGTH = 5;
export const MAX_CODE_LENGTH = 10;

export const isValidCode = (code?: string | null): boolean => {
  if (!code) return false;
  const len = code.length;
  return len >= MIN_CODE_LENGTH && len <= MAX_CODE_LENGTH;
};


