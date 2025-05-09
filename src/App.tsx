import { useEffect, useMemo, useState, useRef } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import './App.css'
import { Form } from './components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "./lib/utils"
import { useTranslation } from 'react-i18next'
import NavigationButtons from './customComponents/NavigationButtons'
import { FormData, getFormSchema } from './schemas/formSchema'
import { PersonalInformationTab } from './tabs/PersonalInformationTab'
import { AddressesTab } from './tabs/AddressesTab'
import { ContactsTab } from './tabs/ContactsTab'
import { ForeignersTab } from './tabs/ForeignersTab'
import { EmploymentTab } from './tabs/EmploymentTab'
import { EducationAndLanguagesTab } from './tabs/EducationAndLanguagesTab'
import { HealthAndSocialInfoTab } from './tabs/HealthAndSocialInfoTab'
import { LegalInfoTab } from './tabs/LegalInfoTab'
import { FamilyAndChildrenTab } from './tabs/FamilyAndChildrenTab'
import { DocumentsTab } from './tabs/DocumentsTab'
import { AgreementsTab } from './tabs/AgreementsTab'
import { CodeValidationPopover } from './customComponents/CodeValidationPopover'

function App() {
  const { t } = useTranslation()
  const formSchema = getFormSchema(t)

  const [activeTab, setActiveTab] = useState("personalInformation")
  const [canScroll, setCanScroll] = useState({ left: false, right: true })
  const [formKey, setFormKey] = useState(0)
  const [showCodePopover, setShowCodePopover] = useState(false)
  const tabsListRef = useRef<HTMLDivElement>(null)

  const dateFields = useMemo(() => [
    "dateOfBirth",
    "residencePermitValidityFrom",
    "residencePermitValidityUntil",
    "lastJobPeriodFrom",
    "lastJobPeriodTo",
    "disabilityDecisionDate",
    "pensionDecisionDate",
    "wageDeductionDate"
  ], [])

  const defaultValues = useMemo(() => reviveDates(JSON.parse(localStorage.getItem('formData') || '{}'), dateFields), [dateFields])
  // const rawDefaultValues = JSON.parse(localStorage.getItem('formData') || '{}')
  // const defaultValues = useMemo(() => reviveDates(rawDefaultValues, dateFields), []) // Add useMemo

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  })

  function reviveDates(obj: any, dateKeys: string[]): any {
    console.log("revived dates")
    if (!obj || typeof obj !== 'object') return obj
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
      if (dateKeys.includes(key) && typeof obj[key] === 'string') {
        const d = new Date(obj[key])
        if (!isNaN(d.getTime())) obj[key] = d
      } else if (typeof obj[key] === 'object') {
        obj[key] = reviveDates(obj[key], dateKeys)
      }
    }
    return obj
  }

  useEffect(() => {
    const container = tabsListRef.current
    if (!container) return

    const checkScroll = () => {
      const canScrollLeft = container.scrollLeft > 0
      const canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth
      setCanScroll({ left: canScrollLeft, right: canScrollRight })
    }

    container.addEventListener('scroll', checkScroll)
    checkScroll()

    return () => container.removeEventListener('scroll', checkScroll)
  }, [])

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const scrollAmount = 120
      tabsListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const scrollToTab = (tab: string) => {
    setTimeout(() => {
      const tabElement = document.querySelector(`[data-value="${tab}"]`)
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    }, 200) // Increased delay to ensure DOM updates
  }

  useEffect(() => {
    console.log("ran useffect save")
    const subscription = form.watch((value) => {
      localStorage.setItem('formData', JSON.stringify(value))
      // console.log(form.getValues())
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  const exportJSON = (data: any, filename = "form-data.json") => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (file: File) => {
    console.log("ran handleImportJSON")
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const revivedData = reviveDates(data, dateFields)
        form.reset(revivedData)
        setFormKey(prev => prev + 1)
      } catch (error) {
        alert(t('form.errors.invalidJSON'))
      }
    }
    reader.readAsText(file)
  }

  async function onSubmit(values: FormData) {
    try {

      //const response = await fetch("https://gas.eira.com/rest/sm/gas/v1/createHrRequest", {
      const response = await fetch("http://localhost:8880/rest/sm/gas/v1/createHrRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${import.meta.env.VITE_GAS_NAME}:${import.meta.env.VITE_GAS_PASS}`)
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`)
      }

      handleClear()
      const result = await response.json()
      console.log("Submission successful:", result)
      // Optionally, show a success message to the user here
    } catch (error) {
      console.error("Submission failed:", error)
      // Optionally, show an error message to the user here
    }
  }

  const handleClear = () => {
    localStorage.removeItem('formData')
    form.reset({})
    setFormKey(prev => prev + 1)
  }

  const tabs = ["personalInformation", "addresses", "contacts", "foreigners", "employment", "educationAndLanguages", "healthAndSocialInfo", "legalInfo", "familyAndChildren", "documents", "agreements"]

  const handleNext = async () => {
    const filteredTabs = tabs.filter(tab =>
      tab !== "foreigners" || form.watch("foreigner") === "yes"
    )

    const currentFilteredIndex = filteredTabs.indexOf(activeTab)

    if (currentFilteredIndex < filteredTabs.length - 1) {
      await form.trigger(tabFields[activeTab])
      const newTab = filteredTabs[currentFilteredIndex + 1]
      setActiveTab(newTab)
      scrollToTab(newTab)
    }
  }

  const handlePrevious = async () => {
    const filteredTabs = tabs.filter(tab =>
      tab !== "foreigners" || form.watch("foreigner") === "yes"
    )

    const currentFilteredIndex = filteredTabs.indexOf(activeTab)

    if (currentFilteredIndex > 0) {
      await form.trigger(tabFields[activeTab])
      const newTab = filteredTabs[currentFilteredIndex - 1]
      setActiveTab(newTab)
      scrollToTab(newTab)
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
      "activityBan", "bannedActivity", "hasWageDeductions", "wageDeductionDetails", "wageDeductionDate"
    ],
    familyAndChildren: [
      "claimChildTaxRelief", "childrenInfo"
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

  useEffect(() => {
    const storedData = localStorage.getItem('formData')
    const parsedData = storedData ? JSON.parse(storedData) : {}
    if (!storedData || storedData === '{}' || !parsedData.givenCode) {
      setShowCodePopover(true)
    }
  }, [])

  return (
    <>

      <div className="min-h-svh flex items-center justify-center @container">
        <div className="form-container py-2 @xs:w-[100%] @lg:w-[400px] @2xl:w-[600px] @4xl:w-[800px]">
          <Form {...form} key={formKey}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
              <Tabs
                value={activeTab}
                onValueChange={async (newTab) => {
                  if (newTab === "foreigners" && form.watch("foreigner") !== "yes") return
                  await form.trigger(tabFields[activeTab])
                  setActiveTab(newTab)
                }}
                className="h-full flex flex-col"
              >
                <CodeValidationPopover
                  control={form.control}
                  showCodePopover={showCodePopover}
                  setShowCodePopover={setShowCodePopover}
                />
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
                          disabled={tab === "foreigners" && form.watch("foreigner") !== "yes"}
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
                  <PersonalInformationTab control={form.control} errors={form.formState.errors} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="addresses">
                  <AddressesTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="contacts">
                  <ContactsTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="foreigners">
                  <ForeignersTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="employment">
                  <EmploymentTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="educationAndLanguages">
                  <EducationAndLanguagesTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="healthAndSocialInfo">
                  <HealthAndSocialInfoTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="legalInfo">
                  <LegalInfoTab control={form.control} />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 p-2" value="familyAndChildren">
                  <FamilyAndChildrenTab control={form.control} />
                </TabsContent>
                <TabsContent className="flex flex-col overflow-scroll space-y-4 p-2" value="documents">
                  <DocumentsTab control={form.control} />
                </TabsContent>
                <TabsContent className="flex flex-col overflow-scroll space-y-4 p-2" value="agreements">
                  <AgreementsTab control={form.control} />
                </TabsContent>
                <NavigationButtons
                  activeTab={activeTab}
                  handlePrevious={handlePrevious}
                  handleNext={handleNext}
                  handleClear={handleClear}
                  onExportJSON={() => exportJSON(form.getValues())}
                  onImportJSON={handleImportJSON}
                  formControl={form.control}
                />
              </Tabs>
            </form>
          </Form>
        </div >
      </div >
    </>
  )
}

export default App
