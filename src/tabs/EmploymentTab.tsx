import FormDateFromTo from "@/customComponents/FormDateFromTo"
import FormInput from "@/customComponents/FormInput"
import FormRadio from "@/customComponents/FormRadio"
import { FormData } from "@/schemas/formSchema"
import { Control, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface EmploymentTabProps {
    control: Control<FormData>
}

export const EmploymentTab = ({ control }: EmploymentTabProps) => {
    const { t } = useTranslation()
    const firstJobInCz = useWatch({ control, name: "firstJobInCz" })

    return (
        <>
            <FormInput
                name="employmentClassification"
                formLabel={t('form.labels.employmentClassification')}
                formControl={control}
            />
            <FormInput
                name="jobPosition"
                formLabel={t('form.labels.jobPosition')}
                formControl={control}
            />
            <FormRadio
                name="firstJobInCz"
                formLabel={t('form.labels.firstJobInCz')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            {firstJobInCz === "no" && (
                <>
                    <FormInput
                        name="lastEmployer"
                        formLabel={t('form.labels.lastEmployer')}
                        formControl={control}
                    />
                    <FormInput
                        name="lastJobType"
                        formLabel={t('form.labels.lastJobType')}
                        formControl={control}
                    />
                    <FormDateFromTo
                        nameFrom="lastJobPeriodFrom"
                        nameTo="lastJobPeriodTo"
                        formLabel={t('form.labels.lastJobPeriod')}
                        formControl={control}
                        formFieldClass='w-[100%]'
                        formItemClass="flex-1"
                    />
                </>
            )}
        </>
    )
}