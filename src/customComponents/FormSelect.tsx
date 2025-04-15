import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  formLabel: string;
  formControl: Control<T>;
  formItemClass?: string;
  formTriggerClass?: string;
  formMessage?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const FormSelect = <T extends FieldValues>({
  name,
  formLabel,
  formControl,
  formItemClass,
  formTriggerClass,
  formMessage = true,
  options,
  placeholder = "-"
}: FormSelectProps<T>) => {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClass}>
          <FormLabel>{formLabel}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

export default FormSelect;