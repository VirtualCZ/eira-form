import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Textarea } from "@/components/ui/textarea"
import { FormData } from "@/schemas/formSchema"
import FormCheckbox from "@/customComponents/FormCheckbox"
import { FormItem, FormLabel } from "@/components/ui/form"
import { isIcuk } from "@/config/formVariants"

interface AgreementsTabProps {
    control: Control<FormData>
    orgUnitName?: string
}

export const AgreementsTab = ({ control, orgUnitName }: AgreementsTabProps) => {
    const { t } = useTranslation()
    const icuk = isIcuk()
    const variant = icuk ? 'icuk' : 'gas'

    const employeeDeclarationText = t(`form.declarations.${variant}.employeeDeclarationText`)
    const emailDeclarationText = t(`form.declarations.${variant}.emailDeclarationText`)

    const translatedText = t('form.declarations.gas.personalDataProcessingText')
    const controllerName = orgUnitName?.trim()
    let personalDataProcessingText = translatedText
    if (controllerName) {
        personalDataProcessingText = personalDataProcessingText
            .replace(/\[název společnosti\]/g, controllerName)
            .replace(/\[company name\]/g, controllerName)
    }

    return (
        <>
            <FormItem>
                <FormLabel>{t('app.declarations.employeeDeclaration')}</FormLabel>
                <Textarea
                    readOnly
                    className='min-h-[200px] w-full resize-y'
                    value={employeeDeclarationText}
                />
            </FormItem>

            <FormCheckbox
                name="confirmationReadEmployeeDeclaration"
                formLabel={t('form.labels.confirmationReadEmployeeDeclaration')}
                formControl={control}
            />

            <FormItem>
                <FormLabel>{t('app.declarations.emailAddressDeclaration')}</FormLabel>
                <Textarea
                    readOnly
                    className='min-h-[200px] w-full resize-y'
                    value={emailDeclarationText}
                />
            </FormItem>

            <FormCheckbox
                name="confirmationReadEmailAddressDeclaration"
                formLabel={t('form.labels.confirmationReadEmailAddressDeclaration')}
                formControl={control}
            />

            {!icuk && (
                <>
                    <FormItem>
                        <FormLabel>{t('app.declarations.personalDataProcessing')}</FormLabel>
                        <Textarea
                            readOnly
                            className='min-h-[200px] w-full resize-y'
                            value={personalDataProcessingText}
                        />
                    </FormItem>

                    <FormCheckbox
                        name="confirmationReadPersonalDataProcessing"
                        formLabel={t('form.labels.confirmationReadPersonalDataProcessing')}
                        formControl={control}
                    />
                </>
            )}
        </>
    )
}
