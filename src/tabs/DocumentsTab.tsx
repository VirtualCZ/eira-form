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
    const receivesPension = useWatch({
        control,
        name: "receivesPension",
    });
    const claimChildTaxRelief = useWatch({
        control,
        name: "claimChildTaxRelief",
    });
    const childrenInfo = useWatch({
        control,
        name: "childrenInfo",
    });

    // Count how many children were added
    const numChildren = childrenInfo?.length || 0;

    return (
        <div className="grid grid-cols-1 gap-4 mb-4">
            {isForeigner === "yes" && (
                <>
                    <FormPhotoUpload
                        name="visaPassport"
                        label={t('form.labels.visaPassport')}
                        formControl={control}
                        required={true}
                    />
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
                name="highestEducationDocument"
                label={t('form.labels.highestEducationDocument')}
                formControl={control}
            />
            
            <FormPhotoUpload
                name="employmentConfirmation"
                label={t('form.labels.employmentConfirmation')}
                formControl={control}
            />
            
            {receivesPension === "yes" && (
                <FormPhotoUpload
                    name="pensionDecision"
                    label={t('form.labels.pensionDecision')}
                    formControl={control}
                    required={true}
                />
            )}
            
            {claimChildTaxRelief === "yes" && (
                <>
                    {numChildren > 0 && [...Array(numChildren)].map((_, index) => {
                        const fieldName = `childBirthCertificate${index + 1}` as string;
                        return (
                            <FormPhotoUpload
                                key={index}
                                name={fieldName as any}
                                label={t(`form.labels.childBirthCertificate${index + 1}`)}
                                formControl={control}
                                required={index === 0}
                            />
                        );
                    })}
                    <FormPhotoUpload
                        name="childTaxReliefConfirmation"
                        label={t('form.labels.childTaxReliefConfirmation')}
                        formControl={control}
                    />
                </>
            )}
        </div>
    )
}