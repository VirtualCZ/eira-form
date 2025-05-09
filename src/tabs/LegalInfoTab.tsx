import FormDate from "@/customComponents/FormDate";
import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import { Control, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface LegalInfoTabProps {
    control: Control<any>
}

export const LegalInfoTab = ({ control }: LegalInfoTabProps) => {
    const { t } = useTranslation();
    const activityBan = useWatch({ name: "activityBan", control });
    const hasWageDeductions = useWatch({ name: "hasWageDeductions", control });

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
            {activityBan === "yes" && (<FormInput
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
            {hasWageDeductions === "yes" && (
                <>
                    <FormInput
                        name="wageDeductionDetails"
                        formLabel={t('form.labels.wageDeductionDetails')}
                        formControl={control}
                    />
                    <FormDate
                        name="wageDeductionDate"
                        formLabel={t('form.labels.wageDeductionDate')}
                        formControl={control}
                    />
                </>
            )}
        </>
    );
};