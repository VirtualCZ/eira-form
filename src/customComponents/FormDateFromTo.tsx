import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import {
  Control,
  FieldPath,
  FieldValues,
  useWatch,
  useFormState,
} from "react-hook-form"
import DatePicker from "./DatePicker"
import { useTranslation } from "react-i18next"

type FormDateFromToProps<T extends FieldValues> = {
  nameFrom: FieldPath<T>
  nameTo: FieldPath<T>
  formLabel: string
  formControl: Control<T>
  formItemClass?: string
  formFieldClass?: string
  formMessage?: boolean
  yearsBack?: number
  yearsForward?: number
  minDaysApart?: number
}

export default function FormDateFromTo<T extends FieldValues>({
  nameFrom,
  nameTo,
  formLabel,
  formControl,
  formItemClass,
  formFieldClass,
  formMessage = true,
  yearsBack,
  yearsForward,
  minDaysApart = 0,
}: FormDateFromToProps<T>) {
  const { t } = useTranslation()
  const { errors } = useFormState({ control: formControl });
  const fromValue = useWatch({ control: formControl, name: nameFrom })
  const toValue = useWatch({ control: formControl, name: nameTo })

  const normalizeDate = (value: unknown) => {
    if (!value) return null
    const date = new Date(value as string | number | Date)
    if (Number.isNaN(date.getTime())) return null
    date.setHours(0, 0, 0, 0)
    return date
  }

  return (
    <div className={cn("flex flex-col gap-2", formItemClass)}>
      {/* First row: Label */}
      <FormLabel
        data-error={errors?.[nameFrom] || errors?.[nameTo] ? "true" : undefined}
      >
        {formLabel}
      </FormLabel>
      {/* Second row: Date pickers */}
      <div className="flex flex-row gap-2">
        <FormField
          control={formControl}
          name={nameFrom}
          render={({ field }) => (
            <FormItem className="mb-0 flex-1">
              <FormLabel>{t('form.labels.dateFrom')}</FormLabel>
              <FormControl>
                <DatePicker
                  field={field}
                  className={formFieldClass}
                  disabled={date => {
                    const toDate = normalizeDate(toValue)
                    if (!toDate) return false

                    const currentDate = new Date(date)
                    currentDate.setHours(0, 0, 0, 0)
                    if (currentDate > toDate) return true

                    if (minDaysApart > 0) {
                      const minFromDate = new Date(toDate)
                      minFromDate.setDate(minFromDate.getDate() - minDaysApart)
                      return currentDate > minFromDate
                    }

                    return false
                  }}
                  yearsBack={yearsBack}
                  yearsForward={yearsForward}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={formControl}
          name={nameTo}
          render={({ field }) => (
            <FormItem className="mb-0 flex-1">
              <FormLabel>{t('form.labels.dateTo')}</FormLabel>
              <FormControl>
                <DatePicker
                  field={field}
                  className={formFieldClass}
                  disabled={date => {
                    const fromDate = normalizeDate(fromValue)
                    if (!fromDate) return false

                    const currentDate = new Date(date)
                    currentDate.setHours(0, 0, 0, 0)
                    if (currentDate < fromDate) return true

                    if (minDaysApart > 0) {
                      const minToDate = new Date(fromDate)
                      minToDate.setDate(minToDate.getDate() + minDaysApart)
                      return currentDate < minToDate
                    }

                    return false
                  }}
                  yearsBack={yearsBack}
                  yearsForward={yearsForward}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      {/* Third row: Error messages */}
      {formMessage && (
        <div className="mb-2 flex flex-row gap-2">
          {errors?.[nameFrom] && (
            <FormMessage>{errors[nameFrom]?.message as React.ReactNode}</FormMessage>
          )}
          {errors?.[nameTo] && (
            <FormMessage>{errors[nameTo]?.message as React.ReactNode}</FormMessage>
          )}
        </div>
      )}
    </div>
  );
}
