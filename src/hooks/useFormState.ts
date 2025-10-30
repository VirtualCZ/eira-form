import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { FormData, getFormSchema } from '@/schemas/formSchema';
import { imagesToKeys, keysToImages, cleanupOldImages } from '@/lib/imageStorage';

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
  progress: number;
}

export interface FormActions {
  save: () => Promise<void>;
  reset: () => Promise<void>;
  clear: () => void;
  exportData: () => void;
  importData: (data: any) => void;
  loadDataForCode: (code: string) => Promise<void>;
  saveDataForCode: (code: string) => Promise<void>;
}

const STORAGE_PREFIX = 'eira-form-data-';
const LAST_CODE_KEY = 'eira-form-last-code';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds
// Data expiration: 1 week (7 days) for production
const DATA_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week (7 days)

// Image fields that should be excluded from localStorage to avoid overflow
const IMAGE_FIELDS = [
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

// Helper function to get storage key for a code
const getStorageKey = (code: string) => {
  return `${STORAGE_PREFIX}${code}`;
};

// Date fields that need serialization
const DATE_FIELDS = [
  'dateOfBirth',
  'residencePermitValidityFrom',
  'residencePermitValidityUntil',
  'lastJobPeriodFrom',
  'lastJobPeriodTo',
  'disabilityDecisionDate',
  'pensionDecisionDate',
  'wageDeductionDate'
];

// Helper function to serialize dates and convert images to keys for localStorage
// Keys stored in localStorage, actual image data stored in IndexedDB
const serializeDatesAndKeys = async (obj: any, code: string): Promise<any> => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => serializeDatesAndKeys(item, code)));
  }
  
  const result = { ...obj };
  
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;
    
    if (Array.isArray(result[key])) {
      // Convert image arrays to keys (stored in localStorage), store actual data in IndexedDB
      if (IMAGE_FIELDS.includes(key)) {
        result[key] = await imagesToKeys(result[key], code, key);
      } else {
        result[key] = await Promise.all(result[key].map((item: any) => serializeDatesAndKeys(item, code)));
      }
    } else if (DATE_FIELDS.includes(key) && result[key] instanceof Date) {
      // Convert Date objects to ISO strings for JSON storage
      result[key] = result[key].toISOString();
    } else if (typeof result[key] === 'object' && result[key] !== null && !(result[key] instanceof Date)) {
      result[key] = await serializeDatesAndKeys(result[key], code);
    }
  }
  
  return result;
};

// Helper function to restore images from keys when loading from storage
// Keys are used to retrieve actual image data from IndexedDB
const restoreImagesFromKeys = async (obj: any): Promise<any> => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => restoreImagesFromKeys(item)));
  }
  
  const result = { ...obj };
  
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;
    
    if (Array.isArray(result[key])) {
      // Check if this is a key array (strings that match the key format: contains underscores)
      // Old format might have "image://" prefix, new format is just "code_field_index_timestamp"
      if (IMAGE_FIELDS.includes(key) && result[key].length > 0 && typeof result[key][0] === 'string') {
        // Retrieve actual image data from IndexedDB using keys
        console.log(`🔍 Restoring images for field ${key} with ${result[key].length} keys:`, result[key].slice(0, 2));
        result[key] = await keysToImages(result[key]);
        console.log(`✅ Restored ${result[key].length} images for field ${key}`);
      } else {
        result[key] = await Promise.all(result[key].map((item: any) => restoreImagesFromKeys(item)));
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = await restoreImagesFromKeys(result[key]);
    }
  }
  
  return result;
};

// Note: excludeImageFields removed - we now store image paths in localStorage

