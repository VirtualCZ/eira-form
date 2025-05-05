import FormInput from "@/customComponents/FormInput";
import { FormData } from "@/schemas/formSchema";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ContactsTabProps {
    control: Control<FormData>
}

export const ContactsTab = ({ control }: ContactsTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <FormInput
                name="email"
                formLabel={t('form.labels.email')}
                formControl={control}
            />
            <FormInput
                name="phone"
                formLabel={t('form.labels.phone')}
                formControl={control}
            />
            <FormInput
                name="dataBoxId"
                formLabel={t('form.labels.dataBoxId')}
                formControl={control}
            />
        </>
    );
};