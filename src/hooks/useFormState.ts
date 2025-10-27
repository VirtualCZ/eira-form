import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { FormData, getFormSchema } from '@/schemas/formSchema';

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
  progress: number;
}

export interface FormActions {
  save: () => void;
  reset: () => void;
  clear: () => void;
  exportData: () => void;
  importData: (data: any) => void;
}

const STORAGE_KEY = 'eira-form-data';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export const useFormState = () => {
  const { t } = useTranslation();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      // Convert date strings to Date objects
      else if (dateKeys.includes(key) && typeof result[key] === 'string') {
        const d = new Date(result[key]);
        if (!isNaN(d.getTime())) {
          result[key] = d;
        }
      } 
      // Recursively process nested objects
      else if (typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = reviveDates(result[key], dateKeys);
      }
    }
    return result;
  }, []);

  const getStoredData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? reviveDates(JSON.parse(stored), dateFields) : {};
    } catch (error) {
      console.error('Error loading stored data:', error);
      return {};
    }
  }, [reviveDates, dateFields]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: getStoredData(),
  });

  const { watch, formState, reset } = form;

  // Calculate form progress
  const progress = useMemo(() => {
    const totalFields = 50; // Approximate total fields
    const filledFields = Object.values(watch()).filter(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  }, [watch]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = watch((value) => {
      setHasUnsavedChanges(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
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

  const save = useCallback(() => {
    const data = form.getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  }, [form]);

  const resetForm = useCallback(() => {
    reset(getStoredData());
    setHasUnsavedChanges(false);
  }, [reset, getStoredData]);

  const clearForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    
    // Force clear by resetting to undefined values and then empty
    form.reset(undefined as any);
    
    // Use a more aggressive approach to clear all fields
    const allFields = Object.keys(form.getValues());
    allFields.forEach(fieldName => {
      form.setValue(fieldName as any, undefined as any, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    });
    
    setHasUnsavedChanges(false);
    setLastSaved(undefined);
  }, [form]);

  const exportData = useCallback(() => {
    const data = form.getValues();
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

  const importData = useCallback((data: any) => {
    try {
      const revivedData = reviveDates(data, dateFields);
      reset(revivedData);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }, [reset, reviveDates, dateFields]);

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
    importData
  };

  return {
    form,
    formState: customFormState,
    actions,
    setIsSubmitting
  };
};
