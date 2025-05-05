import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface LegalInfoTabProps {
    control: Control<any>
}

export const LegalInfoTab = ({ control }: LegalInfoTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <FormRadio
                name="activityBan"
                formLabel={t('form.labels.activityBan')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            {control._formValues.activityBan === "yes" && (
                <FormInput
                    name="bannedActivity"
                    formLabel={t('form.labels.bannedActivity')}
                    formControl={control}
                />
            )}

            <FormRadio
                name="hasWageDeductions"
                formLabel={t('form.labels.hasWageDeductions')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            {control._formValues.hasWageDeductions === "yes" && (
                <FormInput
                    name="wageDeductionDetails"
                    formLabel={t('form.labels.wageDeductionDetails')}
                    formControl={control}
                />
            )}
        </>
    );
};