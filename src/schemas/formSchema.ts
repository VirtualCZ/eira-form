import { z } from "zod";

export const getFormSchema = (t: (key: string) => string) => z.object({
    companyCode: z.string({
        required_error: t('form.validation.required.companyCode')
    })
        .length(5, {
            message: t('form.validation.format.companyCodeLength')
        })
        .regex(/^[a-zA-Z0-9]{5}$/, {
            message: t('form.validation.format.companyCode')
    }),
    titleBeforeName: z.string().optional(),
    titleAfterName: z.string().optional(),
    honorific: z.string({
        required_error: t('form.validation.required.honorary'),
    }),
    firstName: z.string({
        required_error: t('form.validation.required.firstName'),
    }).min(2, {
        message: t('form.validation.format.firstName'),
    }),
    lastName: z.string({
        required_error: t('form.validation.required.lastName'),
    }).min(2, {
        message: t('form.validation.format.lastName'),
    }),
    birthSurname: z.string().min(2, {
        message: t('form.validation.format.birthSurname'),
    }).optional(),
    dateOfBirth: z.date({
        required_error: t('form.validation.required.dateOfBirth'),
    }),
    sex: z.enum(["male", "female"], {
        required_error: t('form.validation.required.sex'),
    }),
    placeOfBirth: z.string({
        required_error: t('form.validation.required.placeOfBirth'),
    }).min(2, {
        message: t('form.validation.format.placeOfBirth'),
    }),
    maritalStatus: z.enum(
        ["single", "married", "divorced", "widowed"], {
        required_error: t('form.validation.required.maritalStatus'),
    }),

    foreigner: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.foreigner'),
    }),

    birthNumber: z.string({
        required_error: t('form.validation.required.birthNumber'),
    }).regex(/^\d{6}\/\d{4}$/, {
        message: t('form.validation.format.birthNumber'),
    }),
    foreignBirthNumber: z.string().optional(),
    insuranceBirthNumber: z.number().optional(),
    // idCardNumber: z.string({
    //   required_error: t('form.validation.required.idCardNumber'),
    // }).min(1, {
    //   message: t('form.validation.format.idCardNumber'),
    // }),
    // idCardIssuedBy: z.string({
    //   required_error: t('form.validation.required.idCardIssuedBy'),
    // }).min(1, {
    //   message: t('form.validation.format.idCardIssuedBy'),
    // }),
    passportNumber: z.string().optional(),
    passportIssuedBy: z.string().optional(),

    citizenship: z.string().optional(),
    nationality: z.string().optional(),

    permanentStreet: z.string({
        required_error: t('form.validation.required.street'),
    }).min(1, {
        message: t('form.validation.format.permanentStreet'),
    }),
    permanentHouseNumber: z.number({
        required_error: t('form.validation.required.houseNumber'),
    }).min(1, {
        message: t('form.validation.format.permanentHouseNumber'),
    }),
    permanentOrientationNumber: z.string().optional(),
    permanentCity: z.string({
        required_error: t('form.validation.required.city'),
    }).min(1, {
        message: t('form.validation.format.permanentCity'),
    }),
    permanentPostalCode: z.number({
        required_error: t('form.validation.required.postalCode'),
    }).min(1, {
        message: t('form.validation.format.permanentPostalCode'),
    }),
    permanentCountry: z.string({
        required_error: t('form.validation.required.country'),
    }).min(1, {
        message: t('form.validation.format.permanentCountry'),
    }),

    contactSameAsPermanentAddress: z.enum(["yes", "no"]).optional(),

    contactStreet: z.string().optional(),
    contactHouseNumber: z.number().optional(),
    contactOrientationNumber: z.string().optional(),
    contactCity: z.string().optional(),
    contactPostalCode: z.number().optional(),
    contactCountry: z.string().optional(),

    email: z.string({
        required_error: t('form.validation.required.email'),
    }).email().min(5, {
        message: t('form.validation.format.email'),
    }),
    phone: z.string({
        required_error: t('form.validation.required.phone'),
    }).refine(val => /^\+\d{1,3}\d{6,}$/.test(val), {
        message: t('form.validation.format.phone'),
    }),
    dataBoxId: z.string().optional(),

    foreignPermanentAddress: z.string().optional(),
    residencePermitNumber: z.number().optional(),
    residencePermitValidityFrom: z.date().optional(),
    residencePermitValidityUntil: z.date().optional(),
    residencePermitType: z.string().optional(),
    residencePermitPurpose: z.string().optional(),

    employmentClassification: z.string({
        required_error: t('form.validation.required.employmentClassification'),
    }).min(2, {
        message: t('form.validation.format.employmentClassification'),
    }),
    jobPosition: z.string({
        required_error: t('form.validation.required.jobPosition'),
    }).min(2, {
        message: t('form.validation.format.jobPosition'),
    }),
    firstJobInCz: z.enum(["yes", "no"]).optional(),
    lastEmployer: z.string({
        required_error: t('form.validation.required.lastEmployer'),
    }),
    lastJobType: z.string({
        required_error: t('form.validation.required.lastJobType'),
    }).min(2, {
        message: t('form.validation.format.lastJobType'),
    }),
    lastJobPeriodFrom: z.date(
        {
            required_error: t('form.validation.required.lastJobPeriodFrom'),
        }
    ),
    lastJobPeriodTo: z.date(
        {
            required_error: t('form.validation.required.lastJobPeriodTo'),
        }
    ),
    bankingInstitutionName: z.string({
        required_error: t('form.validation.required.bankingInstitutionName'),
    }).min(2, {
        message: t('form.validation.format.bankingInstitutionName'),
    }),
    bankAccountNumber: z.number({
        required_error: t('form.validation.required.bankAccountNumber'),
    }).min(8, {
        message: t('form.validation.format.bankAccountNumber'),
    }),
    bankCode: z.enum(["-", "0100", "0300", "0600", "0710", "0800", "2010", "2060", "2070", "2100", "2200", "2220", "2250", "2260", "2275", "2600", "2700", "3030", "3050", "3060", "3500", "4000", "4300", "5500", "5800", "6000", "6100", "6200", "6210", "6300", "6700", "6800", "7910", "7950", "7960", "7970", "7990", "8030", "8040", "8060", "8090", "8150", "8190", "8198", "8199", "8200", "8220", "8230", "8240", "8250", "8255", "8265", "8270", "8280", "8291", "8293", "8299", "8500"],
        {
            required_error: t('form.validation.required.bankCode'),
        }
    ),
    healthInsurance: z.enum(["-", "111", "201", "205", "207", "208", "211", "213", "333", "747"],
        {
            required_error: t('form.validation.required.healthInsurance'),
        }
    ),

    insuranceRegistrationNumber: z.number().optional(),

    highestEducation: z.enum(["basicEducation", "vocationalWithoutMatura", "secondaryOrVocationalWithMatura", "higherVocational", "bachelor", "universityOrHigher", "mbaOrPostgraduate"], {
        required_error: t('form.validation.required.highestEducation'),
    }),
    highestEducationSchool: z.string({
        required_error: t('form.validation.required.highestEducationSchool'),
    }).min(1, {
        message: t('form.validation.format.highestEducationSchool'),
    }),
    fieldOfStudy: z.string({
        required_error: t('form.validation.required.fieldOfStudy'),
    }).min(1, {
        message: t('form.validation.format.fieldOfStudy'),
    }),
    graduationYear: z.number({
        required_error: t('form.validation.required.graduationYear'),
    }).refine(val => val >= 1000 && val <= 9999, {
        message: t('form.validation.format.graduationYear'),
    }),
    studyCity: z.string({
        required_error: t('form.validation.required.studyCity'),
    }).min(2, {
        message: t('form.validation.format.studyCity'),
    }),

    languageSkills: z.array(z.object({
        language: z.string({
            required_error: t('form.validation.required.language'),
        }).min(1, {
            message: t('form.validation.format.language'),
        }),
        languageProficiency: z.enum(["-", "A1", "A2", "B1", "B2", "C1", "C2", "native"],
            {
                required_error: t('form.validation.required.languageProficiency'),
            }
        ),
        languageExamType: z.string({
            required_error: t('form.validation.required.languageExamType'),
        }).min(1, {
            message: t('form.validation.format.languageExamType'),
        }),
    })).optional(),
    hasDisability: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.hasDisability'),
    }),
    disabilityType: z.string().optional(),
    disabilityDecisionDate: z.date().optional(),
    receivesPension: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.receivesPension'),
    }),
    pensionType: z.enum(["-", "oldAgePension", "earlyOldAgePension", "fullDisabilityPension", "partialDisabilityPension", "widowsPension", "widowersPension", "orphansPension"],
        {
            required_error: t('form.validation.required.pensionType'),
        }
    ).optional(),
    pensionDecisionDate: z.date().optional(),

    activityBan: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.activityBan'),
    }),
    bannedActivity: z.string().optional(),
    hasWageDeductions: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.hasWageDeductions'),
    }),
    wageDeductionDetails: z.string().optional(),
    claimChildTaxRelief: z.enum(["yes", "no"], {
        required_error: t('form.validation.required.claimChildTaxRelief'),
    }),
    childrenInfo: z.array(z.object({
        childrenInfoFullName: z.string({
            required_error: t('form.validation.required.childrenInfoFullName'),
        }).min(1, {
            message: t('form.validation.format.childrenInfoFullName'),
        }),
        childrenInfoBirthNumber: z.string({
            required_error: t('form.validation.required.childrenInfoBirthNumber'),
        }).min(1, {
            message: t('form.validation.format.childrenInfoBirthNumber'),
        }),
    })).optional(),

    foodPass: z.array(z.string()).optional(),
    travelDocumentCopy: z.array(z.string()).optional(),
    residencePermitCopy: z.array(z.string()).optional(),
    educationCertificate: z.array(z.string().min(1, {
        message: t('form.validation.required.educationCertificate')
    })).min(1, {
        message: t('form.validation.required.educationCertificate')
    }),
    wageDeductionDecision: z.array(z.string()).optional(),

    confirmationReadEmployeeDeclaration: z.boolean().refine(val => val === true, {
        message: t('form.validation.required.confirmationReadEmployeeDeclaration')
    }),
    confirmationReadEmailAddressDeclaration: z.boolean().refine(val => val === true, {
        message: t('form.validation.required.confirmationReadEmailAddressDeclaration')
    })
})

export type FormData = z.infer<ReturnType<typeof getFormSchema>>;