import { FormData } from '@/schemas/formSchema';
import { isIcuk } from '@/config/formVariants';

export interface TabConfig {
  id: string;
  label: string;
  fields: string[];
  isVisible: (data: Partial<FormData>) => boolean;
  isComplete: (data: Partial<FormData>, errors: Record<string, unknown>) => boolean;
}

const GAS_TAB_CONFIGS: TabConfig[] = [
  {
    id: 'personalInformation',
    label: 'form.tabs.personalInformation',
    fields: [
      'titleBeforeName', 'titleAfterName', 'honorific', 'firstName', 'lastName', 'birthSurname',
      'previousSurname', 'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus', 'foreigner',
      'taxIdentificationType', 'birthNumber', 'foreignBirthNumber', 'insuranceBirthNumber',
      'passportNumber', 'passportIssuedBy', 'passportValidityUntil', 'citizenship', 'nationality',
      'bankingInstitutionName', 'bankAccountNumber', 'bankCode', 'healthInsurance',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = [
        'honorific', 'firstName', 'lastName', 'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus',
        'foreigner', 'taxIdentificationType', 'birthNumber',
      ];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'addresses',
    label: 'form.tabs.addresses',
    fields: [
      'permanentStreet', 'permanentHouseNumber', 'permanentOrientationNumber', 'permanentCity',
      'permanentPostalCode', 'permanentCountry', 'contactSameAsPermanentAddress',
      'contactStreet', 'contactHouseNumber', 'contactOrientationNumber', 'contactCity',
      'contactPostalCode', 'contactCountry',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = [
        'permanentStreet', 'permanentHouseNumber', 'permanentCity', 'permanentPostalCode',
        'permanentCountry', 'contactSameAsPermanentAddress',
      ];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'contacts',
    label: 'form.tabs.contacts',
    fields: ['email', 'phone', 'dataBoxId'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['email', 'phone'];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'foreigners',
    label: 'form.tabs.foreigners',
    fields: [
      'foreignPermanentAddress', 'residencePermitNumber', 'residencePermitValidityFrom',
      'residencePermitValidityUntil', 'residencePermitType', 'residencePermitPurpose',
    ],
    isVisible: (data) => data.foreigner === 'yes',
    isComplete: (data, errors) => {
      if (data.foreigner !== 'yes') return true;
      const requiredFields = ['foreignPermanentAddress', 'residencePermitNumber'];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'employment',
    label: 'form.tabs.employment',
    fields: ['jobPosition', 'firstJobInCz', 'lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const baseRequired = ['firstJobInCz'];
      const extraIfNo = ['lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'];
      const requiredFields = data.firstJobInCz === 'no' ? [...baseRequired, ...extraIfNo] : baseRequired;
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'educationAndLanguages',
    label: 'form.tabs.educationAndLanguages',
    fields: [
      'highestEducation', 'highestEducationSchool', 'fieldOfStudy', 'graduationYear', 'studyCity', 'languageSkills',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['highestEducation', 'highestEducationSchool', 'fieldOfStudy', 'graduationYear', 'studyCity'];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'healthAndSocialInfo',
    label: 'form.tabs.healthAndSocialInfo',
    fields: [
      'hasDisability', 'disabilityType', 'disabilityDecisionDate', 'receivesPension',
      'pensionType', 'pensionDecisionDate', 'claimTaxDiscount',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const baseRequired = ['hasDisability', 'receivesPension', 'claimTaxDiscount'];
      const extraDisability = ['disabilityType', 'disabilityDecisionDate'];
      const extraPension = ['pensionType', 'pensionDecisionDate'];
      const requiredWhenYes: string[] = [];
      if (data.hasDisability === 'yes') requiredWhenYes.push(...extraDisability);
      if (data.receivesPension === 'yes') requiredWhenYes.push(...extraPension);
      const requiredFields = [...baseRequired, ...requiredWhenYes];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'legalInfo',
    label: 'form.tabs.legalInfo',
    fields: ['activityBan', 'bannedActivity', 'hasWageDeductions', 'wageDeductionDetails', 'wageDeductionDate'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['activityBan', 'hasWageDeductions'];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'familyAndChildren',
    label: 'form.tabs.familyAndChildren',
    fields: ['claimChildTaxRelief', 'childrenInfo'],
    isVisible: () => true,
    isComplete: (data, errors) =>
      Boolean((data as Record<string, unknown>).claimChildTaxRelief && !errors.claimChildTaxRelief),
  },
  {
    id: 'documents',
    label: 'form.tabs.documents',
    fields: [
      'visaPassport', 'travelDocumentCopy', 'residencePermitCopy', 'highestEducationDocument',
      'childBirthCertificate1', 'childBirthCertificate2', 'childBirthCertificate3', 'childBirthCertificate4',
      'childTaxReliefConfirmation', 'pensionDecision', 'employmentConfirmation',
    ],
    isVisible: () => true,
    isComplete: (data, _errors): boolean => {
      if (data.foreigner === 'yes' && (!data.visaPassport || data.visaPassport.length === 0)) return false;
      if (data.receivesPension === 'yes' && (!data.pensionDecision || data.pensionDecision.length === 0)) return false;
      if (data.claimChildTaxRelief === 'yes') {
        const numChildren = data.childrenInfo?.length || 0;
        if (numChildren > 0 && !(data.childBirthCertificate1?.length ?? 0)) return false;
      }
      return true;
    },
  },
  {
    id: 'agreements',
    label: 'form.tabs.agreements',
    fields: [
      'confirmationReadEmployeeDeclaration',
      'confirmationReadEmailAddressDeclaration',
      'confirmationReadPersonalDataProcessing',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = [
        'confirmationReadEmployeeDeclaration',
        'confirmationReadEmailAddressDeclaration',
        'confirmationReadPersonalDataProcessing',
      ];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] === true && !errors[field]);
    },
  },
];

const ICUK_TAB_CONFIGS: TabConfig[] = [
  {
    id: 'personalInformation',
    label: 'form.tabs.personalInformation',
    fields: [
      'titleBeforeName', 'titleAfterName', 'honorific', 'firstName', 'lastName', 'birthSurname',
      'previousSurname', 'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus', 'foreigner',
      'birthNumber', 'idCardNumber', 'idCardIssuedBy', 'foreignBirthNumber', 'insuranceBirthNumber',
      'passportNumber', 'passportIssuedBy', 'passportValidityUntil', 'citizenship', 'nationality',
      'bankingInstitutionName', 'bankAccountNumber', 'bankCode', 'healthInsurance',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = [
        'honorific', 'firstName', 'lastName', 'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus', 'foreigner',
      ];
      const baseOk = requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
      if (!baseOk) return false;
      if (data.foreigner !== 'yes') {
        return Boolean(
          (data as Record<string, unknown>).birthNumber &&
            !errors.birthNumber &&
            (data as Record<string, unknown>).idCardNumber &&
            !errors.idCardNumber &&
            (data as Record<string, unknown>).idCardIssuedBy &&
            !errors.idCardIssuedBy
        );
      }
      return true;
    },
  },
  ...GAS_TAB_CONFIGS.slice(1, 3),
  {
    id: 'employment',
    label: 'form.tabs.employment',
    fields: [
      'jobPosition', 'firstJobInCz', 'lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo',
      'hasOtherEmployment', 'otherEmployerName', 'otherEmployerSeat', 'registeredAtLaborOffice', 'isStudent',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const required = ['firstJobInCz', 'hasOtherEmployment', 'registeredAtLaborOffice', 'isStudent'];
      if (!required.every((f) => (data as Record<string, unknown>)[f] && !errors[f])) return false;
      if (data.firstJobInCz === 'no') {
        const lastJob = ['lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'];
        if (!lastJob.every((f) => (data as Record<string, unknown>)[f] && !errors[f])) return false;
      }
      if (data.hasOtherEmployment === 'yes') {
        const other = ['otherEmployerName', 'otherEmployerSeat'];
        if (!other.every((f) => (data as Record<string, unknown>)[f] && !errors[f])) return false;
      }
      return true;
    },
  },
  ...GAS_TAB_CONFIGS.slice(5, 7),
  {
    id: 'legalInfo',
    label: 'form.tabs.legalInfo',
    fields: ['inInsolvency', 'hasWageDeductions', 'wageDeductionDetails', 'wageDeductionDate'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['inInsolvency', 'hasWageDeductions'];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] && !errors[field]);
    },
  },
  {
    id: 'familyAndChildren',
    label: 'form.tabs.familyAndChildren',
    fields: ['claimChildTaxRelief', 'spouseFullName', 'spouseDateOfBirth', 'spouseResidence', 'spouseEmployer', 'childrenInfo'],
    isVisible: () => true,
    isComplete: (data, errors) =>
      Boolean((data as Record<string, unknown>).claimChildTaxRelief && !errors.claimChildTaxRelief),
  },
  {
    id: 'documents',
    label: 'form.tabs.documents',
    fields: [
      'visaPassport', 'travelDocumentCopy', 'residencePermitCopy', 'highestEducationDocument',
      'childBirthCertificate1', 'childBirthCertificate2', 'childBirthCertificate3', 'childBirthCertificate4',
      'childTaxReliefConfirmation', 'pensionDecision', 'employmentConfirmation',
      'criminalRecordExtract', 'laborOfficeEvidenceConfirmation', 'studyConfirmation',
    ],
    isVisible: () => true,
    isComplete: (data, _errors): boolean => {
      if (!(data.highestEducationDocument?.length ?? 0)) return false;
      if (!(data.employmentConfirmation?.length ?? 0)) return false;
      if (!(data.criminalRecordExtract?.length ?? 0)) return false;
      if (data.foreigner === 'yes') {
        if (!(data.visaPassport?.length ?? 0)) return false;
        if (!(data.travelDocumentCopy?.length ?? 0)) return false;
        if (!(data.residencePermitCopy?.length ?? 0)) return false;
      }
      if (data.receivesPension === 'yes' && !(data.pensionDecision?.length ?? 0)) return false;
      if (data.claimChildTaxRelief === 'yes') {
        if (!(data.childTaxReliefConfirmation?.length ?? 0)) return false;
        const numChildren = data.childrenInfo?.length || 0;
        if (numChildren > 0 && !(data.childBirthCertificate1?.length ?? 0)) return false;
      }
      if (data.registeredAtLaborOffice === 'yes' && !(data.laborOfficeEvidenceConfirmation?.length ?? 0)) return false;
      if (data.isStudent === 'yes' && !(data.studyConfirmation?.length ?? 0)) return false;
      return true;
    },
  },
  {
    id: 'agreements',
    label: 'form.tabs.agreements',
    fields: [
      'confirmationReadEmployeeDeclaration',
      'confirmationReadEmailAddressDeclaration',
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = [
        'confirmationReadEmployeeDeclaration',
        'confirmationReadEmailAddressDeclaration',
      ];
      return requiredFields.every((field) => (data as Record<string, unknown>)[field] === true && !errors[field]);
    },
  },
];

export const getTabConfigs = (): TabConfig[] => (isIcuk() ? ICUK_TAB_CONFIGS : GAS_TAB_CONFIGS);
