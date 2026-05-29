// Utilities for checking if a field/value contains meaningful data

import { FormData } from '@/schemas/formSchema';
import type { TabConfig } from '@/config/tabConfigs';
import { isGas, isIcuk } from '@/config/formVariants';

const isNonEmptyString = (val: unknown): boolean =>
  typeof val === 'string' && val.trim() !== '' && val.trim() !== 'none';

const isNonNullObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const arrayHasData = (arr: unknown[]): boolean => {
  if (arr.length === 0) return false;
  return arr.some((item) => hasFieldData(item));
};

/** UI placeholder value for unset bank / health insurance selects. */
export const SELECT_PLACEHOLDER = '0';

export const hasFieldData = (val: unknown): boolean => {
  if (val === undefined || val === null) return false;
  if (val === SELECT_PLACEHOLDER) return false;
  if (Array.isArray(val)) return arrayHasData(val);
  // Date objects are valid data if they're valid Date instances
  if (val instanceof Date) return !isNaN(val.getTime());
  if (isNonNullObject(val)) return Object.values(val).some(hasFieldData);
  if (typeof val === 'string') return isNonEmptyString(val);
  // numbers, booleans are considered data if present
  return true;
};

export const hasMeaningfulFieldData = (field: keyof FormData | string, val: unknown): boolean => {
  if ((field === 'bankCode' || field === 'healthInsurance') && val === SELECT_PLACEHOLDER) {
    return false;
  }
  return hasFieldData(val);
};

/**
 * Determines if a field is visible based on conditional logic in the form
 * This matches the logic used in useTabNavigation.ts
 */
export const isFieldVisible = (field: keyof FormData, formData: Partial<FormData>): boolean => {
  if (field === 'taxIdentificationType' && isIcuk()) {
    return false;
  }

  const icukOnlyFields = [
    'idCardNumber', 'idCardIssuedBy', 'hasOtherEmployment', 'otherEmployerName', 'otherEmployerSeat',
    'registeredAtLaborOffice', 'isStudent', 'spouseFullName',
    'criminalRecordExtract', 'laborOfficeEvidenceConfirmation', 'studyConfirmation',
  ];
  if (icukOnlyFields.includes(field as string) && !isIcuk()) {
    return false;
  }

  if (field === 'idCardNumber' || field === 'idCardIssuedBy') {
    return isIcuk() && formData.foreigner !== 'yes';
  }

  if (field === 'otherEmployerName' || field === 'otherEmployerSeat') {
    return isIcuk() && formData.hasOtherEmployment === 'yes';
  }

  if (field === 'laborOfficeEvidenceConfirmation') {
    return isIcuk() && formData.registeredAtLaborOffice === 'yes';
  }

  if (field === 'studyConfirmation') {
    return isIcuk() && formData.isStudent === 'yes';
  }

  if (field === 'criminalRecordExtract') {
    return isIcuk();
  }

  // Foreigner-specific fields only when foreigner === 'yes'
  const foreignerFields = ['foreignBirthNumber', 'insuranceBirthNumber', 'passportNumber', 'passportIssuedBy', 'passportValidityUntil'];
  if (foreignerFields.includes(field as string)) {
    return formData.foreigner === 'yes';
  }
  
  // Birth number (SSN) only when foreigner === 'no'
  if (field === 'birthNumber') {
    return formData.foreigner !== 'yes';
  }
  
  // Foreigner document fields only when foreigner === 'yes'
  const foreignerDocumentFields = ['visaPassport', 'travelDocumentCopy', 'residencePermitCopy'];
  if (foreignerDocumentFields.includes(field as string)) {
    return formData.foreigner === 'yes';
  }
  
  // Contact address fields only when contactSameAsPermanentAddress === 'no'
  const contactFields = ['contactStreet', 'contactHouseNumber', 'contactOrientationNumber', 'contactCity', 'contactPostalCode', 'contactCountry'];
  if (contactFields.includes(field as string)) {
    return formData.contactSameAsPermanentAddress === 'no';
  }
  
  // Disability fields only when hasDisability === 'yes'
  if (field === 'disabilityType' || field === 'disabilityDecisionDate') {
    return formData.hasDisability === 'yes';
  }
  
  // Pension fields only when receivesPension === 'yes'
  if (field === 'pensionType' || field === 'pensionDecisionDate' || field === 'pensionDecision') {
    return formData.receivesPension === 'yes';
  }
  
  // Last job fields only when firstJobInCz === 'no'
  if (field === 'lastEmployer' || field === 'lastJobType' || field === 'lastJobPeriodFrom' || field === 'lastJobPeriodTo') {
    return formData.firstJobInCz === 'no';
  }
  
  // Banned activity only when activityBan === 'yes'
  if (field === 'bannedActivity') {
    return formData.activityBan === 'yes';
  }
  
  // Wage deduction fields only when hasWageDeductions === 'yes'
  if (field === 'wageDeductionDetails' || field === 'wageDeductionDate') {
    return formData.hasWageDeductions === 'yes';
  }
  
  // Child tax relief fields only when claimChildTaxRelief === 'yes'
  if (field === 'childBirthCertificate1' || field === 'childBirthCertificate2' || 
      field === 'childBirthCertificate3' || field === 'childBirthCertificate4' || 
      field === 'childTaxReliefConfirmation') {
    return formData.claimChildTaxRelief === 'yes';
  }
  
  // Default: field is visible
  return true;
};

