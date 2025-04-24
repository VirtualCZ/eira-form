import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
    name: FieldPath<T>,
    formLabel: string,
    formPlaceholder?: string,
    formMessage?: boolean,
    formControl: Control<T>,
    formItemClass?: string,
    formFieldClass?: string,
    inputType?: React.HTMLInputTypeAttribute
}

const FormInput = <T extends FieldValues>({
    name, 
    formLabel, 
    formPlaceholder = "", 
    formMessage = true, 
    formControl,
    formItemClass,
    formFieldClass,
    inputType = "text"
}: FormInputProps<T>) => {
    return (
        <FormField
            control={formControl}
            name={name}
            render={({ field }) => (
                <FormItem
                    className={formItemClass}
                >
                    <FormLabel>{formLabel}</FormLabel>
                    <FormControl>
                        <Input
                            className={formFieldClass}
                            placeholder={formPlaceholder}
                            type={inputType}
                            {...field}
                            onChange={e => {
                                if (inputType === "number") {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? undefined : Number(value));
                                } else {
                                    field.onChange(e);
                                }
                            }}
                            value={inputType === "number" && field.value === undefined ? "" : field.value}
                        />
                    </FormControl>
                    {formMessage ? <FormMessage /> : null}
                </FormItem>
            )}
        />
    )
}

export default FormInput;