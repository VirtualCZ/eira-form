import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { useEffect } from "react";
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
  /**
   * What should be stored in react-hook-form field:
   * - "id": store country ID (number, from parseInt)
   * - "label": store country label (translated Czech name)
   */
  valueMode?: "id" | "label";
}

type CountryOption = { value: string; label: string };

const CountrySelectField = ({
  field,
  options,
  valueMode,
  placeholder,
  formTriggerClass,
  formItemClass,
  formLabel,
  formMessage,
}: {
  field: { value: any; onChange: (v: any) => void };
  options: CountryOption[];
  valueMode: "id" | "label";
  placeholder: string;
  formTriggerClass?: string;
  formItemClass?: string;
  formLabel: string;
  formMessage: boolean;
}) => {
  // If the field already contains an old numeric ID (stored as string),
  // convert it to the Czech label so we always submit the label.
  useEffect(() => {
    if (valueMode !== "label") return;
    if (field.value === null || field.value === undefined || field.value === "") return;

    const byLabel = options.find((o) => o.label === field.value);
    if (byLabel) return; // already converted

    const byValue = options.find((o) => o.value === field.value);
    if (!byValue) return;

    field.onChange(byValue.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value, options, valueMode]);

  const selectValue =
    valueMode === "label"
      ? field.value !== null && field.value !== undefined
        ? (() => {
            const byLabel = options.find((o) => o.label === field.value);
            if (byLabel) return byLabel.value;

            const byValue = options.find((o) => o.value === field.value);
            return byValue ? byValue.value : "";
          })()
        : ""
      : field.value !== null && field.value !== undefined
        ? String(field.value)
        : "";

  return (
    <FormItem className={formItemClass}>
      <FormLabel>{formLabel}</FormLabel>
      <Select
        onValueChange={(value) => {
          if (!value) {
            field.onChange(null);
            return;
          }

          if (valueMode === "label") {
            const matched = options.find((o) => o.value === value);
            field.onChange(matched ? matched.label : null);
            return;
          }

          // Default: store ID as number (existing behavior)
          const numValue = parseInt(value, 10);
          field.onChange(isNaN(numValue) ? null : numValue);
        }}
        value={selectValue}
        key={field.value ?? "empty"}
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
  );
};

const FormCountrySelect = <T extends FieldValues>({
  name,
  formLabel,
  formControl,
  formItemClass,
  formTriggerClass,
  formMessage = true,
  placeholder = "-",
  valueMode = "id"
}: FormCountrySelectProps<T>) => {
  const { t } = useTranslation();
  const options = getCountryOptions(t) as CountryOption[];

  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <CountrySelectField
          field={field}
          options={options}
          valueMode={valueMode}
          placeholder={placeholder}
          formTriggerClass={formTriggerClass}
          formItemClass={formItemClass}
          formLabel={formLabel}
          formMessage={formMessage}
        />
      )}
    />
  );
};

export default FormCountrySelect;

