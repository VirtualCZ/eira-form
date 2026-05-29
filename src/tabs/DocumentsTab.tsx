import FormPhotoUpload from "@/customComponents/FormPhotoUpload"
import { isIcuk } from "@/config/formVariants"
import { FormData } from "@/schemas/formSchema"
import { Control, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface DocumentsTabProps {
    control: Control<FormData>
}

export const DocumentsTab = ({ control }: DocumentsTabProps) => {
    const { t } = useTranslation()
    const icuk = isIcuk()
    const isForeigner = useWatch({ control, name: "foreigner" })
    const receivesPension = useWatch({ control, name: "receivesPension" })
    const claimChildTaxRelief = useWatch({ control, name: "claimChildTaxRelief" })
    const childrenInfo = useWatch({ control, name: "childrenInfo" })
    const registeredAtLaborOffice = useWatch({ control, name: "registeredAtLaborOffice" })
    const isStudent = useWatch({ control, name: "isStudent" })

    const numChildren = childrenInfo?.length || 0

    const childTaxReliefLabel = icuk
        ? t('form.labels.childTaxReliefConfirmationIcuk')
        : t('form.labels.childTaxReliefConfirmation')

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
                        required={icuk}
                    />
                    <FormPhotoUpload
                        name="residencePermitCopy"
                        label={t('form.labels.residencePermitCopy')}
                        formControl={control}
                        required={icuk}
                    />
                </>
            )}

            <FormPhotoUpload
                name="highestEducationDocument"
                label={t('form.labels.highestEducationDocument')}
                formControl={control}
                required={icuk}
            />

            <FormPhotoUpload
                name="employmentConfirmation"
                label={t('form.labels.employmentConfirmation')}
                formControl={control}
                required={icuk}
            />

            {icuk && (
                <FormPhotoUpload
                    name="criminalRecordExtract"
                    label={t('form.labels.criminalRecordExtract')}
                    formControl={control}
                    required={true}
                />
            )}

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
                        const fieldName = `childBirthCertificate${index + 1}` as string
                        return (
                            <FormPhotoUpload
                                key={index}
                                name={fieldName as any}
                                label={t(`form.labels.childBirthCertificate${index + 1}`)}
                                formControl={control}
                                required={index === 0}
                            />
                        )
                    })}
                    <FormPhotoUpload
                        name="childTaxReliefConfirmation"
                        label={childTaxReliefLabel}
                        formControl={control}
                        required={icuk}
                    />
                </>
            )}

            {icuk && registeredAtLaborOffice === "yes" && (
                <FormPhotoUpload
                    name="laborOfficeEvidenceConfirmation"
                    label={t('form.labels.laborOfficeEvidenceConfirmation')}
                    formControl={control}
                    required={true}
                />
            )}

            {icuk && isStudent === "yes" && (
                <FormPhotoUpload
                    name="studyConfirmation"
                    label={t('form.labels.studyConfirmation')}
                    formControl={control}
                    required={true}
                />
            )}
        </div>
    )
}
