/**
 * Czech SSN (Rodné číslo) validation utility
 * Based on official Czech SSN validation rules
 */

export interface CzechSSNValidationResult {
  isValid: boolean;
  error?: string;
  parsedData?: {
    year: number;
    month: number;
    day: number;
    gender: 'male' | 'female';
    fullYear: number;
  };
}

/**
 * Validates Czech SSN format and content
 * @param value - SSN string in format YYMMDD/XXXX or YYMMDD/XXX
 * @param t - Translation function
 * @returns Validation result
 */
export function validateCzechSSN(value: string, t: (key: string) => string): CzechSSNValidationResult {
  // Basic format validation
  if (!/^\d{6}\/\d{3,4}$/.test(value)) {
    return {
      isValid: false,
      error: t('form.validation.format.birthNumberFormatFail')
    };
  }

  const [front, back] = value.split('/');
  if (!front || !back) {
    return {
      isValid: false,
      error: t('form.validation.format.birthNumberFormatFail')
    };
  }

  // Parse date parts (format is YYMMDD)
  const year = parseInt(front.substring(0, 2), 10);
  let month = parseInt(front.substring(2, 4), 10);
  const day = parseInt(front.substring(4, 6), 10);

  // Handle year overflow (for people born after 2000)
  let fullYear = year;
  if (year < 54) {
    fullYear = 2000 + year;
  } else {
    fullYear = 1900 + year;
  }

  // Handle gender adjustment in month
  let gender: 'male' | 'female';
  if (month > 70) {
    // Women with +70 adjustment (2004+)
    month = month - 70;
    gender = 'female';
  } else if (month > 50) {
    // Women with +50 adjustment (original)
    month = month - 50;
    gender = 'female';
  } else if (month > 20 && fullYear >= 2004) {
    // Men with +20 adjustment (2004+)
    month = month - 20;
    gender = 'male';
  } else {
    // Men with +0 adjustment (original)
    gender = 'male';
  }

  // Validate date
  const date = new Date(fullYear, month - 1, day);
  if (date.getFullYear() !== fullYear || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return {
      isValid: false,
      error: t('form.validation.format.birthNumberFormatFail')
    };
  }

  // For 4-digit suffix (new format) - validate divisibility
  if (back.length === 4) {
    const first9Digits = front + back.substring(0, 3);
    const remainder = parseInt(first9Digits, 10) % 11;
    const lastDigit = parseInt(back[3], 10);

    // Valid cases:
    // 1. Remainder 0-9: last digit should equal remainder
    // 2. Remainder 10: last digit should be 0 (rule abolished after 1985, but still valid for older numbers)
    if (remainder !== lastDigit && !(remainder === 10 && lastDigit === 0)) {
      return {
        isValid: false,
        error: t('form.validation.format.birthNumberDiversibilityFail')
      };
    }
  }
  // For 3-digit suffix (old format) - no validation needed

  return {
    isValid: true,
    parsedData: {
      year,
      month,
      day,
      gender,
      fullYear
    }
  };
}

/**
 * Helper function to check if a Czech SSN is valid
 * @param value - SSN string
 * @param t - Translation function
 * @returns true if valid, false otherwise
 */
export function isCzechSSNValid(value: string, t: (key: string) => string): boolean {
  return validateCzechSSN(value, t).isValid;
}

