import { FormData } from '@/schemas/formSchema';
import i18next from 'i18next';

export interface SubmissionResult {
  success: boolean;
  message: string;
  data?: any;
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

  async submitForm(data: FormData): Promise<SubmissionResult> {
    try {
      // Download the data as JSON file
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);

      const response = await fetch(this.config.endpoint, {
        method: this.config.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        return {
          success: false,
          message: errorData.message || `Server responded with status ${response.status}`,
          errors: errorData.errors
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Form submitted successfully',
        data: result
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timed out. Please try again.'
          };
        }
        return {
          success: false,
          message: error.message
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  private async parseErrorResponse(response: Response): Promise<{ message?: string; errors?: string[] }> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { message: await response.text() };
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  async validateForm(data: Partial<FormData>): Promise<SubmissionResult> {
    // Client-side validation before submission
    const errors: string[] = [];

    // Basic required field validation
    if (!data.givenCode) errors.push('Code is required');
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    if (!data.email) errors.push('Email is required');
    if (!data.phone) errors.push('Phone is required');

    // Conditional validations
    if (data.foreigner === 'yes' && (!data.visaPassport || data.visaPassport.length === 0)) {
      errors.push(i18next.t('form.validation.required.visaPassport'));
    }

    if (data.receivesPension === 'yes' && (!data.pensionDecision || data.pensionDecision.length === 0)) {
      errors.push(i18next.t('form.validation.required.pensionDecision'));
    }

    if (data.claimChildTaxRelief === 'yes') {
      const hasChildCertificate = (data.childBirthCertificate1?.length ?? 0) > 0 ||
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
      errors: errors.length > 0 ? errors : undefined
    };
  }

  async saveDraft(data: FormData): Promise<SubmissionResult> {
    try {
      // Save to localStorage as backup
      localStorage.setItem('eira-form-draft', JSON.stringify(data));
      
      // Could also save to server endpoint for cross-device sync
      return {
        success: true,
        message: 'Draft saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save draft'
      };
    }
  }

  async loadDraft(): Promise<FormData | null> {
    try {
      const draft = localStorage.getItem('eira-form-draft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    localStorage.removeItem('eira-form-draft');
  }
}

// Default configuration for EIRA form submission
export const createEiraSubmissionService = () => {
  return new FormSubmissionService({
    endpoint: '/rest/sm/gas/v1/createHrRequest',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${import.meta.env.VITE_GAS_NAME}:${import.meta.env.VITE_GAS_PASS}`)}`
    },
    timeout: 30000
  });
};
