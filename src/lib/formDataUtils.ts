// Utilities for checking if a field/value contains meaningful data

import { FormData } from '@/schemas/formSchema';

const isNonEmptyString = (val: unknown): boolean =>
  typeof val === 'string' && val.trim() !== '' && val.trim() !== 'none';

const isNonNullObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const arrayHasData = (arr: unknown[]): boolean => {
  if (arr.length === 0) return false;
  return arr.some((item) => hasFieldData(item));
};

export const hasFieldData = (val: unknown): boolean => {
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return arrayHasData(val);
  // Date objects are valid data if they're valid Date instances
  if (val instanceof Date) return !isNaN(val.getTime());
  if (isNonNullObject(val)) return Object.values(val).some(hasFieldData);
  if (typeof val === 'string') return isNonEmptyString(val);
  // numbers, booleans are considered data if present
  return true;
};

/**
 * Determines if a field is visible based on conditional logic in the form
 * This matches the logic used in useTabNavigation.ts
 */
export const isFieldVisible = (field: keyof FormData, formData: Partial<FormData>): boolean => {
  // Foreigner-specific fields only when foreigner === 'yes'
  const foreignerFields = ['foreignBirthNumber', 'insuranceBirthNumber', 'passportNumber', 'passportIssuedBy', 'taxIdentificationType'];
  if (foreignerFields.includes(field as string)) {
    return formData.foreigner === 'yes';
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



