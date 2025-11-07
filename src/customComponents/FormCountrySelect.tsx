import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getCountryOptions } from "@/lib/countries";

interface FormCountrySelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  formLabel: string;
  formControl: Control<T>;
  formItemClass?: string;
  formTriggerClass?: string;
  formMessage?: boolean;
  placeholder?: string;
}

const FormCountrySelect = <T extends FieldValues>({
  name,
  formLabel,
  formControl,
  formItemClass,
  formTriggerClass,
  formMessage = true,
  placeholder = "-"
}: FormCountrySelectProps<T>) => {
  const { t } = useTranslation();
  const options = getCountryOptions(t);

  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClass}>
          <FormLabel>{formLabel}</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Convert string to number for storage
              const numValue = value ? parseInt(value, 10) : null;
              field.onChange(numValue);
            }} 
            value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
            key={field.value ?? 'empty'}
          >
            <FormControl>
              <SelectTrigger className={formTriggerClass}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
};

export default FormCountrySelect;

