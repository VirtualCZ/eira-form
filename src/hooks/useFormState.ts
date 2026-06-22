import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { FormData, getFormSchema } from '@/schemas/formSchema';
import {
  LAST_CODE_KEY,
  getStorageKey,
  serializeDatesAndKeys,
  cleanupOldData,
  reviveDates,
  buildSubmitPayload,
  importJsonToFormState,
  parseStoredFormData,
  serializeDatesForFormJson,
} from '@/services/FormPersistence';
import { isValidCode } from '@/lib/codeUtils';
import { calculateFormProgress, hasFieldData } from '@/lib/formDataUtils';
import { trimStringValuesDeep } from '@/lib/trimFormValues';
import { getTabConfigs } from '@/config/tabConfigs';
import { getCodeInfo } from '@/services/hrFormApi';

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
  progress: number;
  orgUnitName?: string;
}

export interface FormActions {
  save: () => Promise<void>;
  reset: () => Promise<void>;
  clear: () => void;
  exportData: () => void;
  exportDataForAPI: () => void;
  importData: (data: Record<string, unknown>) => Promise<void>;
  loadDataForCode: (code: string) => Promise<void>;
  saveDataForCode: (code: string) => Promise<void>;
}

const AUTO_SAVE_INTERVAL = 5000;
const RESET_OPTIONS = {
  keepDefaultValues: false,
  keepErrors: false,
  keepDirty: false,
  keepIsSubmitted: false,
  keepTouched: false,
  keepIsValid: false,
  keepSubmitCount: false,
} as const;

const quietSetValue = (form: UseFormReturn<FormData>, fieldName: string, value: unknown) => {
  form.setValue(fieldName as keyof FormData & string, value as FormData[keyof FormData], {
    shouldDirty: false,
    shouldTouch: false,
    shouldValidate: false,
  });
};

const applyFormValues = (form: UseFormReturn<FormData>, values: Record<string, unknown>) => {
  Object.entries(values).forEach(([fieldName, value]) => {
    if (value === undefined || value === null) return;
    try {
      quietSetValue(form, fieldName, value);
    } catch {
      // ignore unknown fields
    }
  });
};

