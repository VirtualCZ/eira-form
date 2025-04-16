import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormCheckboxProps<T extends FieldValues> {
    name: FieldPath<T>;
    formLabel: string;
    formMessage?: boolean;
    formControl: Control<T>;
    formItemClass?: string;
    formFieldClass?: string;
}

const FormCheckbox = <T extends FieldValues>({
    name,
    formLabel,
    formMessage = true,
    formControl,
    formItemClass,
    formFieldClass
}: FormCheckboxProps<T>) => {
    return (
        <FormField
            control={formControl}
            name={name}
            render={({ field }) => (
                <FormItem className={formItemClass + " flex flex-row items-center space-x-2"}>
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={formFieldClass}
                        />
                    </FormControl>
                    <FormLabel className="mb-0">{formLabel}</FormLabel>
                    {formMessage ? <FormMessage /> : null}
                </FormItem>
            )}
        />
    );
};

export default FormCheckbox;