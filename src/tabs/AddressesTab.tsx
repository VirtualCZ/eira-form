import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import FormCountrySelect from "@/customComponents/FormCountrySelect";
import { FormData } from "@/schemas/formSchema";
import { Control, useWatch, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface AddressesTabProps {
    control: Control<FormData>
}

export const AddressesTab = ({ control }: AddressesTabProps) => {
    const { t } = useTranslation();
    const { trigger } = useFormContext<FormData>();
    const contactSameAsPermanentAddress = useWatch({
        control,
        name: "contactSameAsPermanentAddress",
    });

    useEffect(() => {
        if (contactSameAsPermanentAddress === "no") {
            // Wait a bit for the schema to process
            setTimeout(async () => {
                await trigger([
                    "contactStreet",
                    "contactHouseNumber",
                    "contactCity",
                    "contactPostalCode",
                    "contactCountry"
                ]);
            }, 500);
        }
    }, [contactSameAsPermanentAddress, trigger]);

    return (
        <>
            <h1 className="text-lg font-semibold text-gray-900 mb-4 mt-6 first:mt-0">{t('form.headlines.permanentAddress')}</h1>
            <FormInput
                name="permanentStreet"
                formLabel={t('form.labels.street')}
                formControl={control}
            />
            <FormInput
                name="permanentHouseNumber"
                formLabel={t('form.labels.houseNumber')}
                formControl={control}
                inputType='number'
            />
            <FormInput
                name="permanentOrientationNumber"
                formLabel={t('form.labels.orientationNumber')}
                formControl={control}
            />
            <FormInput
                name="permanentCity"
                formLabel={t('form.labels.city')}
                formControl={control}
            />
            <FormInput
                name="permanentPostalCode"
                formLabel={t('form.labels.postalCode')}
                formControl={control}
                inputType='number'
            />
            <FormCountrySelect
                name="permanentCountry"
                formLabel={t('form.labels.country')}
                formControl={control}
                formTriggerClass="w-full"
            />
            <FormRadio
                name="contactSameAsPermanentAddress"
                formLabel={t('form.labels.contactSameAsPermanentAddress')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            {contactSameAsPermanentAddress === "no" && (
                <>
                    <h1 className="text-lg font-semibold text-gray-900 mb-4 mt-6">{t('form.headlines.contactAddress')}</h1>
                    <FormInput
                        name="contactStreet"
                        formLabel={t('form.labels.street')}
                        formControl={control}
                    />
                    <FormInput
                        name="contactHouseNumber"
                        formLabel={t('form.labels.houseNumber')}
                        formControl={control}
                        inputType='number'
                    />
                    <FormInput
                        name="contactOrientationNumber"
                        formLabel={t('form.labels.orientationNumber')}
                        formControl={control}
                    />
                    <FormInput
                        name="contactCity"
                        formLabel={t('form.labels.city')}
                        formControl={control}
                    />
                    <FormInput
                        name="contactPostalCode"
                        formLabel={t('form.labels.postalCode')}
                        formControl={control}
                        inputType='number'
                    />
                    <FormCountrySelect
                        name="contactCountry"
                        formLabel={t('form.labels.country')}
                        formControl={control}
                        formTriggerClass="w-full"
                    />
                </>
            )}
        </>
    );
};