export const useFormState = () => {
  const { t } = useTranslation();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [clearKey, setClearKey] = useState(0);
  const [orgUnitName, setOrgUnitName] = useState<string | undefined>(undefined);
  const skipAutoSaveRef = useRef(false);
  const formMutationEpochRef = useRef(0);

  const formSchema = useMemo(() => getFormSchema(t), [t]);

  const getStoredData = useCallback(async (code?: string) => {
    try {
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
      if (!stored) return {};

      const parsed = JSON.parse(stored);
      const { _timestamp, ...data } = parsed;
      return parseStoredFormData(data);
    } catch {
      return {};
    }
  }, [currentCode]);

  useEffect(() => {
    cleanupOldData().catch(() => {});
  }, []);

  const form = useForm<FormData>({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const { watch, formState, reset } = form;
  const watchedValues = watch();

  const progress = useMemo(() => {
    const formData = watchedValues as Partial<FormData>;
    const visibleTabs = getTabConfigs().filter((tab) => tab.isVisible(formData));
    return calculateFormProgress(formData, formState.errors as Record<string, unknown>, visibleTabs);
  }, [watchedValues, formState.errors]);

  useEffect(() => {
    const subscription = watch(() => {
      if (skipAutoSaveRef.current) return;

      const allFormData = trimStringValuesDeep(form.getValues());
      const code = allFormData.givenCode;

      if (!isValidCode(code)) return;

      const fieldsWithData = Object.keys(allFormData).filter((key) => {
        if (key === 'givenCode') return false;
        return hasFieldData(allFormData[key as keyof typeof allFormData]);
      });

      if (fieldsWithData.length === 0) return;

      setCurrentCode(code);
      setHasUnsavedChanges(true);

      serializeDatesAndKeys(allFormData, code)
        .then((serializedData) => {
          const dataWithTimestamp = { ...serializedData, _timestamp: Date.now() };
          const storageKey = getStorageKey(code);
          localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
          localStorage.setItem(LAST_CODE_KEY, code);
        })
        .catch(() => {});
    });

    return () => subscription.unsubscribe();
  }, [watch, form]);

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
    const data = trimStringValuesDeep(form.getValues());
    const code = data.givenCode;
    if (!isValidCode(code)) return;

    const serializedData = await serializeDatesAndKeys(data, code);
    const dataWithTimestamp = { ...serializedData, _timestamp: Date.now() };
    const storageKey = getStorageKey(code);
    localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  }, [form]);

  const resetForm = useCallback(async () => {
    const data = await getStoredData();
    reset(data);
    setHasUnsavedChanges(false);
  }, [reset, getStoredData]);

  const clearForm = useCallback(() => {
    const code = form.getValues().givenCode;

    if (isValidCode(code)) {
      const storageKey = getStorageKey(code);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_orgUnitName`);
    }

    setOrgUnitName(undefined);
    skipAutoSaveRef.current = true;

    const currentFormData = form.getValues();
    const allFieldNames = Object.keys(currentFormData);
    const emptyFormState: Record<string, unknown> = {};

    if (isValidCode(code)) {
      emptyFormState.givenCode = code;
    }

    allFieldNames.forEach((fieldName) => {
      if (fieldName === 'givenCode') return;
      const currentValue = currentFormData[fieldName as keyof typeof currentFormData];
      if (Array.isArray(currentValue)) {
        emptyFormState[fieldName] = [];
      } else if (typeof currentValue === 'string') {
        emptyFormState[fieldName] = '';
      } else {
        emptyFormState[fieldName] = undefined;
      }
    });

    setClearKey((prev) => prev + 1);
    reset(emptyFormState as FormData, RESET_OPTIONS);

    setTimeout(() => {
      applyFormValues(form, emptyFormState);
      form.clearErrors();
      skipAutoSaveRef.current = false;
    }, 100);

    setHasUnsavedChanges(false);
    setLastSaved(undefined);
  }, [form, reset]);

  const downloadJsonFile = useCallback((payload: unknown, filenamePrefix: string) => {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportData = useCallback(() => {
    downloadJsonFile(
      trimStringValuesDeep(serializeDatesForFormJson(form.getValues())),
      'eira-form-data',
    );
  }, [form, downloadJsonFile]);

  const exportDataForAPI = useCallback(() => {
    downloadJsonFile(buildSubmitPayload(form.getValues(), orgUnitName), 'eira-form-api-data');
  }, [form, orgUnitName, downloadJsonFile]);

  const persistFormData = useCallback(async (code: string) => {
    const serializedData = await serializeDatesAndKeys(trimStringValuesDeep(form.getValues()), code);
    const storageKey = getStorageKey(code);
    localStorage.setItem(storageKey, JSON.stringify({ ...serializedData, _timestamp: Date.now() }));
    localStorage.setItem(LAST_CODE_KEY, code);
    setCurrentCode(code);
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
  }, [form]);

  const importData = useCallback(async (data: Record<string, unknown>) => {
    const importEpoch = ++formMutationEpochRef.current;
    const currentCode =
      form.getValues('givenCode') ||
      (isValidCode(data.givenCode as string | undefined) ? String(data.givenCode) : '');
    const importedFields = await importJsonToFormState(data);

    skipAutoSaveRef.current = true;
    reset({ ...importedFields, givenCode: currentCode } as FormData, RESET_OPTIONS);
    form.clearErrors();

    setTimeout(() => {
      if (importEpoch !== formMutationEpochRef.current) return;
      if (isValidCode(currentCode)) {
        persistFormData(currentCode).finally(() => {
          skipAutoSaveRef.current = false;
        });
      } else {
        skipAutoSaveRef.current = false;
      }
    }, 150);

    setHasUnsavedChanges(true);
  }, [form, reset, persistFormData]);

  const saveDataForCode = useCallback(async (code: string) => {
    if (!isValidCode(code)) return;

    const serializedData = await serializeDatesAndKeys(trimStringValuesDeep(form.getValues()), code);
    const storageKey = getStorageKey(code);
    localStorage.setItem(storageKey, JSON.stringify({ ...serializedData, _timestamp: Date.now() }));
  }, [form]);

  const loadDataForCode = useCallback(async (code: string) => {
    if (!isValidCode(code)) return;

    const loadEpoch = ++formMutationEpochRef.current;
    const currentData = form.getValues();

    if (isValidCode(currentCode) && currentData.givenCode === currentCode) {
      await saveDataForCode(currentCode);
    }

    const storageKey = getStorageKey(code);
    const hasStoredData = localStorage.getItem(storageKey) !== null;
    let storedData: Partial<FormData> = {};

    setOrgUnitName(undefined);

    if (hasStoredData) {
      storedData = await getStoredData(code);
      const storedOrgUnitName = localStorage.getItem(`${storageKey}_orgUnitName`);
      if (storedOrgUnitName) {
        setOrgUnitName(storedOrgUnitName);
      } else {
        const apiResult = await getCodeInfo(code);
        if (apiResult?.orgUnitName) {
          setOrgUnitName(apiResult.orgUnitName);
          localStorage.setItem(`${storageKey}_orgUnitName`, apiResult.orgUnitName);
        }
      }
    } else {
      const apiResult = await getCodeInfo(code);
      if (apiResult) {
        storedData = trimStringValuesDeep(reviveDates(apiResult.formData));
        const orgUnitNameValue = apiResult.orgUnitName || undefined;
        setOrgUnitName(orgUnitNameValue);
        if (orgUnitNameValue) {
          localStorage.setItem(`${storageKey}_orgUnitName`, orgUnitNameValue);
        } else {
          localStorage.removeItem(`${storageKey}_orgUnitName`);
        }
      }
    }

    if (loadEpoch !== formMutationEpochRef.current) return;

    skipAutoSaveRef.current = true;

    if (!storedData || Object.keys(storedData).length === 0) {
      const currentFormData = form.getValues();
      const emptyFormState: Record<string, unknown> = { givenCode: code };

      Object.keys(currentFormData).forEach((fieldName) => {
        if (fieldName !== 'givenCode') {
          const fieldValue = currentFormData[fieldName as keyof FormData];
          emptyFormState[fieldName] = Array.isArray(fieldValue) ? [] : undefined;
        }
      });

      reset(emptyFormState as FormData, RESET_OPTIONS);
      setTimeout(() => {
        if (loadEpoch !== formMutationEpochRef.current) return;
        applyFormValues(form, emptyFormState);
        form.clearErrors();
        skipAutoSaveRef.current = false;
      }, 100);

      setCurrentCode(code);
      localStorage.setItem(LAST_CODE_KEY, code);
      setHasUnsavedChanges(false);
      return;
    }

    reset({ ...storedData, givenCode: code } as FormData, RESET_OPTIONS);
    form.clearErrors();

    setTimeout(() => {
      if (loadEpoch !== formMutationEpochRef.current) return;
      quietSetValue(form, 'givenCode', code);
      applyFormValues(form, storedData as Record<string, unknown>);
      form.clearErrors();
      skipAutoSaveRef.current = false;
    }, 100);

    setCurrentCode(code);
    localStorage.setItem(LAST_CODE_KEY, code);
    setHasUnsavedChanges(false);
  }, [form, currentCode, getStoredData, reset, saveDataForCode]);

  const customFormState: FormState = useMemo(() => ({
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    isSubmitting,
    hasUnsavedChanges,
    lastSaved,
    progress,
    orgUnitName,
  }), [formState.isDirty, formState.isValid, isSubmitting, hasUnsavedChanges, lastSaved, progress, orgUnitName]);

  const actions: FormActions = {
    save,
    reset: resetForm,
    clear: clearForm,
    exportData,
    exportDataForAPI,
    importData,
    loadDataForCode,
    saveDataForCode,
  };

  return {
    form,
    formState: customFormState,
    actions,
    setIsSubmitting,
    clearKey,
  };
};
