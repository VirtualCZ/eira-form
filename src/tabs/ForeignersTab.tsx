import FormDateFromTo from "@/customComponents/FormDateFromTo";
import FormInput from "@/customComponents/FormInput";
import { FormData } from "@/schemas/formSchema";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ForeignersTabProps {
    control: Control<FormData>
}

export const ForeignersTab = ({ control }: ForeignersTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <FormInput
                name="foreignPermanentAddress"
                formLabel={t('form.labels.foreignPermanentAddress')}
                formControl={control}
            />
            <FormInput
                name="residencePermitNumber"
                formLabel={t('form.labels.residencePermitNumber')}
                formControl={control}
                inputType='number'
            />
            <FormDateFromTo
                nameFrom="residencePermitValidityFrom"
                nameTo="residencePermitValidityUntil"
                formLabel={t('form.labels.residencePermitValidity')}
                formControl={control}
                formFieldClass='w-[100%]'
                formItemClass="flex-1"
            />
            <FormInput
                name="residencePermitType"
                formLabel={t('form.labels.residencePermitType')}
                formControl={control}
            />
            <FormInput
                name="residencePermitPurpose"
                formLabel={t('form.labels.residencePermitPurpose')}
                formControl={control}
            />
        </>
    );
};