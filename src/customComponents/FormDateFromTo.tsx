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
import DatePicker from "./DatePicker"

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
}: FormDateFromToProps<T>) {
  const { errors } = useFormState({ control: formControl });

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
            <FormItem className="flex-1">
              <FormControl>
                <DatePicker
                  field={field}
                  className={formFieldClass}
                  disabled={date => {
                    const toDate = formControl._formValues?.[nameTo];
                    return toDate ? date > new Date(toDate) : false;
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
            <FormItem className="flex-1">
              <FormControl>
                <DatePicker
                  field={field}
                  className={formFieldClass}
                  disabled={date => {
                    const fromDate = formControl._formValues?.[nameFrom];
                    return fromDate ? date < new Date(fromDate) : false;
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
        <div className="flex flex-row gap-2">
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
