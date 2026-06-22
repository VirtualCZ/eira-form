import FormInput from "@/customComponents/FormInput"
import FormDate from "@/customComponents/FormDate"
import FormRadio from "@/customComponents/FormRadio"
import { FormTable } from "@/customComponents/FormTable"
import { isIcuk } from "@/config/formVariants"
import { FormData } from "@/schemas/formSchema"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface FamilyAndChildrenTabProps {
    control: Control<FormData>
}

export const FamilyAndChildrenTab = ({ control }: FamilyAndChildrenTabProps) => {
    const { t } = useTranslation()

    return (
        <>
            <FormRadio
                name="claimChildTaxRelief"
                formLabel={t('form.labels.claimChildTaxRelief')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            {isIcuk() && (
                <>
                    <FormInput
                        name="spouseFullName"
                        formLabel={t('form.labels.spouseFullName')}
                        formControl={control}
                    />
                    <FormDate
                        name="spouseDateOfBirth"
                        formLabel={t('form.labels.spouseDateOfBirth')}
                        formControl={control}
                        yearsBack={100}
                    />
                    <FormInput
                        name="spouseResidence"
                        formLabel={t('form.labels.spouseResidence')}
                        formControl={control}
                    />
                    <FormInput
                        name="spouseEmployer"
                        formLabel={t('form.labels.spouseEmployer')}
                        formControl={control}
                    />
                </>
            )}
            <FormTable
                name="childrenInfo"
                label={t('form.headlines.childrenInfo')}
                formControl={control}
                columns={[
                    {
                        name: "childrenInfoFullName",
                        label: t('form.labels.childrenInfoFullName'),
                        placeholder: "",
                        errorPath: "childrenInfoFullName"
                    },
                    {
                        name: "childrenInfoBirthNumber",
                        label: t('form.labels.childrenInfoBirthNumber'),
                        placeholder: "",
                        errorPath: "childrenInfoBirthNumber"
                    }
                ]}
            />
        </>
    )
}