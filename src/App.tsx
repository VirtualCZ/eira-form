import { useEffect, useState } from 'react'
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
import FormPhotoUpload from './customComponents/FormPhotoUpload'
import LanguageSwitcher from './customComponents/LanguageSwitcher'

function App() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("personalInformation")
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const tabsListRef = useRef<HTMLDivElement>(null);

  const formSchema = z.object({
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
    sex: z.enum(["male", "female", "other"], {
      required_error: t('form.validation.required.sex'),
    }),
    placeOfBirth: z.string({
      required_error: t('form.validation.required.placeOfBirth'),
    }).min(2, {
      message: t('form.validation.format.placeOfBirth'),
    }),
    maritalStatus: z.enum(
      ["single", "married", "divorced", "widowed "], {
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
      required_error: t('form.validation.required.permanentStreet'),
    }).min(1, {
      message: t('form.validation.format.permanentStreet'),
    }),
    permanentHouseNumber: z.string({
      required_error: t('form.validation.required.permanentHouseNumber'),
    }).min(1, {
      message: t('form.validation.format.permanentHouseNumber'),
    }),
    permanentOrientationNumber: z.string().optional(),
    permanentCity: z.string({
      required_error: t('form.validation.required.permanentCity'),
    }).min(1, {
      message: t('form.validation.format.permanentCity'),
    }),
    permanentPostalCode: z.number({
      required_error: t('form.validation.required.permanentPostalCode'),
    }).min(1, {
      message: t('form.validation.format.permanentPostalCode'),
    }),
    permanentCountry: z.string({
      required_error: t('form.validation.required.permanentCountry'),
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

    numberOfDependents: z.number({
      required_error: t('form.validation.required.numberOfDependents'),
    }),
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

    foodPass: z.array(z.instanceof(File)).optional(),
    travelDocumentCopy: z.array(z.instanceof(File)).optional(),
    residencePermitCopy: z.array(z.instanceof(File)).optional(),
    educationCertificate: z.array(z.instanceof(File)).optional(),
    wageDeductionDecision: z.array(z.instanceof(File)).optional(),

    confirmationReadEmployeeDeclaration: z.boolean().refine(val => val === true, {
      message: t('form.validation.required.confirmationReadEmployeeDeclaration')
    }),
    confirmationReadEmailAddressDeclaration: z.boolean().refine(val => val === true, {
      message: t('form.validation.required.confirmationReadEmailAddressDeclaration')
    })
  })

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: JSON.parse(localStorage.getItem('formData') || '{}'),
  });

  useEffect(() => {
    const container = tabsListRef.current;
    if (!container) return;

    const checkScroll = () => {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth;
      setCanScroll({ left: canScrollLeft, right: canScrollRight });
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll();

    return () => container.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const scrollAmount = 120;
      tabsListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const scrollToTab = (tab: string) => {
    setTimeout(() => {
      const tabElement = document.querySelector(`[data-value="${tab}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }, 200); // Increased delay to ensure DOM updates
  };

  async function exportJSON(data: any, filename = "form-data.json") {
    // Define all document fields that need conversion
    const photoFields = [
      'photos',
      'travelDocumentCopy',
      'residencePermitCopy',
      'educationCertificate',
      'wageDeductionDecision',
      'foodPass'
    ];

    // Convert all document fields to Base64 in parallel
    const convertedFields = await Promise.all(photoFields.map(async (field) => {
      const files = data[field];
      const converted = files?.length
        ? await Promise.all(files.map((file: File) => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }))
        )
        : undefined;
      return [field, converted];
    }));

    const payload = {
      ...data,
      ...Object.fromEntries(convertedFields)
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('formData', JSON.stringify(value));
      // console.log(form.getValues());
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: FormData) {
    try {
      await exportJSON(values);

      const response = await fetch("https://gas.eira.com/rest/im/gas/v1/createHrRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${import.meta.env.VITE_GAS_NAME}:${import.meta.env.VITE_GAS_PASS}`)
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      handleClear();
      const result = await response.json();
      console.log("Submission successful:", result);
      // Optionally, show a success message to the user here
    } catch (error) {
      console.error("Submission failed:", error);
      // Optionally, show an error message to the user here
    }
  }

  const handleClear = () => {
    form.reset();
    localStorage.removeItem('formData');
    setActiveTab("personalInformation"); // Add this line
  };

  const tabs = ["personalInformation", "addresses", "contacts", "foreigners", "employment", "educationAndLanguages", "healthAndSocialInfo", "legalInfo", "familyAndChildren", "documents", "agreements"]
  const currentIndex = tabs.indexOf(activeTab)

  const handleNext = async () => {
    const filteredTabs = tabs.filter(tab =>
      tab !== "foreigners" || form.watch("foreigner") === "yes"
    );

    const currentFilteredIndex = filteredTabs.indexOf(activeTab);

    if (currentFilteredIndex < filteredTabs.length - 1) {
      await form.trigger(tabFields[activeTab]);
      const newTab = filteredTabs[currentFilteredIndex + 1];
      setActiveTab(newTab);
      scrollToTab(newTab);
    }
  };

  const handlePrevious = async () => {
    const filteredTabs = tabs.filter(tab =>
      tab !== "foreigners" || form.watch("foreigner") === "yes"
    );

    const currentFilteredIndex = filteredTabs.indexOf(activeTab);

    if (currentFilteredIndex > 0) {
      await form.trigger(tabFields[activeTab]);
      const newTab = filteredTabs[currentFilteredIndex - 1];
      setActiveTab(newTab);
      scrollToTab(newTab);
    }
  };

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
        data-value={value}
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
      "dateOfBirth", "sex", "placeOfBirth", "maritalStatus", "foreigner", "birthNumber",
      "foreignBirthNumber", "insuranceBirthNumber",
      "passportNumber", "passportIssuedBy", "citizenship", "nationality",
      "bankingInstitutionName", "bankAccountNumber", "bankCode", "healthInsurance", "insuranceRegistrationNumber"
    ],
    addresses: [
      "permanentStreet", "permanentHouseNumber", "permanentOrientationNumber", "permanentCity", "permanentPostalCode", "permanentCountry",
      "contactSameAsPermanentAddress",
      "contactStreet", "contactHouseNumber", "contactOrientationNumber", "contactCity", "contactPostalCode", "contactCountry"
    ],
    contacts: [
      "email", "phone", "dataBoxId"
    ],
    foreigners: [
      "foreignPermanentAddress", "residencePermitNumber", "residencePermitValidityFrom", "residencePermitValidityUntil",
      "residencePermitType", "residencePermitPurpose"
    ],
    employment: [
      "employmentClassification", "jobPosition", "firstJobInCz", "lastEmployer", "lastJobType", "lastJobPeriodFrom", "lastJobPeriodTo"
    ],
    educationAndLanguages: [
      "highestEducation", "highestEducationSchool", "fieldOfStudy", "graduationYear", "studyCity", "languageSkills"
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
    documents: [
      "travelDocumentCopy", "residencePermitCopy", "educationCertificate",
      "wageDeductionDecision", "foodPass"
    ],
    agreements: [
      "confirmationReadEmployeeDeclaration", "confirmationReadEmailAddressDeclaration"
    ]
  }
  const hasErrorsInTab = (tabName: string) => {
    const errors = form.formState.errors
    const fields = tabFields[tabName] || []

    if (tabName === "foreigners" && form.watch("foreigner") !== "yes") {
      return fields.some(field => !!errors[field])
    }

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
                onValueChange={async (newTab) => {
                  if (newTab === "foreigners" && form.watch("foreigner") !== "yes") return;
                  await form.trigger(tabFields[activeTab]);
                  setActiveTab(newTab);
                }}
                className="h-full flex flex-col"
              >
                <div className="relative flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    className="p-1"
                    onClick={() => scrollTabs("left")}
                    disabled={!canScroll.left}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className={cn(!canScroll.left && "opacity-50")} />
                  </button>

                  <div
                    ref={tabsListRef}
                    className="flex-1 overflow-x-auto no-scrollbar"
                  >
                    <TabsList className="flex w-max min-w-full space-x-2">
                      {tabs.map((tab) => (
                        <FormTabsTrigger
                          key={tab}
                          value={tab}
                          label={t(`form.tabs.${tab}`)}
                          error={hasErrorsInTab(tab)}
                          disabled={tab === "foreigners" && form.watch("foreigner") === "no"}
                        />
                      ))}
                    </TabsList>
                  </div>
                  <button
                    type="button"
                    className="p-1"
                    onClick={() => scrollTabs("right")}
                    disabled={!canScroll.right}
                    aria-label="Scroll right"
                  >
                    <ChevronRight className={cn(!canScroll.right && "opacity-50")} />
                  </button>
                </div>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="personalInformation">
                  <LanguageSwitcher />
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
                    name="foreigner"
                    formLabel={t('form.labels.foreigner')}
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
                    inputType='number'
                  />
                  {/* <FormInput
                    name="idCardNumber"
                    formLabel={t('form.labels.idCardNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="idCardIssuedBy"
                    formLabel={t('form.labels.idCardIssuedBy')}
                    formControl={form.control}
                  /> */}
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
                  <FormInput
                    name="bankingInstitutionName"
                    formLabel={t('form.labels.bankingInstitutionName')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="bankAccountNumber"
                    formLabel={t('form.labels.bankAccountNumber')}
                    formControl={form.control}
                    inputType='number'
                  />
                  <FormSelect
                    name="bankCode"
                    formLabel={t('form.labels.bankCode')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "-", label: "-" },
                      { value: "0100", label: "0100" },
                      { value: "0300", label: "0300" },
                      { value: "0600", label: "0600" },
                      { value: "0710", label: "0710" },
                      { value: "0800", label: "0800" },
                      { value: "2010", label: "2010" },
                      { value: "2060", label: "2060" },
                      { value: "2070", label: "2070" },
                      { value: "2100", label: "2100" },
                      { value: "2200", label: "2200" },
                      { value: "2220", label: "2220" },
                      { value: "2250", label: "2250" },
                      { value: "2260", label: "2260" },
                      { value: "2275", label: "2275" },
                      { value: "2600", label: "2600" },
                      { value: "2700", label: "2700" },
                      { value: "3030", label: "3030" },
                      { value: "3050", label: "3050" },
                      { value: "3060", label: "3060" },
                      { value: "3500", label: "3500" },
                      { value: "4000", label: "4000" },
                      { value: "4300", label: "4300" },
                      { value: "5500", label: "5500" },
                      { value: "5800", label: "5800" },
                      { value: "6000", label: "6000" },
                      { value: "6100", label: "6100" },
                      { value: "6200", label: "6200" },
                      { value: "6210", label: "6210" },
                      { value: "6300", label: "6300" },
                      { value: "6700", label: "6700" },
                      { value: "6800", label: "6800" },
                      { value: "7910", label: "7910" },
                      { value: "7950", label: "7950" },
                      { value: "7960", label: "7960" },
                      { value: "7970", label: "7970" },
                      { value: "7990", label: "7990" },
                      { value: "8030", label: "8030" },
                      { value: "8040", label: "8040" },
                      { value: "8060", label: "8060" },
                      { value: "8090", label: "8090" },
                      { value: "8150", label: "8150" },
                      { value: "8190", label: "8190" },
                      { value: "8198", label: "8198" },
                      { value: "8199", label: "8199" },
                      { value: "8200", label: "8200" },
                      { value: "8220", label: "8220" },
                      { value: "8230", label: "8230" },
                      { value: "8240", label: "8240" },
                      { value: "8250", label: "8250" },
                      { value: "8255", label: "8255" },
                      { value: "8265", label: "8265" },
                      { value: "8270", label: "8270" },
                      { value: "8280", label: "8280" },
                      { value: "8291", label: "8291" },
                      { value: "8293", label: "8293" },
                      { value: "8299", label: "8299" },
                      { value: "8500", label: "8500" },
                    ]}
                    placeholder="-"
                  />
                  <FormSelect
                    name="healthInsurance"
                    formLabel={t('form.labels.healthInsurance')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "-", label: "-" },
                      { value: "111", label: "111 Všeobecná zdravotní pojišťovna České republiky" },
                      { value: "201", label: "201 Vojenská zdravotní pojišťovna České republiky" },
                      { value: "205", label: "205 Česká průmyslová zdravotní pojišťovna" },
                      { value: "207", label: "207 Oborová zdravotní pojišťovna zaměstnanců bank a pojišťoven" },
                      { value: "208", label: "208 Zaměstnanecká pojišťovna ŠKODA, Mladá Boleslav" },
                      { value: "211", label: "211 Zdravotní pojišťovna ministerstva vnitra České republiky" },
                      { value: "213", label: "213 Revírní bratrská pokladna, Ostrava" },
                      { value: "333", label: "333 Pojišťovna VZP pro cizince" },
                      { value: "747", label: "747 Pojišťovna Maxima" }
                    ]}
                    placeholder="-"
                  />
                  <FormInput
                    name="insuranceRegistrationNumber"
                    formLabel={t('form.labels.insuranceRegistrationNumber')}
                    formControl={form.control}
                    inputType='number'
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="addresses">
                  <h1>{t('form.headlines.permanentAddress')}</h1>
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
                    inputType='number'
                  />
                  <FormInput
                    name="permanentCountry"
                    formLabel={t('form.labels.country')}
                    formControl={form.control}
                  />
                  <FormRadio
                    name="contactSameAsPermanentAddress"
                    formLabel={t('form.labels.contactSameAsPermanentAddress')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  {form.watch("contactSameAsPermanentAddress") === "no" && (
                    <>
                      <h1>{t('form.headlines.contactAddress')}</h1>
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
                        inputType='number'
                      />
                      <FormInput
                        name="contactCountry"
                        formLabel={t('form.labels.country')}
                        formControl={form.control}
                      />
                    </>
                  )}
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="contacts">
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
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="foreigners">
                  <FormInput
                    name="foreignPermanentAddress"
                    formLabel={t('form.labels.foreignPermanentAddress')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="residencePermitNumber"
                    formLabel={t('form.labels.residencePermitNumber')}
                    formControl={form.control}
                    inputType='number'
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
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="employment">
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
                  <FormDateFromTo
                    nameFrom="lastJobPeriodFrom"
                    nameTo="lastJobPeriodTo"
                    formLabel={t('form.labels.lastJobPeriod')}
                    formControl={form.control}
                    formFieldClass='w-[100%]'
                    formItemClass="flex-1"
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="educationAndLanguages">
                  <FormSelect
                    name="highestEducation"
                    formLabel={t('form.labels.highestEducation')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "basicEducation", label: t('form.options.highestEducation.basicEducation') },
                      { value: "vocationalWithoutMatura", label: t('form.options.highestEducation.vocationalWithoutMatura') },
                      { value: "secondaryOrVocationalWithMatura", label: t('form.options.highestEducation.secondaryOrVocationalWithMatura') },
                      { value: "higherVocational", label: t('form.options.highestEducation.higherVocational') },
                      { value: "bachelor", label: t('form.options.highestEducation.bachelor') },
                      { value: "universityOrHigher", label: t('form.options.highestEducation.universityOrHigher') },
                      { value: "mbaOrPostgraduate", label: t('form.options.highestEducation.mbaOrPostgraduate') },
                    ]}
                  />
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
                    inputType='number'
                  />
                  <FormInput
                    name="studyCity"
                    formLabel={t('form.labels.studyCity')}
                    formControl={form.control}
                  />
                  <FormTable
                    name="languageSkills"
                    formControl={form.control}
                    label={t('form.headlines.languageSkills')}
                    columns={[
                      {
                        name: "language",
                        label: t('form.labels.language'),
                        placeholder: "",
                        errorPath: "language",
                        type: "text"
                      },
                      {
                        name: "languageProficiency",
                        label: t('form.labels.languageProficiency'),
                        errorPath: "languageProficiency",
                        type: "select",
                        options: [
                          { value: "A1", label: "A1" },
                          { value: "A2", label: "A2" },
                          { value: "B1", label: "B1" },
                          { value: "B2", label: "B2" },
                          { value: "C1", label: "C1" },
                          { value: "C2", label: "C2" },
                          { value: "native", label: t('form.options.languageProficiency.native') }
                        ]
                      },
                      {
                        name: "languageExamType",
                        label: t('form.labels.languageExamType'),
                        placeholder: "",
                        errorPath: "languageExamType",
                        type: "text"
                      },
                    ]}
                    errors={Array.isArray(form.formState.errors.languageSkills) ? form.formState.errors.languageSkills : undefined}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="healthAndSocialInfo">
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
                  <FormSelect
                    name="pensionType"
                    formLabel={t('form.labels.pensionType')}
                    formControl={form.control}
                    formTriggerClass='w-full'
                    options={[
                      { value: "-", label: t('form.options.pensionType.none') },
                      { value: "oldAgePension", label: t('form.options.pensionType.oldAgePension') },
                      { value: "earlyOldAgePension", label: t('form.options.pensionType.earlyOldAgePension') },
                      { value: "fullDisabilityPension", label: t('form.options.pensionType.fullDisabilityPension') },
                      { value: "partialDisabilityPension", label: t('form.options.pensionType.partialDisabilityPension') },
                      { value: "widowsPension", label: t('form.options.pensionType.widowsPension') },
                      { value: "widowersPension", label: t('form.options.pensionType.widowersPension') },
                      { value: "orphansPension", label: t('form.options.pensionType.orphansPension') }
                    ]}
                    placeholder="--."
                    formMessage={false}
                  />
                  <FormDate
                    name="pensionDecisionDate"
                    formLabel={t('form.labels.pensionDecisionDate')}
                    formControl={form.control}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="legalInfo">
                  <FormRadio
                    name="activityBan"
                    formLabel={t('form.labels.activityBan')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  {form.watch("activityBan") === "yes" && (
                    <FormInput
                      name="bannedActivity"
                      formLabel={t('form.labels.bannedActivity')}
                      formControl={form.control}
                    />
                  )}

                  <FormRadio
                    name="hasWageDeductions"
                    formLabel={t('form.labels.hasWageDeductions')}
                    formControl={form.control}
                    options={[
                      { value: "yes", label: t('form.options.yesNo.yes') },
                      { value: "no", label: t('form.options.yesNo.no') },
                    ]}
                  />
                  {form.watch("hasWageDeductions") === "yes" && (
                    <FormInput
                      name="wageDeductionDetails"
                      formLabel={t('form.labels.wageDeductionDetails')}
                      formControl={form.control}
                    />
                  )}
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="familyAndChildren">
                  <FormInput
                    name="numberOfDependents"
                    formLabel={t('form.labels.numberOfDependents')}
                    formControl={form.control}
                    inputType="number"
                  />
                  {form.watch("numberOfDependents") > 0 && (
                    <>
                      <FormRadio
                        name="claimChildTaxRelief"
                        formLabel={t('form.labels.claimChildTaxRelief')}
                        formControl={form.control}
                        options={[
                          { value: "yes", label: t('form.options.yesNo.yes') },
                          { value: "no", label: t('form.options.yesNo.no') },
                        ]}
                      />
                      <FormTable
                        name="childrenInfo"
                        label={t('form.headlines.childrenInfo')}
                        formControl={form.control}
                        columns={[
                          {
                            name: "childrenInfoFullName",
                            label: t('form.labels.childrenInfoFullName'),
                            placeholder: "",
                            errorPath: "childrenInfoFullName"
                          },
                          {
                            name: "childrenInfoBirthNumber",
                            label: t('form.labels.childrenInfoBirthNumber'),
                            placeholder: "",
                            errorPath: "childrenInfoBirthNumber"
                          }
                        ]}
                        errors={Array.isArray(form.formState.errors.childrenInfo) ? form.formState.errors.childrenInfo : undefined}
                      />
                    </>
                  )}
                </TabsContent>
                <TabsContent value="documents">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {form.watch("foreigner") === "yes" && (
                      <>
                        <FormPhotoUpload
                          name="travelDocumentCopy"
                          label={t('form.labels.travelDocumentCopy')}
                          formControl={form.control}
                        />
                        <FormPhotoUpload
                          name="residencePermitCopy"
                          label={t('form.labels.residencePermitCopy')}
                          formControl={form.control}
                        />
                      </>
                    )}
                    <FormPhotoUpload
                      name="educationCertificate"
                      label={t('form.labels.educationCertificate')}
                      formControl={form.control}
                    />
                    <FormPhotoUpload
                      name="wageDeductionDecision"
                      label={t('form.labels.wageDeductionDecision')}
                      formControl={form.control}
                    />
                    <FormPhotoUpload
                      name="foodPass"
                      label={t('form.labels.foodPass')}
                      formControl={form.control}
                    />
                  </div>
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="agreements">
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

                  <div className="flex gap-2 mt-4">
                    <Button type="button" variant="destructive" onClick={handleClear}>
                      {t('form.buttons.clearForm')}
                    </Button>
                    <Button type="submit">
                      {t('form.buttons.submit')}
                    </Button>
                  </div>
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
