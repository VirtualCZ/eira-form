import FormPhotoUpload from "@/customComponents/FormPhotoUpload"
import { FormData } from "@/schemas/formSchema"
import { Control, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface DocumentsTabProps {
    control: Control<FormData>
}

export const DocumentsTab = ({ control }: DocumentsTabProps) => {
    const { t } = useTranslation()
    const isForeigner = useWatch({
        control,
        name: "foreigner",
    });

    return (
        <div className="grid grid-cols-1 gap-4 mb-4">
            {isForeigner === "yes" && (
                <>
                    <FormPhotoUpload
                        name="travelDocumentCopy"
                        label={t('form.labels.travelDocumentCopy')}
                        formControl={control}
                    />
                    <FormPhotoUpload
                        name="residencePermitCopy"
                        label={t('form.labels.residencePermitCopy')}
                        formControl={control}
                    />
                </>
            )}
            <FormPhotoUpload
                name="educationCertificate"
                label={t('form.labels.educationCertificate')}
                formControl={control}
            />
            <FormPhotoUpload
                name="wageDeductionDecision"
                label={t('form.labels.wageDeductionDecision')}
                formControl={control}
            />
            <FormPhotoUpload
                name="foodPass"
                label={t('form.labels.foodPass')}
                formControl={control}
            />
        </div>
    )
}