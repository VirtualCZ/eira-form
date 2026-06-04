import { getFormVariant } from '@/config/formVariants';
import { FormData } from '@/schemas/formSchema';
import { getHrBasicAuthHeader } from '@/services/hrAuth';
import i18next from 'i18next';
import { trimStringValuesDeep } from '@/lib/trimFormValues';
import { serializeDatesForSubmission } from '@/services/FormPersistence';
import { filterVisibleFields } from '@/lib/formDataUtils';

export interface SubmissionResult {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string[];
}

export interface SubmissionConfig {
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
}

export class FormSubmissionService {
  private config: SubmissionConfig;

  constructor(config: SubmissionConfig) {
    this.config = config;
  }

  async submitForm(data: FormData, orgUnitName?: string): Promise<SubmissionResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);

      const visibleData = filterVisibleFields(data);
      const serializedData = trimStringValuesDeep(
        serializeDatesForSubmission(visibleData),
      ) as Record<string, unknown>;

      if (orgUnitName != null) {
        serializedData.orgUnitName = String(orgUnitName).trim();
      }

      const response = await fetch(this.config.endpoint, {
        method: this.config.method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...this.config.headers,
        },
        body: JSON.stringify(serializedData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        return {
          success: false,
          message: errorData.message || `Server responded with status ${response.status}`,
          errors: errorData.errors,
        };
      }

      const result = await response.json();
      if (result.status && result.status !== 'OK') {
        return {
          success: false,
          message: result.message || 'Submission failed',
        };
      }

      return {
        success: true,
        message: 'Form submitted successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timed out. Please try again.',
          };
        }
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  private async parseErrorResponse(response: Response): Promise<{ message?: string; errors?: string[] }> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return { message: await response.text() };
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  async validateForm(data: Partial<FormData>): Promise<SubmissionResult> {
    const errors: string[] = [];

    if (!data.givenCode) errors.push('Code is required');
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    if (!data.email) errors.push('Email is required');
    if (!data.phone) errors.push('Phone is required');

    if (data.foreigner === 'yes' && (!data.visaPassport || data.visaPassport.length === 0)) {
      errors.push(i18next.t('form.validation.required.visaPassport'));
    }

    if (data.receivesPension === 'yes' && (!data.pensionDecision || data.pensionDecision.length === 0)) {
      errors.push(i18next.t('form.validation.required.pensionDecision'));
    }

    if (data.claimChildTaxRelief === 'yes') {
      const hasChildCertificate =
        (data.childBirthCertificate1?.length ?? 0) > 0 ||
        (data.childBirthCertificate2?.length ?? 0) > 0 ||
        (data.childBirthCertificate3?.length ?? 0) > 0 ||
        (data.childBirthCertificate4?.length ?? 0) > 0;
      if (!hasChildCertificate) {
        errors.push(i18next.t('form.validation.required.childBirthCertificate'));
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Form is valid' : 'Please fix the following errors',
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export const createEiraSubmissionService = (): FormSubmissionService => {
  const variant = getFormVariant();
  const auth = getHrBasicAuthHeader();
  const headers: Record<string, string> = {};
  if (auth) {
    headers.Authorization = auth;
  }

  return new FormSubmissionService({
    endpoint: `/rest/sm/${variant}/v1/createHrRequest`,
    method: 'POST',
    headers,
    timeout: 30_000,
  });
};
