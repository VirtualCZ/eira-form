import { filterVisibleFields } from '@/lib/formDataUtils';
import { imagesToKeys, keysToImages, cleanupOldImages, isImageStorageKey } from '@/lib/imageStorage';
import { trimStringValuesDeep } from '@/lib/trimFormValues';
import type { FormData } from '@/schemas/formSchema';

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
  'employmentConfirmation',
  'criminalRecordExtract',
  'laborOfficeEvidenceConfirmation',
  'studyConfirmation',
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
  'wageDeductionDate',
  'spouseDateOfBirth',
];

export const getStorageKey = (code: string) => `${STORAGE_PREFIX}${code}`;

// Format date as YYYY-MM-DD (date only, no time)
export const formatDateWithoutTimezone = (date: Date): string => {
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
    } else if (result[key] instanceof Date) {
      result[key] = DATE_FIELDS.includes(key)
        ? result[key].toISOString()
        : result[key];
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
    } else if (result[key] instanceof Date) {
      result[key] = DATE_FIELDS.includes(key)
        ? formatDateWithoutTimezone(result[key])
        : result[key];
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = serializeDatesForSubmission(result[key]);
    } else if (key === 'bankCode' && result[key] === '0') {
      result[key] = null;
    } else if (key === 'healthInsurance' && (result[key] === '0' || result[key] === 0)) {
      result[key] = null;
    }
  }
  return result;
};

/** Form JSON export: keep all fields, dates as local YYYY-MM-DD (not UTC ISO). */
export const serializeDatesForFormJson = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => serializeDatesForFormJson(item));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => serializeDatesForFormJson(item));
    } else if (result[key] instanceof Date) {
      result[key] = DATE_FIELDS.includes(key)
        ? formatDateWithoutTimezone(result[key])
        : result[key];
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = serializeDatesForFormJson(result[key]);
    }
  }
  return result;
};

/** Exact JSON body sent to createHrRequest (visible fields, YYYY-MM-DD dates, trimmed). */
export const buildSubmitPayload = (
  data: Partial<FormData>,
  orgUnitName?: string,
): Record<string, unknown> => {
  const visibleData = filterVisibleFields(data);
  const payload = trimStringValuesDeep(
    serializeDatesForSubmission(visibleData),
  ) as Record<string, unknown>;
  if (orgUnitName != null && String(orgUnitName).trim()) {
    payload.orgUnitName = String(orgUnitName).trim();
  }
  return payload;
};

// Restore images (keys -> base64) recursively
export const restoreImagesFromKeys = async (obj: any): Promise<any> => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map(item => restoreImagesFromKeys(item)));

  const result: any = { ...obj };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    if (Array.isArray(result[key])) {
      if (
        IMAGE_FIELDS.includes(key) &&
        result[key].length > 0 &&
        typeof result[key][0] === 'string' &&
        isImageStorageKey(result[key][0])
      ) {
        result[key] = await keysToImages(result[key]);
      } else {
        result[key] = await Promise.all(result[key].map((item: any) => restoreImagesFromKeys(item)));
      }
    } else if (result[key] instanceof Date) {
      // Date is typeof 'object' — spreading it would yield {} and wipe the value
      continue;
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

/** ISO / YYYY-MM-DD / Date → valid Date for form fields, or undefined. */
export const coerceFormDate = (value: unknown): Date | undefined => {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === 'object') return undefined;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day &&
      !Number.isNaN(d.getTime())
    ) {
      return d;
    }
    return undefined;
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const coerceAllFormDates = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...obj };
  for (const key of DATE_FIELDS) {
    if (!(key in result)) continue;
    const d = coerceFormDate(result[key]);
    if (d) result[key] = d;
    else delete result[key];
  }
  return result;
};

/** Restore images first (while dates are still strings), then parse dates. */
export const parseStoredFormData = async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const restored = await restoreImagesFromKeys(data);
  return coerceAllFormDates(trimStringValuesDeep(restored) as Record<string, unknown>);
};

// Revive date strings in nested structures (e.g. API responses)
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
      if (DATE_FIELDS.includes(key) && !(value instanceof Date) && Object.keys(value).length === 0) {
        delete result[key];
        continue;
      }
      result[key] = reviveDates(value);
      continue;
    }
    if (DATE_FIELDS.includes(key)) {
      const d = coerceFormDate(value);
      if (d) result[key] = d;
    }
  }
  return result;
};

/** Form JSON file → in-memory form state (Date objects, base64 images). */
export const importJsonToFormState = async (
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const { givenCode: _importedCode, _timestamp, orgUnitName: _orgUnitName, ...rest } = data;
  return parseStoredFormData(trimStringValuesDeep(rest) as Record<string, unknown>);
};

