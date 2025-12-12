import { imagesToKeys, keysToImages, cleanupOldImages } from '@/lib/imageStorage';

export const STORAGE_PREFIX = 'eira-form-data-';
export const LAST_CODE_KEY = 'eira-form-last-code';

// Data expiration: 1 week (7 days)
export const DATA_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

// Image fields stored as arrays of base64 strings (persisted in IndexedDB; keys in localStorage)
export const IMAGE_FIELDS: string[] = [
  'visaPassport',
  'travelDocumentCopy',
  'residencePermitCopy',
  'highestEducationDocument',
  'childBirthCertificate1',
  'childBirthCertificate2',
  'childBirthCertificate3',
  'childBirthCertificate4',
  'childTaxReliefConfirmation',
  'pensionDecision',
  'employmentConfirmation'
];

// Date fields that need serialization
export const DATE_FIELDS: string[] = [
  'dateOfBirth',
  'residencePermitValidityFrom',
  'residencePermitValidityUntil',
  'passportValidityUntil',
  'lastJobPeriodFrom',
  'lastJobPeriodTo',
  'disabilityDecisionDate',
  'pensionDecisionDate',
  'wageDeductionDate'
];

export const getStorageKey = (code: string) => `${STORAGE_PREFIX}${code}`;

// Format date as YYYY-MM-DD (date only, no time)
const formatDateWithoutTimezone = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert Date objects to ISO strings; convert images to keys and store in IndexedDB
export const serializeDatesAndKeys = async (obj: any, code: string): Promise<any> => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map(item => serializeDatesAndKeys(item, code)));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    if (Array.isArray(result[key])) {
      if (IMAGE_FIELDS.includes(key)) {
        result[key] = await imagesToKeys(result[key], code, key);
      } else {
        result[key] = await Promise.all(result[key].map((item: any) => serializeDatesAndKeys(item, code)));
      }
    } else if (DATE_FIELDS.includes(key) && result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = await serializeDatesAndKeys(result[key], code);
    }
  }
  return result;
};

// Serialize dates without timezone for server submission (local time format)
export const serializeDatesForSubmission = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => serializeDatesForSubmission(item));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => serializeDatesForSubmission(item));
    } else if (DATE_FIELDS.includes(key) && result[key] instanceof Date) {
      result[key] = formatDateWithoutTimezone(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = serializeDatesForSubmission(result[key]);
    }
  }
  return result;
};

// Restore images (keys -> base64) recursively
export const restoreImagesFromKeys = async (obj: any): Promise<any> => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map(item => restoreImagesFromKeys(item)));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    if (Array.isArray(result[key])) {
      if (IMAGE_FIELDS.includes(key) && result[key].length > 0 && typeof result[key][0] === 'string') {
        result[key] = await keysToImages(result[key]);
      } else {
        result[key] = await Promise.all(result[key].map((item: any) => restoreImagesFromKeys(item)));
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = await restoreImagesFromKeys(result[key]);
    }
  }
  return result;
};

// Cleanup expired localStorage data and orphaned images
export const cleanupOldData = async (): Promise<void> => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  const validImageKeys = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

    try {
      const dataStr = localStorage.getItem(key);
      if (!dataStr) continue;
      const data = JSON.parse(dataStr);
      if (data._timestamp) {
        const age = now - data._timestamp;
        if (age > DATA_EXPIRATION_MS) {
          keysToDelete.push(key);
        } else {
          IMAGE_FIELDS.forEach(field => {
            if (Array.isArray(data[field])) {
              data[field].forEach((imageKey: string) => {
                if (typeof imageKey === 'string') validImageKeys.add(imageKey);
              });
            }
          });
        }
      } else {
        keysToDelete.push(key);
      }
    } catch {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => localStorage.removeItem(key));
  await cleanupOldImages(validImageKeys);
};

// Revive date strings (YYYY-MM-DD or ISO format) into Date instances for known date fields
export const reviveDates = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => reviveDates(item));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;
    const value = result[key];
    if (Array.isArray(value)) {
      result[key] = value.map((item: any) => reviveDates(item));
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      result[key] = reviveDates(value);
      continue;
    }
    if (typeof value === 'string' && DATE_FIELDS.includes(key)) {
      // Skip empty strings, null, or undefined
      if (!value || value.trim() === '' || value === 'null' || value === 'undefined') {
        continue;
      }
      
      // Handle both YYYY-MM-DD and ISO format strings
      // new Date() can parse YYYY-MM-DD, but we need to ensure it's treated as local time
      let d: Date;
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          // YYYY-MM-DD format - parse as local date (no time component)
          const [year, month, day] = value.split('-').map(Number);
          // Validate date components
          if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            d = new Date(year, month - 1, day);
            // Verify the date is valid (handles cases like Feb 30)
            if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
              if (!isNaN(d.getTime())) {
                result[key] = d;
              }
            }
          }
        } else {
          // ISO format or other - use standard Date parsing
          d = new Date(value);
          if (!isNaN(d.getTime())) {
            result[key] = d;
          }
        }
      } catch (error) {
        // Skip invalid dates - leave them as strings or undefined
        console.warn(`Invalid date value for field ${key}: ${value}`, error);
      }
    }
  }
  return result;
};


