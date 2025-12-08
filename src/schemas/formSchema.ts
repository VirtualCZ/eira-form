import * as yup from 'yup';
import { validateCzechSSN } from '@/lib/czechSSNValidation';

export const getFormSchema = (t: (key: string) => string): yup.ObjectSchema<any> => {
  return yup.object({
    givenCode: yup
      .string()
      .required(t('form.validation.required.givenCode'))
      .min(5, t('form.validation.format.givenCodeLength'))
      .max(10, t('form.validation.format.givenCodeLength')),

    titleBeforeName: yup.string().optional(),
    titleAfterName: yup.string().optional(),

    honorific: yup
      .string()
      .required(t('form.validation.required.honorary')),

    firstName: yup
      .string()
      .required(t('form.validation.required.firstName'))
      .min(2, t('form.validation.format.firstName')),

    lastName: yup
      .string()
      .required(t('form.validation.required.lastName'))
      .min(2, t('form.validation.format.lastName')),

    birthSurname: yup.string().optional(),

    previousSurname: yup.string().optional(),

    dateOfBirth: yup
      .date()
      .required(t('form.validation.required.dateOfBirth'))
      .typeError(t('form.validation.required.dateOfBirth')),

    sex: yup
      .string()
      .oneOf(['male', 'female'], t('form.validation.required.sex'))
      .required(t('form.validation.required.sex')),

    placeOfBirth: yup
      .string()
      .required(t('form.validation.required.placeOfBirth'))
      .min(2, t('form.validation.format.placeOfBirth')),

    maritalStatus: yup
      .string()
      .oneOf(['single', 'married', 'divorced', 'widowed'], t('form.validation.required.maritalStatus'))
      .required(t('form.validation.required.maritalStatus')),

    foreigner: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.foreigner'))
      .required(t('form.validation.required.foreigner')),

    taxIdentificationType: yup
      .string()
      .oneOf(['resident', 'nonResident'], t('form.validation.format.taxIdentificationType'))
      .optional(),

    birthNumber: yup
      .string()
      .required(t('form.validation.required.birthNumber'))
      .test('czech-ssn-format', t('form.validation.format.birthNumberFormatFail'), function(value) {
        if (!value) return false;
        if (!/^\d{6}\/\d{3,4}$/.test(value)) return false;
        const result = validateCzechSSN(value, t);
        if (!result.isValid) {
          // Return the specific error from validateCzechSSN if it exists
          return this.createError({ message: result.error || t('form.validation.format.birthNumberFormatFail') });
        }
        
        // Cross-check with dateOfBirth and sex if available
        const dateOfBirth = this.parent.dateOfBirth;
        const sex = this.parent.sex;
        
        if (dateOfBirth && sex && result.parsedData) {
          const birthYear = dateOfBirth.getFullYear();
          const birthMonth = dateOfBirth.getMonth() + 1;
          const birthDay = dateOfBirth.getDate();
          
          // Check year
          if (result.parsedData.fullYear !== birthYear) {
            return this.createError({ message: t('form.validation.format.birthNumberMatchFail') });
          }
          
          // Check month and day
          if (result.parsedData.month !== birthMonth || result.parsedData.day !== birthDay) {
            return this.createError({ message: t('form.validation.format.birthNumberMatchFail') });
          }
          
          // Check gender
          if (result.parsedData.gender !== sex) {
            return this.createError({ message: t('form.validation.format.birthNumberMatchFail') });
          }
        }
        
        return true;
      }),

    foreignBirthNumber: yup.string().optional(),
    insuranceBirthNumber: yup.number().nullable().optional(),

    passportNumber: yup.string().optional(),
    passportIssuedBy: yup.string().optional(),

    citizenship: yup.number().nullable().optional(),
    nationality: yup.string().optional(),

    permanentStreet: yup
      .string()
      .required(t('form.validation.required.street'))
      .min(1, t('form.validation.format.permanentStreet')),

    permanentHouseNumber: yup
      .number()
      .required(t('form.validation.required.houseNumber'))
      .min(1, t('form.validation.format.permanentHouseNumber'))
      .typeError(t('form.validation.required.houseNumber')),

    permanentOrientationNumber: yup.string().optional(),
    permanentCity: yup
      .string()
      .required(t('form.validation.required.city'))
      .min(1, t('form.validation.format.permanentCity')),

    permanentPostalCode: yup
      .string()
      .required(t('form.validation.required.postalCode'))
      .matches(/^\d+$/, t('form.validation.format.postalCodeNumbersOnly'))
      .min(1, t('form.validation.format.permanentPostalCode')),

    permanentCountry: yup
      .number()
      .required(t('form.validation.required.country'))
      .typeError(t('form.validation.required.country')),

    contactSameAsPermanentAddress: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.contactSameAsPermanentAddress'))
      .required(t('form.validation.required.contactSameAsPermanentAddress')),

    // Contact address fields - conditionally required
    contactStreet: yup
      .string()
      .when('contactSameAsPermanentAddress', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.street')).min(1, t('form.validation.format.permanentStreet')),
        otherwise: (schema) => schema.optional(),
      }),

    contactHouseNumber: yup
      .number()
      .when('contactSameAsPermanentAddress', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.houseNumber')).min(1, t('form.validation.format.permanentHouseNumber')).typeError(t('form.validation.required.houseNumber')),
        otherwise: (schema) => schema.optional(),
      }),

    contactOrientationNumber: yup.string().optional(),
    contactCity: yup
      .string()
      .when('contactSameAsPermanentAddress', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.city')).min(1, t('form.validation.format.permanentCity')),
        otherwise: (schema) => schema.optional(),
      }),

    contactPostalCode: yup
      .string()
      .when('contactSameAsPermanentAddress', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.postalCode')).matches(/^\d+$/, t('form.validation.format.postalCodeNumbersOnly')).min(1, t('form.validation.format.permanentPostalCode')),
        otherwise: (schema) => schema.optional(),
      }),

    contactCountry: yup
      .number()
      .nullable()
      .when('contactSameAsPermanentAddress', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.country')).typeError(t('form.validation.required.country')),
        otherwise: (schema) => schema.optional(),
      }),

    email: yup
      .string()
      .required(t('form.validation.required.email'))
      .email(t('form.validation.format.email'))
      .min(5, t('form.validation.format.email')),

    phone: yup
      .string()
      .required(t('form.validation.required.phone'))
      .matches(/^\+\d{1,3}\d{6,}$/, t('form.validation.format.phone')),

    dataBoxId: yup.string().optional(),

    foreignPermanentAddress: yup.string().optional(),
    residencePermitNumber: yup.number().nullable().optional(),
    residencePermitValidityFrom: yup.date().nullable().optional(),
    residencePermitValidityUntil: yup.date().nullable().optional(),
    residencePermitType: yup.string().optional(),
    residencePermitPurpose: yup.string().optional(),

    employmentClassification: yup.string().optional(),
    jobPosition: yup.string().optional(),

    firstJobInCz: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.firstJobInCz'))
      .required(t('form.validation.required.firstJobInCz')),

    // Last job fields - conditionally required when firstJobInCz === 'no'
    lastEmployer: yup
      .string()
      .when('firstJobInCz', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.lastEmployer')).trim().min(1, t('form.validation.required.lastEmployer')),
        otherwise: (schema) => schema.optional(),
      }),

    lastJobType: yup
      .string()
      .when('firstJobInCz', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.lastJobType')).trim().min(1, t('form.validation.required.lastJobType')),
        otherwise: (schema) => schema.optional(),
      }),

    lastJobPeriodFrom: yup
      .date()
      .when('firstJobInCz', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.lastJobPeriodFrom')).typeError(t('form.validation.required.lastJobPeriodFrom')),
        otherwise: (schema) => schema.optional(),
      }),

    lastJobPeriodTo: yup
      .date()
      .when('firstJobInCz', {
        is: 'no',
        then: (schema) => schema.required(t('form.validation.required.lastJobPeriodTo')).typeError(t('form.validation.required.lastJobPeriodTo')),
        otherwise: (schema) => schema.optional(),
      }),

    bankingInstitutionName: yup
      .string()
      .required(t('form.validation.required.bankingInstitutionName'))
      .min(2, t('form.validation.format.bankingInstitutionName')),

    bankAccountNumber: yup
      .number()
      .required(t('form.validation.required.bankAccountNumber'))
      .min(8, t('form.validation.format.bankAccountNumber'))
      .typeError(t('form.validation.required.bankAccountNumber')),

    bankCode: yup
      .string()
      .oneOf(['-', '0100', '0300', '0600', '0710', '0800', '2010', '2060', '2070', '2100', '2200', '2220', '2250', '2260', '2275', '2600', '2700', '3030', '3050', '3060', '3500', '4000', '4300', '5500', '5800', '6000', '6100', '6200', '6210', '6300', '6700', '6800', '7910', '7950', '7960', '7970', '7990', '8030', '8040', '8060', '8090', '8150', '8190', '8198', '8199', '8200', '8220', '8230', '8240', '8250', '8255', '8265', '8270', '8280', '8291', '8293', '8299', '8500'], t('form.validation.required.bankCode'))
      .required(t('form.validation.required.bankCode')),

    healthInsurance: yup
      .string()
      .oneOf(['-', '111', '201', '205', '207', '208', '211', '213', '333', '747'], t('form.validation.required.healthInsurance'))
      .required(t('form.validation.required.healthInsurance')),

    insuranceRegistrationNumber: yup.number().nullable().optional(),

    highestEducation: yup
      .string()
      .oneOf(['basicEducation', 'vocationalWithoutMatura', 'secondaryOrVocationalWithMatura', 'higherVocational', 'bachelor', 'universityOrHigher', 'mbaOrPostgraduate'], t('form.validation.required.highestEducation'))
      .required(t('form.validation.required.highestEducation')),

    highestEducationSchool: yup
      .string()
      .required(t('form.validation.required.highestEducationSchool'))
      .min(1, t('form.validation.format.highestEducationSchool')),

    fieldOfStudy: yup
      .string()
      .required(t('form.validation.required.fieldOfStudy'))
      .min(1, t('form.validation.format.fieldOfStudy')),

    graduationYear: yup
      .number()
      .required(t('form.validation.required.graduationYear'))
      .min(1000, t('form.validation.format.graduationYear'))
      .max(9999, t('form.validation.format.graduationYear'))
      .typeError(t('form.validation.required.graduationYear')),

    studyCity: yup
      .string()
      .required(t('form.validation.required.studyCity'))
      .min(2, t('form.validation.format.studyCity')),

    languageSkills: yup
      .array()
      .of(
        yup.object({
          language: yup
            .string()
            .required(t('form.validation.required.language'))
            .min(1, t('form.validation.format.language')),
          languageProficiency: yup
            .string()
            .required(t('form.validation.required.languageProficiency'))
            .test('valid-proficiency', t('form.validation.required.languageProficiency'), (val) => 
              val !== undefined && val !== null && val !== 'none' && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'].includes(val)
            ),
          languageExamType: yup
            .string()
            .when('languageProficiency', {
              is: (val: string) => val && val !== 'none' && val !== 'native' && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(val),
              then: (schema) => schema.required(t('form.validation.required.languageExamType')).trim().min(1, t('form.validation.required.languageExamType')),
              otherwise: (schema) => schema.optional(),
            }),
        })
      )
      .required(t('form.validation.required.languageSkills'))
      .min(1, t('form.validation.required.languageSkills')),

    hasDisability: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.hasDisability'))
      .required(t('form.validation.required.hasDisability')),

    disabilityType: yup.string().optional(),
    disabilityDecisionDate: yup.date().nullable().optional(),

    receivesPension: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.receivesPension'))
      .required(t('form.validation.required.receivesPension')),

    pensionType: yup
      .string()
      .oneOf(['-', 'oldAgePension', 'earlyOldAgePension', 'fullDisabilityPension', 'partialDisabilityPension', 'widowsPension', 'widowersPension', 'orphansPension'], t('form.validation.required.pensionType'))
      .optional(),

    pensionDecisionDate: yup.date().nullable().optional(),

    activityBan: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.activityBan'))
      .required(t('form.validation.required.activityBan')),

    bannedActivity: yup.string().optional(),

    hasWageDeductions: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.hasWageDeductions'))
      .required(t('form.validation.required.hasWageDeductions')),

    wageDeductionDetails: yup.string().optional(),
    wageDeductionDate: yup.date().nullable().optional(),

    claimChildTaxRelief: yup
      .string()
      .oneOf(['yes', 'no'], t('form.validation.required.claimChildTaxRelief'))
      .required(t('form.validation.required.claimChildTaxRelief')),

    childrenInfo: yup
      .array()
      .of(
        yup.object({
          childrenInfoFullName: yup
            .string()
            .required(t('form.validation.required.childrenInfoFullName'))
            .min(1, t('form.validation.format.childrenInfoFullName')),
          childrenInfoBirthNumber: yup
            .string()
            .required(t('form.validation.required.childrenInfoBirthNumber'))
            .matches(/^\d{6}\/\d{3,4}$/, t('form.validation.format.birthNumberFormatFail'))
            .test('child-birth-number-validity', t('form.validation.format.birthNumberDiversibilityFail'), function(value) {
              if (!value) return false;
              const [front, back] = value.split('/');
              if (!front || !back) return false;
              if (back.length === 4) {
                const rcNumber = parseInt(front + back, 10);
                if (rcNumber % 11 === 0) return true;
                if (rcNumber % 11 === 10 && back[3] === '0') return true;
                return false;
              }
              return true;
            }),
        })
      )
      .optional(),

    // Document fields - conditionally required
    visaPassport: yup
      .array()
      .of(yup.string())
      .when('foreigner', {
        is: 'yes',
        then: (schema) => schema.min(1, t('form.validation.required.visaPassport')).required(t('form.validation.required.visaPassport')),
        otherwise: (schema) => schema.optional(),
      }),

    travelDocumentCopy: yup.array().of(yup.string()).optional(),
    residencePermitCopy: yup.array().of(yup.string()).optional(),
    highestEducationDocument: yup.array().of(yup.string()).optional(),

    childBirthCertificate1: yup
      .array()
      .of(yup.string())
      .when(['claimChildTaxRelief', 'childrenInfo'], {
        is: (claimChildTaxRelief: string, childrenInfo: any[]) => claimChildTaxRelief === 'yes' && childrenInfo && childrenInfo.length > 0,
        then: (schema) => schema.min(1, t('form.validation.required.childBirthCertificate')).required(t('form.validation.required.childBirthCertificate')),
        otherwise: (schema) => schema.optional(),
      }),

    childBirthCertificate2: yup.array().of(yup.string()).optional(),
    childBirthCertificate3: yup.array().of(yup.string()).optional(),
    childBirthCertificate4: yup.array().of(yup.string()).optional(),
    childTaxReliefConfirmation: yup.array().of(yup.string()).optional(),

    pensionDecision: yup
      .array()
      .of(yup.string())
      .when('receivesPension', {
        is: 'yes',
        then: (schema) => schema.min(1, t('form.validation.required.pensionDecision')).required(t('form.validation.required.pensionDecision')),
        otherwise: (schema) => schema.optional(),
      }),

    employmentConfirmation: yup.array().of(yup.string()).optional(),

    confirmationReadEmployeeDeclaration: yup
      .boolean()
      .required(t('form.validation.required.confirmationReadEmployeeDeclaration'))
      .oneOf([true], t('form.validation.required.confirmationReadEmployeeDeclaration')),

    confirmationReadEmailAddressDeclaration: yup
      .boolean()
      .required(t('form.validation.required.confirmationReadEmailAddressDeclaration'))
      .oneOf([true], t('form.validation.required.confirmationReadEmailAddressDeclaration')),

    confirmationReadPersonalDataProcessing: yup
      .boolean()
      .required(t('form.validation.required.confirmationReadPersonalDataProcessing'))
      .oneOf([true], t('form.validation.required.confirmationReadPersonalDataProcessing')),
  });
};

// Export type inferred from Yup schema
export type FormData = yup.InferType<ReturnType<typeof getFormSchema>>;
