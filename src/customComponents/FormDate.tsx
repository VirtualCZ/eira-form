import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DatePicker from "./DatePicker";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormDateProps<T extends FieldValues> {
    name: FieldPath<T>,
    formLabel: string,
    formControl: Control<T>,
    formItemClass?: string,
    formFieldClass?: string,
    formMessage?: boolean
}

const FormDate = <T extends FieldValues>({
    name,
    formLabel,
    formControl,
    formItemClass,
    formFieldClass,
    formMessage = true
}: FormDateProps<T>) => {
    return (
        <FormField
            control={formControl}
            name={name}
            render={({ field }) => (
                <FormItem className={formItemClass}>
                    <FormLabel>{formLabel}</FormLabel>
                    <FormControl>
                        <DatePicker
                            field={field}
                            className={formFieldClass}
                        />
                    </FormControl>
                    {formMessage ? <FormMessage /> : null}
                </FormItem>
            )}
        />
    )
}

export default FormDate;