/**
 * Filters out hidden fields from form data based on conditional visibility logic
 */
/** Fields that stay optional in all variants (never counted toward progress). */
const ALWAYS_OPTIONAL_FIELDS = new Set<string>([
  'titleBeforeName', 'titleAfterName', 'birthSurname', 'previousSurname',
  'foreignBirthNumber', 'insuranceBirthNumber', 'passportNumber', 'passportIssuedBy', 'passportValidityUntil',
  'citizenship', 'nationality',
  'permanentOrientationNumber', 'contactOrientationNumber',
  'dataBoxId',
  'residencePermitValidityFrom', 'residencePermitValidityUntil', 'residencePermitType', 'residencePermitPurpose',
  'jobPosition',
  'childrenInfo',
  'childBirthCertificate2', 'childBirthCertificate3', 'childBirthCertificate4',
  'spouseFullName',
  // Optional in GAS; ICUK may require some of these via isDocumentRequiredForProgress
  'highestEducationDocument', 'employmentConfirmation', 'childTaxReliefConfirmation',
  'travelDocumentCopy', 'residencePermitCopy',
]);

const isDocumentRequiredForProgress = (field: keyof FormData, formData: Partial<FormData>): boolean => {
  if (field === 'visaPassport' && formData.foreigner === 'yes') return true;
  if (field === 'pensionDecision' && formData.receivesPension === 'yes') return true;
  if (field === 'childBirthCertificate1' && formData.claimChildTaxRelief === 'yes') {
    const numChildren = (formData.childrenInfo as unknown[])?.length || 0;
    return numChildren > 0;
  }
  if (!isIcuk()) return false;
  if (field === 'highestEducationDocument' || field === 'employmentConfirmation' || field === 'criminalRecordExtract') {
    return true;
  }
  if ((field === 'travelDocumentCopy' || field === 'residencePermitCopy') && formData.foreigner === 'yes') {
    return true;
  }
  if (field === 'childTaxReliefConfirmation' && formData.claimChildTaxRelief === 'yes') return true;
  if (field === 'laborOfficeEvidenceConfirmation' && formData.registeredAtLaborOffice === 'yes') return true;
  if (field === 'studyConfirmation' && formData.isStudent === 'yes') return true;
  return false;
};

/**
 * Whether a field counts toward form completion progress (visible + currently required).
 */
export const isFieldRequiredForProgress = (field: keyof FormData, formData: Partial<FormData>): boolean => {
  if (!isFieldVisible(field, formData)) return false;

  if (ALWAYS_OPTIONAL_FIELDS.has(field as string)) {
    return isDocumentRequiredForProgress(field, formData);
  }

  if (field === 'taxIdentificationType') {
    return isGas();
  }

  if (isDocumentRequiredForProgress(field, formData)) return true;

  if (field === 'bannedActivity') return formData.activityBan === 'yes';
  if (field === 'wageDeductionDetails' || field === 'wageDeductionDate') {
    return formData.hasWageDeductions === 'yes';
  }

  if (field === 'disabilityType' || field === 'disabilityDecisionDate') {
    return formData.hasDisability === 'yes';
  }
  if (field === 'pensionType' || field === 'pensionDecisionDate') {
    return formData.receivesPension === 'yes';
  }

  if (field === 'idCardNumber' || field === 'idCardIssuedBy') {
    return isIcuk() && formData.foreigner === 'no';
  }
  if (field === 'otherEmployerName' || field === 'otherEmployerSeat') {
    return isIcuk() && formData.hasOtherEmployment === 'yes';
  }

  if (typeof field === 'string' && field.startsWith('confirmationRead')) {
    return true;
  }

  return true;
};

export const calculateFormProgress = (
  formData: Partial<FormData>,
  formErrors: Record<string, unknown> | undefined,
  visibleTabs: TabConfig[]
): number => {
  const required = new Set<keyof FormData>();

  visibleTabs.forEach((tab) => {
    tab.fields.forEach((f) => {
      const field = f as keyof FormData;
      if (isFieldRequiredForProgress(field, formData)) {
        required.add(field);
      }
    });
  });

  required.delete('givenCode' as keyof FormData);
  required.delete('_timestamp' as keyof FormData);

  const total = required.size;
  if (total === 0) return 0;

  let validCount = 0;
  required.forEach((field) => {
    const value = (formData as Record<string, unknown>)[field as string];
    const hasError = Boolean(formErrors?.[field as string]);
    if (hasMeaningfulFieldData(field as string, value) && !hasError) validCount++;
  });

  return Math.round((validCount / total) * 100);
};

export const filterVisibleFields = (data: Partial<FormData>): Partial<FormData> => {
  const filtered: Partial<FormData> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const fieldKey = key as string;
    if (isFieldVisible(fieldKey as keyof FormData, data)) {
      (filtered as Record<string, unknown>)[fieldKey] = value;
    }
  }
  
  return filtered;
};



