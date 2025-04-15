import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
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
  useFormState,
} from "react-hook-form"
import { DateRange } from "react-day-picker"
import { useTranslation } from "react-i18next"

type FormDateFromToProps<T extends FieldValues> = {
  nameFrom: FieldPath<T>
  nameTo: FieldPath<T>
  formLabel: string
  formControl: Control<T>
  formItemClass?: string
  formFieldClass?: string
  formMessage?: boolean
}

export default function FormDateFromTo<T extends FieldValues>({
  nameFrom,
  nameTo,
  formLabel,
  formControl,
  formItemClass,
  formFieldClass,
  formMessage = true,
}: FormDateFromToProps<T>) {
  const { t } = useTranslation();
  const { errors } = useFormState({ control: formControl })

  return (
    <div className="flex flex-col gap-2">
      <FormField
        control={formControl}
        name={nameFrom}
        render={({ field: fromField }) => (
          <FormField
            control={formControl}
            name={nameTo}
            render={({ field: toField }) => {
              const selectedRange: DateRange = {
                from: fromField.value,
                to: toField.value,
              }

              return (
                <FormItem className={cn("w-full", formItemClass)}>
                  <FormLabel>{formLabel}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedRange.from && "text-muted-foreground",
                            formFieldClass
                          )}
                          data-error={
                            errors?.[nameFrom] || errors?.[nameTo] ? "true" : undefined
                          }
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedRange.from ? (
                            selectedRange.to ? (
                              <>
                                {format(selectedRange.from, "LLL dd, y")} -{" "}
                                {format(selectedRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(selectedRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>{t('form.pickDate')}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={selectedRange}
                        onSelect={(range) => {
                          fromField.onChange(range?.from ?? undefined)
                          toField.onChange(range?.to ?? undefined)
                        }}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )
            }}
          />
        )}
      />
      <FormField
        control={formControl}
        name={nameFrom}
        render={() => (
          <FormItem className="">
            {formMessage && <FormMessage />}
          </FormItem>
        )}
      />

      <FormField
        control={formControl}
        name={nameTo}
        render={() => (
          <FormItem className="">
            {formMessage && <FormMessage />}
          </FormItem>
        )}
      />
    </div>
  )
}
