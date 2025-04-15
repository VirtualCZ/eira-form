import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioProps<T extends FieldValues> {
  name: FieldPath<T>;
  formLabel: string;
  formControl: Control<T>;
  formItemClass?: string;
  formFieldClass?: string;
  formMessage?: boolean;
  options: RadioOption[];
  radioGroupClass?: string;
}

const FormRadio = <T extends FieldValues>({
  name,
  formLabel,
  formControl,
  formItemClass,
  formFieldClass,
  formMessage = true,
  options,
  radioGroupClass = "flex flex-col space-y-1"
}: FormRadioProps<T>) => {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem className={`space-y-3 ${formItemClass || ""}`}>
          <FormLabel>{formLabel}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={radioGroupClass}
            >
              {options.map((option) => (
                <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={option.value} className={formFieldClass} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {formMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
};

export default FormRadio;