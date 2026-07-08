import FormDateFromTo from "@/customComponents/FormDateFromTo"
import FormInput from "@/customComponents/FormInput"
import FormRadio from "@/customComponents/FormRadio"
import { isIcuk } from "@/config/formVariants"
import { FormData } from "@/schemas/formSchema"
import { Control, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface EmploymentTabProps {
    control: Control<FormData>
}

export const EmploymentTab = ({ control }: EmploymentTabProps) => {
    const { t } = useTranslation()
    const firstJobInCz = useWatch({ control, name: "firstJobInCz" })
    const hasOtherEmployment = useWatch({ control, name: "hasOtherEmployment" })

    const periodLabel = isIcuk()
        ? t('form.labels.lastEmploymentOrLaborOfficePeriod')
        : t('form.labels.lastJobPeriod')

    return (
        <>
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
                        formLabel={periodLabel}
                        formControl={control}
                        formFieldClass='w-[100%]'
                        formItemClass="flex-1"
                        minDaysApart={14}
                    />
                </>
            )}
            {isIcuk() && (
                <>
                    <FormRadio
                        name="hasOtherEmployment"
                        formLabel={t('form.labels.hasOtherEmployment')}
                        formControl={control}
                        options={[
                            { value: "yes", label: t('form.options.yesNo.yes') },
                            { value: "no", label: t('form.options.yesNo.no') },
                        ]}
                    />
                    {hasOtherEmployment === "yes" && (
                        <>
                            <FormInput
                                name="otherEmployerName"
                                formLabel={t('form.labels.otherEmployerName')}
                                formControl={control}
                            />
                            <FormInput
                                name="otherEmployerSeat"
                                formLabel={t('form.labels.otherEmployerSeat')}
                                formControl={control}
                            />
                        </>
                    )}
                    <FormRadio
                        name="registeredAtLaborOffice"
                        formLabel={t('form.labels.registeredAtLaborOffice')}
                        formControl={control}
                        options={[
                            { value: "yes", label: t('form.options.yesNo.yes') },
                            { value: "no", label: t('form.options.yesNo.no') },
                        ]}
                    />
                    <FormRadio
                        name="isStudent"
                        formLabel={t('form.labels.isStudent')}
                        formControl={control}
                        options={[
                            { value: "yes", label: t('form.options.yesNo.yes') },
                            { value: "no", label: t('form.options.yesNo.no') },
                        ]}
                    />
                </>
            )}
        </>
    )
}