// Helper function to clean up old data on page load
const cleanupOldData = async () => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  const validImageKeys = new Set<string>();
  
  // Iterate through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          const data = JSON.parse(dataStr);
          // Check if data has a timestamp
          if (data._timestamp) {
            const age = now - data._timestamp;
            if (age > DATA_EXPIRATION_MS) {
              keysToDelete.push(key);
            } else {
              // Collect valid image keys from non-expired data
              IMAGE_FIELDS.forEach(field => {
                if (Array.isArray(data[field])) {
                  data[field].forEach((imageKey: string) => {
                    if (typeof imageKey === 'string') {
                      // Handle both old format (image://...) and new format (code_field_index_timestamp)
                      validImageKeys.add(imageKey);
                    }
                  });
                }
              });
            }
          } else {
            // Old format data without timestamp - delete it
            keysToDelete.push(key);
          }
        }
      } catch (error) {
        // Invalid JSON - delete it
        keysToDelete.push(key);
      }
    }
  }
  
  // Delete old data
  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Cleaned up old data: ${key}`);
  });
  
  // Clean up old images from IndexedDB
  await cleanupOldImages(validImageKeys);
  
  if (keysToDelete.length > 0) {
    console.log(`✅ Cleaned up ${keysToDelete.length} old data entries`);
  }
};

export const useFormState = () => {
  const { t } = useTranslation();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [clearKey, setClearKey] = useState(0); // Key to force re-render on clear
  const skipAutoSaveRef = useRef(false);

  const formSchema = useMemo(() => getFormSchema(t), [t]);
  
  const dateFields = useMemo(() => [
    'dateOfBirth',
    'residencePermitValidityFrom',
    'residencePermitValidityUntil',
    'lastJobPeriodFrom',
    'lastJobPeriodTo',
    'disabilityDecisionDate',
    'pensionDecisionDate',
    'wageDeductionDate'
  ], []);

  const reviveDates = useCallback((obj: any, dateKeys: string[]): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Handle arrays - process each item recursively
    if (Array.isArray(obj)) {
      return obj.map(item => reviveDates(item, dateKeys));
    }
    
    const result = { ...obj };
    const arrayFields = [
      'languageSkills',
      'childrenInfo',
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
    
    for (const key in result) {
      if (!Object.prototype.hasOwnProperty.call(result, key)) continue;
      
      // Convert empty objects to arrays for array fields
      if (arrayFields.includes(key) && result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = [];
      }
      // Handle arrays - recursively process array items
      else if (Array.isArray(result[key])) {
        result[key] = result[key].map((item: any) => reviveDates(item, dateKeys));
      }
      // Convert date strings to Date objects
      else if (dateKeys.includes(key) && typeof result[key] === 'string') {
        const d = new Date(result[key]);
        if (!isNaN(d.getTime())) {
          result[key] = d;
        }
      } 
      // Recursively process nested objects
      else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = reviveDates(result[key], dateKeys);
      }
    }
    return result;
  }, []);

  const getStoredData = useCallback(async (code?: string) => {
    try {
      // Check URL first for code (on page load/refresh)
      let codeToUse = code;
      if (!codeToUse) {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        if (codeFromUrl && codeFromUrl.length >= 5 && codeFromUrl.length <= 10) {
          codeToUse = codeFromUrl;
        } else {
          codeToUse = currentCode || localStorage.getItem(LAST_CODE_KEY) || '';
        }
      }
      
      if (!codeToUse || codeToUse.length < 5 || codeToUse.length > 10) {
        return {};
      }
      const storageKey = getStorageKey(codeToUse);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Remove timestamp before returning data
        const { _timestamp, ...data } = parsed;
        // Restore images from IndexedDB using keys and revive dates
        const restored = await restoreImagesFromKeys(data);
        return reviveDates(restored, dateFields);
      }
      return {};
    } catch (error) {
      console.error('Error loading stored data:', error);
      return {};
    }
  }, [reviveDates, dateFields, currentCode]);

  // Clean up old data on mount
  useEffect(() => {
    cleanupOldData().catch(err => console.error('Error cleaning up old data:', err));
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    // Initialize with empty defaults - loadDataForCode will populate if needed
    defaultValues: {},
  });

  const { watch, formState, reset } = form;

  // Watch all form values so progress recalculates on any change
  const watchedValues = watch();

  // Calculate form progress
  const progress = useMemo(() => {
    const formData = watchedValues;
    // Exclude givenCode and _timestamp from progress calculation
    const excludedFields = ['givenCode', '_timestamp'];
    const fieldsToCount = Object.entries(formData).filter(([key]) => 
      !excludedFields.includes(key)
    );
    
    const totalFields = fieldsToCount.length;
    if (totalFields === 0) return 0;
    
    // Use the same hasFieldData logic as auto-save for consistency
    const hasFieldData = (val: any): boolean => {
      if (val === undefined || val === null) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
      if (Array.isArray(val)) {
        // For arrays, check if any item has data
        if (val.length === 0) return false;
        // For arrays of objects (like languageSkills, childrenInfo from FormTable)
        // FormTable creates objects with properties that might include "none" values
        return val.some(item => {
          if (typeof item === 'object' && item !== null) {
            // Check if object has any non-empty properties
            // Ignore "none" values for select fields
            return Object.values(item).some(propVal => {
              if (propVal === undefined || propVal === null) return false;
              if (typeof propVal === 'string') {
                const trimmed = propVal.trim();
                if (trimmed === '' || trimmed === 'none') return false;
              }
              return true;
            });
          }
          // For primitive arrays, check if any item is truthy/non-empty
          if (typeof item === 'string' && item.trim() === '') return false;
          return item !== undefined && item !== null;
        });
      }
      if (typeof val === 'object' && val !== null) {
        // For objects, check if any property has data
        return Object.values(val).some(hasFieldData);
      }
      return true;
    };
    
    const filledFields = fieldsToCount.filter(([, value]) => hasFieldData(value)).length;
    
    const percentage = Math.round((filledFields / totalFields) * 100);
    // Cap at 100% to prevent showing 150%
    return Math.min(100, percentage);
  }, [watchedValues]);

  // Auto-save functionality (only saves non-image fields)
  useEffect(() => {
    const subscription = watch(() => {
      // Skip auto-save if flag is set (during code changes)
      if (skipAutoSaveRef.current) {
        return;
      }
      
      // Use getValues() instead of watch() value to ensure we get ALL current form values
      // This matches exportData behavior and ensures no fields are missed
      const allFormData = form.getValues();
      const code = allFormData.givenCode;
      
      if (code && code.length >= 5 && code.length <= 10) {
        // Check if form has actual data (not just givenCode)
        // Count non-empty fields (excluding givenCode and image fields)
        const hasFieldData = (val: any): boolean => {
          if (val === undefined || val === null) return false;
          if (typeof val === 'string' && val.trim() === '') return false;
          if (Array.isArray(val)) {
            // For arrays, check if any item has data
            if (val.length === 0) return false;
            // For arrays of objects (like languageSkills, childrenInfo from FormTable)
            // FormTable creates objects with properties that might include "none" values
            return val.some(item => {
              if (typeof item === 'object' && item !== null) {
                // Check if object has any non-empty properties
                // Ignore "none" values for select fields
                return Object.values(item).some(propVal => {
                  if (propVal === undefined || propVal === null) return false;
                  if (typeof propVal === 'string') {
                    const trimmed = propVal.trim();
                    if (trimmed === '' || trimmed === 'none') return false;
                  }
                  return true;
                });
              }
              // For primitive arrays, check if any item is truthy/non-empty
              if (typeof item === 'string' && item.trim() === '') return false;
              return item !== undefined && item !== null;
            });
          }
          if (typeof val === 'object' && val !== null) {
            // For objects, check if any property has data
            return Object.values(val).some(hasFieldData);
          }
          return true;
        };
        
        const fieldsWithData = Object.keys(allFormData).filter(key => {
          if (key === 'givenCode') return false;
          // Include image fields in the check - they should trigger saving too
          const fieldValue = allFormData[key as keyof typeof allFormData];
          const hasData = hasFieldData(fieldValue);
          
          // Debug logging for image fields and other specific fields
          if (IMAGE_FIELDS.includes(key) || ['languageSkills', 'childrenInfo', 'contactStreet', 'contactHouseNumber', 
               'contactCity', 'contactPostalCode', 'lastEmployer', 'lastJobType',
               'lastJobPeriodFrom', 'lastJobPeriodTo', 'bannedActivity', 
               'wageDeductionDetails', 'wageDeductionDate'].includes(key)) {
            if (Array.isArray(fieldValue)) {
              if (IMAGE_FIELDS.includes(key)) {
                console.log(`📸 Image field check ${key}: array[${fieldValue.length}], hasData=${hasData}`, fieldValue.length > 0 ? fieldValue.slice(0, 1) : 'empty');
              } else {
                console.log(`🔍 Field check ${key}: array[${fieldValue.length}], hasData=${hasData}`, fieldValue.length > 0 ? fieldValue[0] : 'empty');
              }
            } else {
              console.log(`🔍 Field check ${key}: "${fieldValue}", hasData=${hasData}`);
            }
          }
          
          return hasData;
        });
        
        console.log(`🔍 Total fields with data: ${fieldsWithData.length}`, fieldsWithData.slice(0, 5));
        
        // Only auto-save if there's actual form data (not just the code)
        // Use getValues() to ensure we save ALL form values, just like exportData does
        if (fieldsWithData.length > 0) {
          setCurrentCode(code);
          setHasUnsavedChanges(true);
          
          // Use getValues() to get ALL current form values (same as exportData)
          // Convert images to keys for localStorage, store actual data in IndexedDB
          serializeDatesAndKeys(allFormData, code).then(serializedData => {
            // Add timestamp to track when data was saved
            const dataWithTimestamp = {
              ...serializedData,
              _timestamp: Date.now()
            };
            try {
              const storageKey = getStorageKey(code);
              // Save keys (strings) to localStorage - actual image data in IndexedDB
              const dataToSave = JSON.stringify(dataWithTimestamp);
              localStorage.setItem(storageKey, dataToSave);
              localStorage.setItem(LAST_CODE_KEY, code);
              console.log(`💾 Saved data with image keys (images stored in IndexedDB) for code: ${code}`);
            } catch (error) {
              console.error('Error saving to localStorage:', error);
            }
            // Debug: Log what's being saved for key array and other fields
            const debugFields = ['languageSkills', 'childrenInfo', 'contactStreet', 'contactHouseNumber', 
                                'contactCity', 'contactPostalCode', 'lastEmployer', 'lastJobType',
                                'lastJobPeriodFrom', 'lastJobPeriodTo', 'bannedActivity', 
                                'wageDeductionDetails', 'wageDeductionDate'];
            debugFields.forEach(field => {
              if (dataWithTimestamp[field]) {
                const fieldValue = dataWithTimestamp[field];
                if (Array.isArray(fieldValue)) {
                  console.log(`💾 Saving ${field}:`, fieldValue.length, 'items', fieldValue.slice(0, 2));
                } else {
                  console.log(`💾 Saving ${field}:`, fieldValue);
                }
              }
            });
            console.log(`💾 Total fields saved: ${Object.keys(dataWithTimestamp).length}`);
          }).catch(error => {
            console.error('Error serializing data for storage:', error);
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Auto-save timer
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setInterval(() => {
      if (hasUnsavedChanges) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [hasUnsavedChanges]);

  const save = useCallback(async () => {
    const data = form.getValues();
    const code = data.givenCode;
    if (code && code.length >= 5 && code.length <= 10) {
      // Convert images to keys for localStorage, store actual data in IndexedDB
      const serializedData = await serializeDatesAndKeys(data, code);
      const dataWithTimestamp = {
        ...serializedData,
        _timestamp: Date.now()
      };
      try {
        const storageKey = getStorageKey(code);
        localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log(`💾 Saved data with image paths (images stored in IndexedDB) for code: ${code}`);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [form]);

  const resetForm = useCallback(async () => {
    const data = await getStoredData();
    reset(data);
    setHasUnsavedChanges(false);
  }, [reset, getStoredData]);

  const clearForm = useCallback(() => {
    // Preserve the current code
    const code = form.getValues().givenCode;
    
    // Remove data from localStorage for this code
    if (code && code.length >= 5 && code.length <= 10) {
      const storageKey = getStorageKey(code);
      localStorage.removeItem(storageKey);
    }
    
    // Temporarily disable auto-save during clear
    skipAutoSaveRef.current = true;
    
    // Get all current form values to know what fields exist
    const currentFormData = form.getValues();
    const allFieldNames = Object.keys(currentFormData);
    
    // Build empty state object (all fields empty strings/empty arrays, but keep code)
    const emptyFormState: any = {};
    if (code && code.length >= 5 && code.length <= 10) {
      emptyFormState.givenCode = code; // Preserve the code
    }
    
    allFieldNames.forEach(fieldName => {
      if (fieldName !== 'givenCode') {
        const currentValue = currentFormData[fieldName as keyof typeof currentFormData];
        if (Array.isArray(currentValue)) {
          emptyFormState[fieldName] = [];
        } else if (typeof currentValue === 'string') {
          // Use empty string for string fields so they visually clear
          emptyFormState[fieldName] = '';
        } else if (typeof currentValue === 'number') {
          emptyFormState[fieldName] = undefined;
        } else if (currentValue instanceof Date) {
          emptyFormState[fieldName] = undefined;
        } else {
          emptyFormState[fieldName] = undefined;
        }
      }
    });
    
    // Increment clear key to force React components to re-render
    setClearKey(prev => prev + 1);
    
    // Reset form with empty state (but keep code)
    reset(emptyFormState, {
      keepDefaultValues: false,
      keepErrors: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false
    });
    
    // Force clear all fields explicitly (except code) to ensure they're cleared visually
    setTimeout(() => {
      allFieldNames.forEach(fieldName => {
        if (fieldName !== 'givenCode') {
          const fieldValue = form.getValues(fieldName as any);
          if (Array.isArray(fieldValue)) {
            form.setValue(fieldName as any, [], {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false
            });
          } else if (typeof fieldValue === 'string') {
            // Use empty string for string fields
            form.setValue(fieldName as any, '', {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false
            });
          } else {
            form.setValue(fieldName as any, undefined, {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false
            });
          }
        }
      });
      
      // Clear errors after a short delay
      setTimeout(() => {
        form.clearErrors();
        skipAutoSaveRef.current = false;
      }, 50);
    }, 100);
    
    setHasUnsavedChanges(false);
    setLastSaved(undefined);
  }, [form, reset]);

  const exportData = useCallback(() => {
    const data = form.getValues();
    // Exclude givenCode from export - user should enter it separately
    const { givenCode, ...dataToExport } = data;
    // Export with full base64 data (not compressed) for server/backup
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eira-form-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [form]);

  const importData = useCallback((data: any) => {
    try {
      // Keep current code intact
      const currentCode = form.getValues('givenCode');
      // Exclude givenCode from imported data
      const { givenCode, ...dataWithoutCode } = data;
      const revivedData = reviveDates(dataWithoutCode, dateFields);

      // Temporarily disable auto-save to avoid interference
      skipAutoSaveRef.current = true;

      // Reset with imported data while preserving the current code value
      reset({ ...revivedData, givenCode: currentCode }, {
        keepDefaultValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });

      // Ensure code stays visually populated and no validation runs
      form.setValue('givenCode', currentCode, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false
      });

      // Explicitly set all fields including arrays (especially image arrays) after reset
      // This ensures FormPhotoUpload and FormTable components get their data
      setTimeout(() => {
        Object.keys(revivedData).forEach(fieldName => {
          const value = revivedData[fieldName as keyof typeof revivedData];
          if (value !== undefined && value !== null) {
            try {
              form.setValue(fieldName as any, value as any, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false
              });
            } catch (error) {
              console.warn(`Failed to set field ${fieldName} during import:`, error);
            }
          }
        });
      }, 50);

      // Clear any validation artifacts from reset
      form.clearErrors();
      setTimeout(() => form.clearErrors(), 50);

      // Manually save imported data to storage after a short delay
      // This ensures imported data persists even if user doesn't touch any fields
      setTimeout(async () => {
        if (currentCode && currentCode.length >= 5 && currentCode.length <= 10) {
          try {
            const allFormData = form.getValues();
            // Convert images to keys for localStorage, store actual data in IndexedDB
            const serializedData = await serializeDatesAndKeys(allFormData, currentCode);
            const dataWithTimestamp = {
              ...serializedData,
              _timestamp: Date.now()
            };
            
            const storageKey = getStorageKey(currentCode);
            const dataToSave = JSON.stringify(dataWithTimestamp);
            localStorage.setItem(storageKey, dataToSave);
            localStorage.setItem(LAST_CODE_KEY, currentCode);
            setCurrentCode(currentCode);
            setHasUnsavedChanges(false);
            setLastSaved(new Date());
            console.log(`💾 Saved imported data with image keys (images stored in IndexedDB) for code: ${currentCode}`);
          } catch (error) {
            console.error('Error saving imported data:', error);
          }
        }
        
        // Re-enable auto-save after saving
        skipAutoSaveRef.current = false;
      }, 150);

      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }, [reset, reviveDates, dateFields, form, serializeDatesAndKeys, setCurrentCode, setHasUnsavedChanges, setLastSaved]);

  // Save current form data for a specific code
  const saveDataForCode = useCallback(async (code: string) => {
    if (!code || code.length < 5 || code.length > 10) {
      console.warn('Invalid code provided to saveDataForCode:', code);
      return;
    }
    
    const data = form.getValues();
    // Convert images to keys for localStorage, store actual data in IndexedDB
    const serializedData = await serializeDatesAndKeys(data, code);
    const dataWithTimestamp = {
      ...serializedData,
      _timestamp: Date.now()
    };
    try {
      const storageKey = getStorageKey(code);
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
      console.log(`💾 Saved data with image paths (images stored in IndexedDB) for code: ${code}`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [form]);

  // Load data for a specific code
  const loadDataForCode = useCallback(async (code: string) => {
    if (!code || code.length < 5 || code.length > 10) {
      console.warn('Invalid code provided to loadDataForCode:', code);
      return;
    }
    
    // Save current data before switching
    const currentData = form.getValues();
    if (currentCode && currentCode.length >= 5 && currentCode.length <= 10 && currentData.givenCode === currentCode) {
      await saveDataForCode(currentCode);
    }
    
    // Load new code's data (restore images from IndexedDB using keys)
    const storedData = await getStoredData(code);
    console.log(`🔍 Loading data for code: ${code}`, storedData);
    
    // Temporarily disable auto-save during load/clear
    skipAutoSaveRef.current = true;
    
    // Always ensure givenCode is set in the data
    const dataWithCode = { ...storedData, givenCode: code };
    
    if (!storedData || Object.keys(storedData).length === 0) {
      console.warn(`No data found for code: ${code} - clearing form`);
      // Clear the form completely for new code
      const currentFormData = form.getValues();
      const allFieldNames = Object.keys(currentFormData);
      const emptyFormState: any = { givenCode: code };
      
      allFieldNames.forEach(fieldName => {
        if (fieldName !== 'givenCode') {
          const currentValue = currentFormData[fieldName as keyof typeof currentFormData];
          if (Array.isArray(currentValue)) {
            emptyFormState[fieldName] = [];
          } else {
            emptyFormState[fieldName] = undefined;
          }
        }
      });
      
      reset(emptyFormState, {
        keepDefaultValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });
      
      // Force clear all fields explicitly
      setTimeout(() => {
        allFieldNames.forEach(fieldName => {
          if (fieldName !== 'givenCode') {
            const fieldValue = form.getValues(fieldName as any);
            if (Array.isArray(fieldValue)) {
              form.setValue(fieldName as any, [], {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false
              });
            } else {
              form.setValue(fieldName as any, undefined, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false
              });
            }
          }
        });
        form.clearErrors();
        skipAutoSaveRef.current = false;
      }, 100);
      
      setCurrentCode(code);
      localStorage.setItem(LAST_CODE_KEY, code);
      setHasUnsavedChanges(false);
      return;
    }
    
    // Reset with the stored data without triggering validation (including code)
    reset(dataWithCode, {
      keepDefaultValues: false,
      keepErrors: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false
    });
    
    // Clear any validation errors immediately and multiple times to prevent validation UI
    // Use multiple timeouts to catch any delayed validation
    setTimeout(() => {
      form.clearErrors();
    }, 0);
    
    setTimeout(() => {
      form.clearErrors();
    }, 50);
    
    // After a small delay, explicitly set all fields to ensure they're all populated
    // This is necessary because reset might not update all fields correctly, especially selects
    setTimeout(() => {
      // Always set the code field first
    form.setValue('givenCode', code, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false
      });
      
      if (storedData && Object.keys(storedData).length > 0) {
        const fieldsToSet: string[] = ['givenCode'];
        
        // Set all fields - react-hook-form handles arrays and objects directly
        // IMPORTANT: Set arrays explicitly and preserve empty arrays/strings
        Object.keys(storedData).forEach(fieldName => {
          const value = storedData[fieldName as keyof typeof storedData];
          
          // Only skip undefined/null - preserve empty strings, 0, false, and empty arrays
          if (value === undefined || value === null) {
            return;
          }
          
          try {
            // react-hook-form's setValue can handle:
            // - Primitive values: setValue('field', 'value')
            // - Arrays: setValue('arrayField', [...]) - IMPORTANT for FormTable fields
            // - Arrays of objects: setValue('languageSkills', [{...}, {...}])
            // - Empty arrays should be set to [] so useFieldArray works correctly
            form.setValue(fieldName as any, value as any, {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false
            });
            fieldsToSet.push(fieldName);
          } catch (error) {
            console.warn(`⚠️ Failed to set field ${fieldName}:`, error, value);
          }
        });
        
        console.log(`✅ Set ${fieldsToSet.length} fields for code: ${code}`);
        console.log('📋 Sample fields:', fieldsToSet.slice(0, 10).join(', '), fieldsToSet.length > 10 ? '...' : '');
        // Log specific array fields to debug
        const arrayFields = ['languageSkills', 'childrenInfo'];
        arrayFields.forEach(field => {
          const fieldValue = storedData[field as keyof typeof storedData];
          if (fieldValue && Array.isArray(fieldValue)) {
            const arr = fieldValue as any[];
            console.log(`  📊 ${field}: ${arr.length} items`);
          }
        });
        
        // Clear any validation errors that were triggered during load (multiple times)
        form.clearErrors();
        
        // One more clear after a short delay to catch any late validation
        setTimeout(() => {
          form.clearErrors();
        }, 50);
        
        // Re-enable auto-save and don't trigger validation
        skipAutoSaveRef.current = false;
      } else {
        // Even if no stored data, re-enable auto-save
        skipAutoSaveRef.current = false;
      }
    }, 100);
    
    setCurrentCode(code);
    // Save the code as the last used code
    localStorage.setItem(LAST_CODE_KEY, code);
    setHasUnsavedChanges(false);
  }, [form, currentCode, getStoredData, reset, saveDataForCode]);

  const customFormState: FormState = {
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    isSubmitting,
    hasUnsavedChanges,
    lastSaved,
    progress
  };

  const actions: FormActions = {
    save,
    reset: resetForm,
    clear: clearForm,
    exportData,
    importData,
    loadDataForCode,
    saveDataForCode
  };

  return {
    form,
    formState: customFormState,
    actions,
    setIsSubmitting,
    clearKey // Return clearKey to force re-render
  };
};
