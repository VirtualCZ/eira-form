import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import { FormData } from "@/schemas/formSchema";
import { Control, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface AddressesTabProps {
    control: Control<FormData>
}

export const AddressesTab = ({ control }: AddressesTabProps) => {
    const { t } = useTranslation();
    const contactSameAsPermanentAddress = useWatch({
        control,
        name: "contactSameAsPermanentAddress",
    });

    return (
        <>
            <h1>{t('form.headlines.permanentAddress')}</h1>
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
            <FormInput
                name="permanentCountry"
                formLabel={t('form.labels.country')}
                formControl={control}
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
                    <h1>{t('form.headlines.contactAddress')}</h1>
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
                    <FormInput
                        name="contactCountry"
                        formLabel={t('form.labels.country')}
                        formControl={control}
                    />
                </>
            )}
        </>
    );
};