import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormData } from "@/schemas/formSchema";
import { Control, FieldPath } from "react-hook-form";

interface FormInputProps {
    name: FieldPath<FormData>,
    formLabel: string,
    formPlaceholder?: string,
    formMessage?: boolean,
    formControl: Control<FormData>,
    formItemClass?: string,
    formFieldClass?: string,
    inputType?: React.HTMLInputTypeAttribute
}

const FormInput = ({
    name,
    formLabel,
    formPlaceholder = "",
    formMessage = true,
    formControl,
    formItemClass,
    formFieldClass,
    inputType = "text"
}: FormInputProps) => {
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
                            onChange={(e) => {
                                const value = e.target.value;
                                if (inputType === "number") {
                                    field.onChange(value === "" ? undefined : Number(value));
                                } else {
                                    field.onChange(value);
                                }
                            }}
                            value={
                                typeof field.value === "string" || typeof field.value === "number"
                                    ? field.value
                                    : ""
                            } />
                    </FormControl>
                    {formMessage ? <FormMessage /> : null}
                </FormItem>
            )}
        />
    )
}

export default FormInput;