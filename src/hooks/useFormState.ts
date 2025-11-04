import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { FormData, getFormSchema } from '@/schemas/formSchema';
import { LAST_CODE_KEY, getStorageKey, serializeDatesAndKeys, restoreImagesFromKeys, cleanupOldData, reviveDates } from '@/services/FormPersistence';
import { isValidCode } from '@/lib/codeUtils';
import { hasFieldData } from '@/lib/formDataUtils';

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
  importData: (data: Record<string, unknown>) => void;
  loadDataForCode: (code: string) => Promise<void>;
  saveDataForCode: (code: string) => Promise<void>;
}

const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

// Helper function to serialize dates and convert images to keys for localStorage
// Keys stored in localStorage, actual image data stored in IndexedDB

// Note: excludeImageFields removed - we now store image paths in localStorage

// Helper function to clean up old data on page load

export const useFormState = () => {
  const { t } = useTranslation();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [clearKey, setClearKey] = useState(0); // Key to force re-render on clear
  const skipAutoSaveRef = useRef(false);

  const formSchema = useMemo(() => getFormSchema(t), [t]);
  
  // date deserialization now handled by service.reviveDates

  const getStoredData = useCallback(async (code?: string) => {
    try {
      // Check URL first for code (on page load/refresh)
      let codeToUse = code;
      if (!codeToUse) {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        if (isValidCode(codeFromUrl || undefined)) {
          codeToUse = codeFromUrl || undefined;
        } else {
          codeToUse = currentCode || localStorage.getItem(LAST_CODE_KEY) || '';
        }
      }
      
      if (!isValidCode(codeToUse || undefined)) {
        return {};
      }
      const storageKey = getStorageKey(codeToUse as string);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Remove timestamp before returning data
        const { _timestamp, ...data } = parsed;
        // Restore images from IndexedDB using keys and revive dates
        const restored = await restoreImagesFromKeys(data);
        return reviveDates(restored);
      }
      return {};
    } catch (error) {
      return {};
    }
  }, [reviveDates, currentCode]);

  // Clean up old data on mount
  useEffect(() => {
    cleanupOldData().catch(() => {
      // Silent error handling
    });
  }, []);

  const form = useForm<FormData>({
    resolver: yupResolver(formSchema),
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
    const formData = watchedValues as Record<string, unknown>;
    const excludedFields = ['givenCode', '_timestamp'];
    const fieldsToCount = Object.entries(formData).filter(([key]) => !excludedFields.includes(key));
    const totalFields = fieldsToCount.length;
    if (totalFields === 0) return 0;
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
      
      if (isValidCode(code)) {
        const fieldsWithData = Object.keys(allFormData).filter(key => {
          if (key === 'givenCode') return false;
          // Include image fields in the check - they should trigger saving too
          const fieldValue = allFormData[key as keyof typeof allFormData];
          const hasData = hasFieldData(fieldValue);
          
          return hasData;
        });
        
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
            } catch (error) {
              // Silent error handling
            }
          }).catch(() => {
            // Silent error handling
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
    if (isValidCode(code)) {
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
      } catch (error) {
        // Silent error handling
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
    if (isValidCode(code)) {
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
    if (isValidCode(code)) {
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
    // Export with full base64 data (not compressed) for server/backup
    // Include givenCode in the export
    const jsonStr = JSON.stringify(data, null, 2);
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

  const importData = useCallback((data: Record<string, unknown>) => {
    try {
      // Keep current code intact
      const currentCode = form.getValues('givenCode');
      // Exclude givenCode from imported data
      const { givenCode, ...dataWithoutCode } = data;
      const revivedData = reviveDates(dataWithoutCode);

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
          } catch (error) {
            // Silent error handling
          }
        }
        
        // Re-enable auto-save after saving
        skipAutoSaveRef.current = false;
      }, 150);

      setHasUnsavedChanges(true);
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }, [reset, reviveDates, form, serializeDatesAndKeys, setCurrentCode, setHasUnsavedChanges, setLastSaved]);

  // Save current form data for a specific code
  const saveDataForCode = useCallback(async (code: string) => {
    if (!isValidCode(code)) {
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
    } catch (error) {
      // Silent error handling
    }
  }, [form]);

  // Load data for a specific code
  const loadDataForCode = useCallback(async (code: string) => {
    if (!isValidCode(code)) {
      return;
    }
    
    // Save current data before switching
    const currentData = form.getValues();
    if (isValidCode(currentCode) && currentData.givenCode === currentCode) {
      await saveDataForCode(currentCode);
    }
    
    // Load new code's data (restore images from IndexedDB using keys)
    const storedData = await getStoredData(code);
    
    // Temporarily disable auto-save during load/clear
    skipAutoSaveRef.current = true;
    
    // Always ensure givenCode is set in the data
    const dataWithCode = { ...storedData, givenCode: code };
    
    if (!storedData || Object.keys(storedData).length === 0) {
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
