import { useCallback } from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'custom';
  tab?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  tabErrors: Record<string, ValidationError[]>;
}

export const useFormValidation = () => {
  const { t } = useTranslation();

  const getErrorMessages = useCallback((
    errors: FieldErrors<FieldValues>, 
    prefix = ''
  ): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    
    const processError = (key: string, error: any, currentPrefix: string) => {
      if (error?.message) {
        validationErrors.push({
          field: currentPrefix + key,
          message: error.message,
          type: error.type || 'custom'
        });
      }
      
      if (error?.types) {
        Object.entries(error.types).forEach(([type, message]) => {
          if (typeof message === 'string') {
            validationErrors.push({
              field: currentPrefix + key,
              message,
              type: type as any
            });
          }
        });
      }
      
      if (typeof error === 'object' && !error.message && !error.types) {
        validationErrors.push(...getErrorMessages(error, currentPrefix + key + '.'));
      }
    };

    Object.entries(errors).forEach(([key, error]) => {
      if (error) {
        processError(key, error, prefix);
      }
    });

    return validationErrors;
  }, []);

  const validateTab = useCallback((
    errors: FieldErrors<FieldValues>,
    tabFields: string[]
  ): ValidationError[] => {
    const tabErrors = getErrorMessages(errors);
    return tabErrors.filter(error => 
      tabFields.some(field => error.field.startsWith(field))
    );
  }, [getErrorMessages]);

  const getValidationResult = useCallback((
    errors: FieldErrors<FieldValues>,
    tabFieldsMap: Record<string, string[]>
  ): ValidationResult => {
    const allErrors = getErrorMessages(errors);
    const tabErrors: Record<string, ValidationError[]> = {};

    Object.entries(tabFieldsMap).forEach(([tabName, fields]) => {
      tabErrors[tabName] = allErrors.filter(error =>
        fields.some(field => error.field.startsWith(field))
      );
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      tabErrors
    };
  }, [getErrorMessages]);

  const formatErrorMessage = useCallback((error: ValidationError): string => {
    // Try to prettify array field errors like "childrenInfo.1.Rodné číslo neprošlo kontrolou dělitelnosti."
    const arrayFieldMatch = error.message.match(/^([a-zA-Z0-9_]+)\.(\d+)\.(.+)$/);
    if (arrayFieldMatch) {
      const [, field, index, message] = arrayFieldMatch;
      const label = t(`form.labels.${field}`) || field;
      return `${label} (${parseInt(index, 10) + 1}): ${message}`;
    }
    return error.message;
  }, [t]);

  return {
    getErrorMessages,
    validateTab,
    getValidationResult,
    formatErrorMessage
  };
};

