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
  radioGroupClass = "flex flex-col"
}: FormRadioProps<T>) => {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={`space-y-1 ${formItemClass || ""}`}>
          <FormLabel>{formLabel}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value || undefined}
              className={radioGroupClass}
            >
              {options.map((option) => {
                const optionId = `${name}-${option.value}`;
                const hasError = !!fieldState.error;
                return (
                  <label 
                    key={option.value}
                    htmlFor={optionId}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors w-full ${
                      hasError 
                        ? 'border border-red-200 bg-red-50 hover:bg-red-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      className={`${formFieldClass} ${hasError ? 'border-red-300' : ''}`}
                      id={optionId}
                    />
                    <span className={`text-sm font-normal ${hasError ? 'text-red-700' : ''}`}>
                    {option.label}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          {formMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
};

export default FormRadio;