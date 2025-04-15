import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import './App.css'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './components/ui/form'
import DatePicker from './customComponents/DatePicker'
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { AlertCircle } from "lucide-react"
import { cn } from "./lib/utils"
import { useTranslation } from 'react-i18next'
import FormInput from './customComponents/FormInput'
import FormDate from './customComponents/FormDate'
import FormRadio from './customComponents/FormRadio'
import FormSelect from './customComponents/FormSelect'

// Move the schema creation inside the component
function App() {
  const { t } = useTranslation();

  // Create the schema inside the component
  const formSchema = z.object({
    honorific: z.string({
      required_error: t('form.validation.required.honorary'),
    }),
    name: z.string({
      required_error: t('form.validation.required.name'),
    }).min(2, {
      message: t('form.validation.format.name'),
    }),
    surname: z.string().min(2, {
      message: t('form.validation.format.surname'),
    }),
    birthSurname: z.string().min(2, {
      message: t('form.validation.format.birthSurname'),
    }).optional(),
    dob: z.date({
      required_error: t('form.validation.required.date'),
    }),
    sex: z.enum(["male", "female", "other"], {
      required_error: t('form.validation.required.sex'),
    }),
    titleBefore: z.string().optional(),
    titleAfter: z.string().optional(),
    ssn: z.string({
      required_error: t('form.validation.required.ssn'),
    }).regex(/^\d{6}\/\d{4}$/, {
      message: "SSN must be in the format yymmdd/1234.",
    }),
    isFirstJobInCzechia: z.string({
      required_error: "Please select an email to display.",
    }),
    citizenship: z.string({
      required_error: "Please select a country.",
    }),
    nationality: z.string({
      required_error: "Please select a nationality.",
    }),
    residenceFrom: z.date({
      required_error: "A date is required.",
    }),
    residenceUntil: z.date({
      required_error: "A date is required.",
    }),
    addressInAnotherCountry: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    residencePermitNumber: z.string().optional(),
    typeAndPurposeOfStay: z.string().optional(),
    ssnFromInsurance: z.string().optional(),
    insuranceRegNumber: z.string().optional(),
    ssnForeigner: z.string().optional(),
  })

  // Type inference will now work correctly
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: FormData) {
    console.log(values)
  }

  // Add state for tab management
  const [activeTab, setActiveTab] = useState("basic")

  // Add tab navigation functions
  const tabs = ["basic", "foreigner", "education"]
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

  // Add this helper function to check for errors in specific tabs
  const hasErrorsInTab = (tabName: string) => {
    const errors = form.formState.errors
    const basicFields = ['honorific', 'name', 'surname', 'birthSurname', 'dob', 'sex', 'ssn'] as const
    const foreignerFields = ['citizenship', 'nationality', 'residenceFrom', 'residenceUntil'] as const

    const fieldsToCheck =
      tabName === 'basic' ? basicFields :
        tabName === 'foreigner' ? foreignerFields : []

    return fieldsToCheck.some(field => field in errors)
  }

  return (
    <>
      <div className="min-h-svh flex items-center justify-center @container">
        <div className="form-container @xs:w-[100%] @lg:w-[400px] @2xl:w-[600px] @4xl:w-[800px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="mb-2">
                  <TabsTrigger
                    value="basic"
                    className={cn(
                      "flex items-center gap-1",
                      hasErrorsInTab('basic') && "bg-red-50 data-[state=active]:bg-red-100"
                    )}
                  >
                    {t('form.tabs.basic')}
                    {hasErrorsInTab('basic') && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="foreigner"
                    className={cn(
                      "flex items-center gap-1",
                      hasErrorsInTab('foreigner') && "bg-red-50 data-[state=active]:bg-red-100"
                    )}
                  >
                    {t('form.tabs.foreigner')}
                    {hasErrorsInTab('foreigner') && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="education">{t('form.tabs.education')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="basic">
                  <FormInput
                    name="titleBefore"
                    formLabel={t('form.labels.titleBefore')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="titleAfter"
                    formLabel={t('form.labels.titleAfter')}
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
                        name="name"
                        formLabel={t('form.labels.name')}
                        formControl={form.control}
                        formMessage={false}
                        formItemClass='flex-1'
                      />
                    </div>
                    <div className="flex gap-2">
                      <FormMessage>{form.formState.errors.honorific?.message} {form.formState.errors.name?.message}</FormMessage>
                    </div>
                  </div>
                  <FormInput
                    name="surname"
                    formLabel={t('form.labels.surname')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="birthSurname"
                    formLabel={t('form.labels.birthSurname')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="dob"
                    formLabel={t('form.labels.dob')}
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
                    name="ssn"
                    formLabel={t('form.labels.ssn')}
                    formControl={form.control}
                    formPlaceholder="250411/1234"
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="foreigner">
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
                    name="addressInAnotherCountry"
                    formLabel={t('form.labels.addressInAnotherCountry')}
                    formControl={form.control}
                  />
                  <FormField
                    control={form.control}
                    name="isFirstJobInCzechia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.isFirstJobInCzechia')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full" >
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="-">-</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormInput
                    name="residencePermitNumber"
                    formLabel={t('form.labels.residencePermitNumber')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="residenceFrom"
                    formLabel={t('form.labels.residenceFrom')}
                    formControl={form.control}
                  />
                  <FormDate
                    name="residenceUntil"
                    formLabel={t('form.labels.residenceUntil')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="typeAndPurposeOfStay"
                    formLabel={t('form.labels.typeAndPurposeOfStay')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="ssnFromInsurance"
                    formLabel={t('form.labels.ssnFromInsurance')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="insuranceRegNumber"
                    formLabel={t('form.labels.insuranceRegNumber')}
                    formControl={form.control}
                  />
                  <FormInput
                    name="ssnForeigner"
                    formLabel={t('form.labels.ssnForeigner')}
                    formControl={form.control}
                  />

                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4 px-2" value="education">
                  <div>Additional fields will be added later..</div>
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
      </div>
    </>
  )
}

export default App
