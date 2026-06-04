import { getFormVariant } from '@/config/formVariants';
import { FormData } from '@/schemas/formSchema';
import { getHrBasicAuthHeader } from '@/services/hrAuth';

/** Relative REST base — same origin in prod; Vite dev proxy forwards /rest/sm to JBoss. */
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

export async function getCodeInfo(code: string): Promise<CodeInfoResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const auth = getHrBasicAuthHeader();

  try {
    const response = await fetch(`${getHrApiBase()}/getCodeInfo/${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
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
