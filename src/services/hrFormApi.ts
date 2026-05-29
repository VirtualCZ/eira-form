import { getFormVariant } from '@/config/formVariants';
import { FormData } from '@/schemas/formSchema';
import { serializeDatesForSubmission } from '@/services/FormPersistence';
import { filterVisibleFields } from '@/lib/formDataUtils';

/**
 * HR API on rest-war (public, no login). Same host as forms.war static app under /forms/hr/.
 * Paths: /rest/sm/gas/v1 or /rest/sm/icuk/v1 (see SMRest + rest-war web.xml).
 */
export const getHrApiBase = (): string => {
  if (import.meta.env.VITE_HR_API_BASE) {
    return import.meta.env.VITE_HR_API_BASE;
  }
  return `/rest/sm/${getFormVariant()}/v1`;
};

const REQUEST_TIMEOUT_MS = 30_000;

export interface CodeInfoResult {
  formData: Partial<FormData>;
  orgUnitName?: string;
}

export interface HrSubmitResult {
  success: boolean;
  message?: string;
  status?: string;
  data?: unknown;
}

export async function getCodeInfo(code: string): Promise<CodeInfoResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getHrApiBase()}/getCodeInfo/${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.status !== 'OK') {
      return null;
    }

    const formData: Partial<FormData> = {};
    if (result.subFirstName) {
      formData.firstName = String(result.subFirstName);
    }
    if (result.subLastName) {
      formData.lastName = String(result.subLastName);
    }

    const orgUnitName =
      result.orgUnitName != null && String(result.orgUnitName).trim() !== ''
        ? String(result.orgUnitName).trim()
        : undefined;

    return { formData, orgUnitName };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function submitHrRequest(
  data: FormData,
  orgUnitName?: string
): Promise<HrSubmitResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const visibleData = filterVisibleFields(data);
    const serializedData = serializeDatesForSubmission(visibleData) as Record<string, unknown>;

    if (serializedData.givenCode != null && serializedData.givenCode !== '') {
      const subjectId = Number(serializedData.givenCode);
      if (!Number.isNaN(subjectId)) {
        serializedData.givenCode = subjectId;
      }
    }

    if (orgUnitName?.trim()) {
      serializedData.orgUnitName = orgUnitName.trim();
    }

    const response = await fetch(`${getHrApiBase()}/createHrRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(serializedData),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Server responded with status ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const err = await response.json();
          message = err.message ?? message;
        } else {
          message = (await response.text()) || message;
        }
      } catch {
        // keep default message
      }
      return { success: false, message };
    }

    const result = await response.json();
    const ok = result.status === 'OK';
    return {
      success: ok,
      status: result.status,
      message: result.message,
      data: result,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, message: 'Request timed out. Please try again.' };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
