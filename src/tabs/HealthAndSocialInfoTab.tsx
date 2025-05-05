import FormDate from "@/customComponents/FormDate";
import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import FormSelect from "@/customComponents/FormSelect";
import { FormData } from "@/schemas/formSchema";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface HealthAndSocialInfoTabProps {
    control: Control<FormData>
}

export const HealthAndSocialInfoTab = ({ control }: HealthAndSocialInfoTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <FormRadio
                name="hasDisability"
                formLabel={t('form.labels.hasDisability')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            <FormInput
                name="disabilityType"
                formLabel={t('form.labels.disabilityType')}
                formControl={control}
            />
            <FormDate
                name="disabilityDecisionDate"
                formLabel={t('form.labels.disabilityDecisionDate')}
                formControl={control}
            />
            <FormRadio
                name="receivesPension"
                formLabel={t('form.labels.receivesPension')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            <FormSelect
                name="pensionType"
                formLabel={t('form.labels.pensionType')}
                formControl={control}
                formTriggerClass='w-full'
                options={[
                    { value: "-", label: t('form.options.pensionType.none') },
                    { value: "oldAgePension", label: t('form.options.pensionType.oldAgePension') },
                    { value: "earlyOldAgePension", label: t('form.options.pensionType.earlyOldAgePension') },
                    { value: "fullDisabilityPension", label: t('form.options.pensionType.fullDisabilityPension') },
                    { value: "partialDisabilityPension", label: t('form.options.pensionType.partialDisabilityPension') },
                    { value: "widowsPension", label: t('form.options.pensionType.widowsPension') },
                    { value: "widowersPension", label: t('form.options.pensionType.widowersPension') },
                    { value: "orphansPension", label: t('form.options.pensionType.orphansPension') }
                ]}
                placeholder="--."
                formMessage={false}
            />
            <FormDate
                name="pensionDecisionDate"
                formLabel={t('form.labels.pensionDecisionDate')}
                formControl={control}
            />
        </>
    );
};