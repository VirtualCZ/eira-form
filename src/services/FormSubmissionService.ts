import { FormData } from '@/schemas/formSchema';
import { submitHrRequest, type HrSubmitResult } from '@/services/hrFormApi';

export interface SubmissionResult {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string[];
}

export class FormSubmissionService {
  async submitForm(data: FormData, orgUnitName?: string): Promise<SubmissionResult> {
    const result: HrSubmitResult = await submitHrRequest(data, orgUnitName);

    if (result.success) {
      return {
        success: true,
        message: 'Form submitted successfully',
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message ?? 'Submission failed',
    };
  }
}

export const createEiraSubmissionService = (): FormSubmissionService => new FormSubmissionService();
