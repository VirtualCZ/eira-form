import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import './App.css'
import { Button } from './components/ui/button'
import {
  Form,
  // FormDescription
  FormMessage
} from './components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from 'react'
import { cn } from "./lib/utils"
import { useTranslation } from 'react-i18next'
import FormInput from './customComponents/FormInput'
import FormDate from './customComponents/FormDate'
import FormRadio from './customComponents/FormRadio'
import FormSelect from './customComponents/FormSelect'
import FormDateFromTo from './customComponents/FormDateFromTo'
import { Textarea } from './components/ui/textarea'
import FormCheckbox from './customComponents/FormCheckbox'
import { FormTable } from './customComponents/FormTable'

// Move the schema creation inside the component
function App() {
  const { t } = useTranslation();

  const tabsListRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const scrollAmount = 120;
      tabsListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Create the schema inside the component
  const formSchema = z.object({
    titleBeforeName: z.string().optional(),
    titleAfterName: z.string().optional(),
    honorific: z.string({
      required_error: t('form.validation.required.honorary'),
    }),
    firstName: z.string({
      required_error: t('form.validation.required.firstName'),
    }).min(2, {
      message: t('form.validation.format.name'),
    }),
    lastName: z.string().min(2, {
      message: t('form.validation.format.lastName'),
    }),
    birthSurname: z.string().min(2, {
      message: t('form.validation.format.birthSurname'),
    }).optional(),
    dateOfBirth: z.date({
      required_error: t('form.validation.required.dateOfBirth'),
    }),
    sex: z.enum(["male", "female", "other"], {
      required_error: t('form.validation.required.sex'),
    }),
    placeOfBirth: z.string({
      required_error: t('form.validation.required.placeOfBirth'),
    }).min(2, {
      message: "Username must be at least 2 characters.",
    }),
    maritalStatus: z.enum(["single", "married", "divorced", "widowed "]),

    foreginer: z.enum(["yes", "no"], {
      required_error: t('form.validation.required.foreginer'),
    }),

    birthNumber: z.string({
      required_error: t('form.validation.required.birthNumber'),
    }).regex(/^\d{6}\/\d{4}$/, {
      message: "SSN must be in the format yymmdd/1234.",
    }),
    foreignBirthNumber: z.string(),
    insuranceBirthNumber: z.string(),
    idCardNumber: z.string(),
    idCardIssuedBy: z.string(),
    passportNumber: z.string(),
    passportIssuedBy: z.string(),

    citizenship: z.string({
      required_error: t('form.validation.required.citizenship'),
    }),
    nationality: z.string({
      required_error: "Please select a nationality.",
    }),

    permanentStreet: z.string(),
    permanentHouseNumber: z.string(),
    permanentOrientationNumber: z.string(),
    permanentCity: z.string(),
    permanentPostalCode: z.string(),
    permanentCountry: z.string(),

    contactStreet: z.string(),
    contactHouseNumber: z.string(),
    contactOrientationNumber: z.string(),
    contactCity: z.string(),
    contactPostalCode: z.string(),
    contactCountry: z.string(),

    email: z.string(),
    phone: z.string(),
    dataBoxId: z.string(),

    foreignPermanentAddress: z.string(),
    residencePermitNumber: z.string(),
    residencePermitValidityFrom: z.date({
      required_error: t('form.validation.required.date'),
    }),
    residencePermitValidityUntil: z.date({
      required_error: t('form.validation.required.date'),
    }),
    residencePermitType: z.string(),
    residencePermitPurpose: z.string(),

    employmentClassification: z.string(),
    jobPosition: z.string(),
    firstJobInCz: z.enum(["yes", "no"], {
      required_error: t('form.validation.required.firstJobInCz'),
    }),
    lastEmployer: z.string(),
    lastJobType: z.string(),
    lastJobPeriod: z.string(),

    bankAccountNumber: z.string(),
    healthInsurance: z.string(),
    insuranceRegistrationNumber: z.string(),

    highestEducationSchool: z.string(),
    fieldOfStudy: z.string(),
    graduationYear: z.string(),
    studyCity: z.string(),

    languageSkills: z.array(z.object({
      language: z.string({
        required_error: t('form.validation.required.firstName'),
      }).min(1, {
        message: t('form.validation.format.name'),
      }),
      languageProficiency: z.string({
        required_error: t('form.validation.required.firstName'),
      }).min(1, {
        message: t('form.validation.format.name'),
      }),
      languageExamType: z.string({
        required_error: t('form.validation.required.firstName'),
      }).min(1, {
        message: t('form.validation.format.name'),
      }),
    })).optional(),

    hasDisability: z.string(),
    disabilityType: z.string(),
    disabilityDecisionDate: z.string(),
    receivesPension: z.string(),
    pensionType: z.string(),
    pensionDecisionDate: z.string(),

    activityBan: z.string(),
    bannedActivity: z.string(),
    hasWageDeductions: z.string(),
    wageDeductionDetails: z.string(),

    numberOfDependents: z.string(),
    claimChildTaxRelief: z.enum(["yes", "no"], {
      required_error: t('form.validation.required.claimChildTaxRelief'),
    }),
    childrenInfo: z.string(),

    confirmationReadEmployeeDeclaration: z.boolean(),
    confirmationReadEmailAddressDeclaration: z.boolean()
  })

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Add this line
  });
  function onSubmit(values: FormData) {
    console.log(values)
  }

  const [activeTab, setActiveTab] = useState("personalInformation")

  const tabs = ["personalInformation", "addresses", "contacts", "foreigners", "employment", "educationAndLanguages", "healthAndSocialInfo", "legalInfo", "familyAndChildren", "agreements"]
  const currentIndex = tabs.indexOf(activeTab)

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }
  function FormTabsTrigger({
    value,
    label,
    error,
    ...props
  }: {
    value: string
    label: string
    error?: boolean
    [key: string]: any
  }) {
    return (
      <TabsTrigger
        value={value}
        className={cn(
          "flex items-center gap-1",
          error && "bg-red-50 data-[state=active]:bg-red-100"
        )}
        {...props}
      >
        {label}
        {error && <AlertCircle className="w-4 h-4 text-red-500" />}
      </TabsTrigger>
    )
  }

  // Map each tab to its relevant field names
  const tabFields: Record<string, (keyof FormData)[]> = {
    personalInformation: [
      "titleBeforeName", "titleAfterName", "honorific", "firstName", "lastName", "birthSurname",
      "dateOfBirth", "sex", "placeOfBirth", "maritalStatus", "foreginer", "birthNumber",
      "foreignBirthNumber", "insuranceBirthNumber", "idCardNumber", "idCardIssuedBy",
      "passportNumber", "passportIssuedBy", "citizenship", "nationality"
    ],
    addresses: [
      "contactStreet", "contactHouseNumber", "contactOrientationNumber", "contactCity", "contactPostalCode", "contactCountry",
      "permanentStreet", "permanentHouseNumber", "permanentOrientationNumber", "permanentCity", "permanentPostalCode", "permanentCountry"
    ],
    contacts: [
      "email", "phone", "dataBoxId"
    ],
    foreigners: [
      "foreignPermanentAddress", "residencePermitNumber", "residencePermitValidityFrom", "residencePermitValidityUntil",
      "residencePermitType", "residencePermitPurpose"
    ],
    employment: [
      "employmentClassification", "jobPosition", "firstJobInCz", "lastEmployer", "lastJobType", "lastJobPeriod"
    ],
    educationAndLanguages: [
      "highestEducationSchool", "fieldOfStudy", "graduationYear", "studyCity", "languageSkills"
    ],
    healthAndSocialInfo: [
      "hasDisability", "disabilityType", "disabilityDecisionDate", "receivesPension", "pensionType", "pensionDecisionDate"
    ],
    legalInfo: [
      "activityBan", "bannedActivity", "hasWageDeductions", "wageDeductionDetails"
    ],
    familyAndChildren: [
      "numberOfDependents", "claimChildTaxRelief", "childrenInfo"
    ],
    agreements: [
      "confirmationReadEmployeeDeclaration", "confirmationReadEmailAddressDeclaration"
    ]
  }
  const hasErrorsInTab = (tabName: string) => {
    const errors = form.formState.errors
    const fields = tabFields[tabName] || []
    return fields.some(field => !!errors[field])
  }

  return (
    <>
      <div className="min-h-svh flex items-center justify-center @container">
        <div className="form-container @xs:w-[100%] @lg:w-[400px] @2xl:w-[600px] @4xl:w-[800px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <div className="relative flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    className="p-1"
                    onClick={() => scrollTabs("left")}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft />
                  </button>

                  <div
                    ref={tabsListRef}
                    className="flex-1 overflow-x-auto scrollbar-hide"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none"
                    }}
                  >
                    <TabsList className="flex w-max min-w-full space-x-2">
                      {tabs.map((tab) => (
                        <FormTabsTrigger
                          key={tab}
                          value={tab}
                          label={t(`form.tabs.${tab}`)}
                          error={hasErrorsInTab(tab)}
                        />
                      ))}
                    </TabsList>
                  </div>

                  <button
                    type="button"
                    className="p-1"
                    onClick={() => scrollTabs("right")}
                    aria-label="Scroll right"
                  >
                    <ChevronRight />
                  </button>
                </div>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="personalInformation">
                  <FormInput
                    name="titleBeforeName"
                    formLabel={t('form.labels.titleBeforeName')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="titleAfterName"
                    formLabel={t('form.labels.titleAfterName')}
                    formControl={form.control}
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <FormSelect
                        name="honorific"
                        formLabel={t('form.labels.honorific')}
                        formControl={form.control}
                        formItemClass="flex-none"
                        options={[
                          { value: "mr", label: t('form.options.honorific.mr') },
                          { value: "mrs", label: t('form.options.honorific.mrs') },
                          { value: "ms", label: t('form.options.honorific.ms') },
                          { value: "miss", label: t('form.options.honorific.miss') }
                        ]}
                        placeholder="--."
                        formMessage={false}
                      />
                      <FormInput
                        name="firstName"
                        formLabel={t('form.labels.firstName')}
                        formControl={form.control}
                        formMessage={false}
                        formItemClass='flex-1'
                      />
                    </div>
                    <div className="flex gap-2">
                      <FormMessage>{form.formState.errors.honorific?.message} {form.formState.errors.firstName?.message}</FormMessage>
                    </div>
                  </div>
                  <FormInput
                    name="lastName"
                    formLabel={t('form.labels.lastName')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="birthSurname"
                    formLabel={t('form.labels.birthSurname')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="dateOfBirth"
                    formLabel={t('form.labels.dateOfBirth')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="sex"
                    formLabel={t('form.labels.sex')}
                    formControl={form.control}
                    options={[
                      { value: "male", label: t('form.options.sex.male') },
                      { value: "female", label: t('form.options.sex.female') },
                      { value: "other", label: t('form.options.sex.other') }
                    ]}
                  />
                  <FormInput
                    name="placeOfBirth"
                    formLabel={t('form.labels.placeOfBirth')}
                    formControl={form.control}
                  />
                  <FormSelect
                    name="maritalStatus"
                    formLabel={t('form.labels.maritalStatus')}
                    formControl={form.control}
                    options={[
                      { value: "single", label: t('form.options.maritalStatus.single') },
                      { value: "married", label: t('form.options.maritalStatus.married') },
                      { value: "divorced", label: t('form.options.maritalStatus.divorced') },
                      { value: "widowed", label: t('form.options.maritalStatus.widowed') }
                    ]}
                    formTriggerClass='w-[100%]'
                  />
                  <FormRadio
                    name="foreginer"
                    formLabel={t('form.labels.foreginer')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="birthNumber"
                    formLabel={t('form.labels.birthNumber')}
                    formControl={form.control}
                    formPlaceholder="250411/1234"
                  />
                  <FormInput
                    name="foreignBirthNumber"
                    formLabel={t('form.labels.foreignBirthNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="insuranceBirthNumber"
                    formLabel={t('form.labels.insuranceBirthNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="idCardNumber"
                    formLabel={t('form.labels.idCardNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="idCardIssuedBy"
                    formLabel={t('form.labels.idCardIssuedBy')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="passportNumber"
                    formLabel={t('form.labels.passportNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="passportIssuedBy"
                    formLabel={t('form.labels.passportIssuedBy')}
                    formControl={form.control}
                  />
                  <FormSelect
                    name="citizenship"
                    formLabel={t('form.labels.citizenship')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "cz", label: t('form.options.citizenship.cz') },
                      { value: "sk", label: t('form.options.citizenship.sk') },
                      { value: "uk", label: t('form.options.citizenship.uk') },
                      { value: "br", label: t('form.options.citizenship.br') }
                    ]}
                    placeholder="-"
                  />
                  <FormSelect
                    name="nationality"
                    formLabel={t('form.labels.nationality')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "czech", label: t('form.options.nationality.czech') },
                      { value: "moravian", label: t('form.options.nationality.moravian') },
                      { value: "german", label: t('form.options.nationality.german') },
                      { value: "polish", label: t('form.options.nationality.polish') },
                      { value: "gypsy", label: t('form.options.nationality.gypsy') },
                      { value: "russian", label: t('form.options.nationality.russian') },
                      { value: "silesian", label: t('form.options.nationality.silesian') },
                      { value: "slovakian", label: t('form.options.nationality.slovakian') },
                      { value: "ukrainian", label: t('form.options.nationality.ukrainian') },
                      { value: "vietnamese", label: t('form.options.nationality.vietnamese') },
                      { value: "hungarian", label: t('form.options.nationality.hungarian') },
                      { value: "khazakh", label: t('form.options.nationality.khazakh') }

                    ]}
                    placeholder="-"
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="addresses">
                  <h1>{t('form.headlines.permanentAddress')}</h1>
                  <FormInput
                    name="contactStreet"
                    formLabel={t('form.labels.street')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="contactHouseNumber"
                    formLabel={t('form.labels.houseNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="contactOrientationNumber"
                    formLabel={t('form.labels.orientationNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="contactCity"
                    formLabel={t('form.labels.city')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="contactPostalCode"
                    formLabel={t('form.labels.postalCode')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="contactCountry"
                    formLabel={t('form.labels.country')}
                    formControl={form.control}
                  />
                  <h1>{t('form.headlines.contactAddress')}</h1>
                  <FormInput
                    name="permanentStreet"
                    formLabel={t('form.labels.street')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="permanentHouseNumber"
                    formLabel={t('form.labels.houseNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="permanentOrientationNumber"
                    formLabel={t('form.labels.orientationNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="permanentCity"
                    formLabel={t('form.labels.city')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="permanentPostalCode"
                    formLabel={t('form.labels.postalCode')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="permanentCountry"
                    formLabel={t('form.labels.country')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="contacts">
                  <FormInput
                    name="email"
                    formLabel={t('form.labels.email')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="phone"
                    formLabel={t('form.labels.phone')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="dataBoxId"
                    formLabel={t('form.labels.dataBoxId')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="foreigners">
                  <FormInput
                    name="foreignPermanentAddress"
                    formLabel={t('form.labels.foreignPermanentAddress')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="residencePermitNumber"
                    formLabel={t('form.labels.residencePermitNumber')}
                    formControl={form.control}
                  />
                  <FormDateFromTo
                    nameFrom="residencePermitValidityFrom"
                    nameTo="residencePermitValidityUntil"
                    formLabel={t('form.labels.residencePermitValidity')}
                    formControl={form.control}
                    formFieldClass='w-[100%]'
                    formItemClass="flex-1"
                  />
                  <FormInput
                    name="residencePermitType"
                    formLabel={t('form.labels.residencePermitType')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="residencePermitPurpose"
                    formLabel={t('form.labels.residencePermitPurpose')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="employment">
                  <FormInput
                    name="employmentClassification"
                    formLabel={t('form.labels.employmentClassification')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="jobPosition"
                    formLabel={t('form.labels.jobPosition')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="firstJobInCz"
                    formLabel={t('form.labels.firstJobInCz')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="lastEmployer"
                    formLabel={t('form.labels.lastEmployer')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="lastJobType"
                    formLabel={t('form.labels.lastJobType')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="lastJobPeriod"
                    formLabel={t('form.labels.lastJobPeriod')}
                    formControl={form.control}
                  />
                </TabsContent>
                // add  bankAccountNumber healthInsurance insuranceRegistrationNumber
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="educationAndLanguages">
                  <FormInput
                    name="highestEducationSchool"
                    formLabel={t('form.labels.highestEducationSchool')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="fieldOfStudy"
                    formLabel={t('form.labels.fieldOfStudy')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="graduationYear"
                    formLabel={t('form.labels.graduationYear')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="studyCity"
                    formLabel={t('form.labels.studyCity')}
                    formControl={form.control}
                  />
                  <FormTable
                    name="languageSkills"
                    label={t('form.headlines.languageSkills')}
                    control={form.control}
                    columns={[
                      {
                        name: "language",
                        label: t('form.labels.language'),
                        placeholder: "",
                        errorPath: "language"
                      },
                      {
                        name: "languageProficiency",
                        label: t('form.labels.languageProficiency'),
                        placeholder: "",
                        errorPath: "languageProficiency"
                      },
                      {
                        name: "languageExamType",
                        label: t('form.labels.languageExamType'),
                        placeholder: "",
                        errorPath: "languageExamType"
                      },
                    ]}
                    errors={Array.isArray(form.formState.errors.languageSkills) ? form.formState.errors.languageSkills : undefined}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="healthAndSocialInfo">
                  <FormRadio
                    name="hasDisability"
                    formLabel={t('form.labels.hasDisability')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="disabilityType"
                    formLabel={t('form.labels.disabilityType')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="disabilityDecisionDate"
                    formLabel={t('form.labels.disabilityDecisionDate')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="receivesPension"
                    formLabel={t('form.labels.receivesPension')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="pensionType"
                    formLabel={t('form.labels.pensionType')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="pensionDecisionDate"
                    formLabel={t('form.labels.pensionDecisionDate')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="legalInfo">
                  <FormRadio
                    name="activityBan"
                    formLabel={t('form.labels.activityBan')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="bannedActivity"
                    formLabel={t('form.labels.bannedActivity')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="hasWageDeductions"
                    formLabel={t('form.labels.hasWageDeductions')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="wageDeductionDetails"
                    formLabel={t('form.labels.wageDeductionDetails')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="familyAndChildren">
                  <FormInput
                    name="numberOfDependents"
                    formLabel={t('form.labels.numberOfDependents')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="claimChildTaxRelief"
                    formLabel={t('form.labels.claimChildTaxRelief')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  <FormInput
                    name="childrenInfo"
                    formLabel={t('form.labels.childrenInfo')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="agreements">
                  <Textarea readOnly
                    value="Awoo agreements" />
                  <FormCheckbox
                    name="confirmationReadEmployeeDeclaration"
                    formLabel={t('form.labels.confirmationReadEmployeeDeclaration')}
                    formControl={form.control}
                  />
                  <Textarea readOnly
                    value="Awoo agreements" />
                  <FormCheckbox
                    name="confirmationReadEmailAddressDeclaration"
                    formLabel={t('form.labels.confirmationReadEmailAddressDeclaration')}
                    formControl={form.control}
                  />
                </TabsContent>

                <div className="flex justify-between pt-2 mt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    {t('form.buttons.previous')}
                  </Button>
                  <Button
                    type={currentIndex === tabs.length - 1 ? "submit" : "button"}
                    onClick={currentIndex === tabs.length - 1 ? undefined : handleNext}
                  >
                    {currentIndex === tabs.length - 1 ? t('form.buttons.submit') : t('form.buttons.next')}
                  </Button>
                </div>
              </Tabs>
            </form>
          </Form>
        </div>
      </div >
    </>
  )
}

export default App
