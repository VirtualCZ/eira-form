import FormRadio from "@/customComponents/FormRadio"
import { FormTable } from "@/customComponents/FormTable"
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
                errors={Array.isArray(control._formState.errors.childrenInfo) ? control._formState.errors.childrenInfo : undefined}
            />
        </>
    )
}