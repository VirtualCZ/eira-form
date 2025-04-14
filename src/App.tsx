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
    ssn: z.string().regex(/^\d{6}\/\d{4}$/, {
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
    ssnFromInsurace: z.string().optional(),
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
      <div className="flex flex-col items-center min-h-svh">
        <div className="form-container">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px] h-full flex flex-col">
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
                <TabsContent className="relative overflow-scroll space-y-4" value="basic">
                  <FormField
                    control={form.control}
                    name="titleBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.titleBefore')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="titleAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.titleAfter')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">

                      <FormField
                        control={form.control}
                        name="honorific"
                        render={({ field }) => (
                          <FormItem className="flex-none">
                            <FormLabel>{t('form.labels.honorific')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="--." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mr">{t('form.options.honorific.mr')}</SelectItem>
                                <SelectItem value="mrs">{t('form.options.honorific.mrs')}</SelectItem>
                                <SelectItem value="ms">{t('form.options.honorific.ms')}</SelectItem>
                                <SelectItem value="miss">{t('form.options.honorific.miss')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>{t('form.labels.name')}</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <FormMessage>{form.formState.errors.honorific?.message} {form.formState.errors.name?.message}</FormMessage>
                      </div>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.surname')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthSurname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.birthSurname')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.dob')}</FormLabel>
                        <FormControl>
                          <DatePicker
                            field={field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t('form.labels.sex')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t('form.options.sex.male')}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t('form.options.sex.female')}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t('form.options.sex.other')}
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ssn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.ssn')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="250411/1234"
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4" value="foreigner">
                  <FormField
                    control={form.control}
                    name="citizenship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.citizenship')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-100" >
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cz">Czech</SelectItem>
                            <SelectItem value="sk">Slovak</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="br">Brazilian</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.nationality')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-100" >
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="czech">Czech</SelectItem>
                            <SelectItem value="moravian">Moravian</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="polish">Polish</SelectItem>
                            <SelectItem value="gypsy">Gypsy</SelectItem>
                            <SelectItem value="russian">Russian</SelectItem>
                            <SelectItem value="silesian">Silesian</SelectItem>
                            <SelectItem value="slovakian">Slovenská</SelectItem>
                            <SelectItem value="ukrainian">Ukrainian</SelectItem>
                            <SelectItem value="vietnamese">Vietnamese</SelectItem>
                            <SelectItem value="hungarian">Hungarian</SelectItem>
                            <SelectItem value="khazakh">Khazakh</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressInAnotherCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.addressInAnotherCountry')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFirstJobInCzechia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.isFirstJobInCzechia')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-100" >
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
                  <FormField
                    control={form.control}
                    name="residencePermitNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.residencePermitNumber')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residenceFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.residenceFrom')}</FormLabel>
                        <FormControl>
                          <DatePicker
                            field={field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residenceUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.residenceUntil')}</FormLabel>
                        <FormControl>
                          <DatePicker
                            field={field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="typeAndPurposeOfStay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.typeAndPurposeOfStay')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ssnFromInsurace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.ssnFromInsurance')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insuranceRegNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.insuranceRegNumber')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ssnForeigner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.labels.ssnForeigner')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </TabsContent>
                <TabsContent className="relative overflow-scroll space-y-4" value="education">
                    <div>pikojakovoda</div>
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
