import { FormItem, FormMessage } from "@/components/ui/form";
import FormDate from "@/customComponents/FormDate";
import FormInput from "@/customComponents/FormInput";
import FormRadio from "@/customComponents/FormRadio";
import FormSelect from "@/customComponents/FormSelect";
import FormCountrySelect from "@/customComponents/FormCountrySelect";
import { FormData } from "@/schemas/formSchema";
import { Control, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface PersonalInformationTabProps {
    control: Control<FormData>
    errors: Record<string, { message?: string }>
}

export const PersonalInformationTab = ({
    control,
    errors
}: PersonalInformationTabProps) => {
    const { t } = useTranslation();
    const isForeigner = useWatch({
        control,
        name: "foreigner",
    });

    return (
        <>
            <FormInput
                name="titleBeforeName" 
                formLabel={t('form.labels.titleBeforeName')}
                formControl={control}
            />
            <FormInput
                name="titleAfterName"
                formLabel={t('form.labels.titleAfterName')}
                formControl={control}
            />
            <div className="flex gap-2">
                <FormSelect
                    name="honorific"
                    formLabel={t('form.labels.honorific')}
                    formControl={control}
                    formItemClass="flex-none"
                    formMessage={false}
                    options={[
                        { value: "mr", label: t('form.options.honorific.mr') },
                        { value: "mrs", label: t('form.options.honorific.mrs') },
                        { value: "ms", label: t('form.options.honorific.ms') },
                        { value: "miss", label: t('form.options.honorific.miss') }
                    ]}
                    placeholder="--."
                />
                <FormInput
                    name="firstName"
                    formLabel={t('form.labels.firstName')}
                    formControl={control}
                    formItemClass="flex-1"
                    formMessage={false}
                />
            </div>
            {(errors.honorific?.message || errors.firstName?.message) && (
                <div className="mb-4">
                    <FormItem>
                        <FormMessage>
                            {errors.honorific?.message} {errors.firstName?.message}
                        </FormMessage>
                    </FormItem>
                </div>
            )}
            <FormInput
                name="lastName"
                formLabel={t('form.labels.lastName')}
                formControl={control}
            />
            <FormInput
                name="birthSurname"
                formLabel={t('form.labels.birthSurname')}
                formControl={control}
            />
            <FormDate
                name="dateOfBirth"
                formLabel={t('form.labels.dateOfBirth')}
                formControl={control}
                yearsBack={100}
            />
            <FormRadio
                name="sex"
                formLabel={t('form.labels.sex')}
                formControl={control}
                options={[
                    { value: "male", label: t('form.options.sex.male') },
                    { value: "female", label: t('form.options.sex.female') },
                ]}
            />
            <FormInput
                name="placeOfBirth"
                formLabel={t('form.labels.placeOfBirth')}
                formControl={control}
            />
            <FormSelect
                name="maritalStatus"
                formLabel={t('form.labels.maritalStatus')}
                formControl={control}
                options={[
                    { value: "single", label: t('form.options.maritalStatus.single') },
                    { value: "married", label: t('form.options.maritalStatus.married') },
                    { value: "divorced", label: t('form.options.maritalStatus.divorced') },
                    { value: "widowed", label: t('form.options.maritalStatus.widowed') }
                ]}
                formTriggerClass='w-[100%]'
            />
            <FormRadio
                name="foreigner"
                formLabel={t('form.labels.foreigner')}
                formControl={control}
                options={[
                    { value: "yes", label: t('form.options.yesNo.yes') },
                    { value: "no", label: t('form.options.yesNo.no') },
                ]}
            />
            <FormInput
                name="birthNumber"
                formLabel={t('form.labels.birthNumber')}
                formControl={control}
                formPlaceholder="250411/1234"
            />
            {isForeigner === "yes" && (
                <>
                    <FormInput
                        name="foreignBirthNumber"
                        formLabel={t('form.labels.foreignBirthNumber')}
                        formControl={control}
                    />
                    <FormInput
                        name="insuranceBirthNumber"
                        formLabel={t('form.labels.insuranceBirthNumber')}
                        formControl={control}
                        inputType='number'
                    />
                    <FormInput
                        name="passportNumber"
                        formLabel={t('form.labels.passportNumber')}
                        formControl={control}
                    />
                    <FormInput
                        name="passportIssuedBy"
                        formLabel={t('form.labels.passportIssuedBy')}
                        formControl={control}
                    />
                </>
            )}
            {/* <FormInput
                    name="idCardNumber"
                    formLabel={t('form.labels.idCardNumber')}
                    formControl={control}
                  />
                  <FormInput
                    name="idCardIssuedBy"
                    formLabel={t('form.labels.idCardIssuedBy')}
                    formControl={control}
                  /> */}
            <FormCountrySelect
                name="citizenship"
                formLabel={t('form.labels.citizenship')}
                formControl={control}
                formTriggerClass='w-full'
            />
            <FormSelect
                name="nationality"
                formLabel={t('form.labels.nationality')}
                formControl={control}
                formTriggerClass='w-full'
                options={[
                    { value: "czech", label: t('form.options.nationality.czech') },
                    { value: "moravian", label: t('form.options.nationality.moravian') },
                    { value: "german", label: t('form.options.nationality.german') },
                    { value: "polish", label: t('form.options.nationality.polish') },
                    { value: "gypsy", label: t('form.options.nationality.gypsy') },
                    { value: "russian", label: t('form.options.nationality.russian') },
                    { value: "silesian", label: t('form.options.nationality.silesian') },
                    { value: "slovakian", label: t('form.options.nationality.slovakian') },
                    { value: "ukrainian", label: t('form.options.nationality.ukrainian') },
                    { value: "vietnamese", label: t('form.options.nationality.vietnamese') },
                    { value: "hungarian", label: t('form.options.nationality.hungarian') },
                    { value: "khazakh", label: t('form.options.nationality.khazakh') }

                ]}
                placeholder="-"
            />
            <FormInput
                name="bankingInstitutionName"
                formLabel={t('form.labels.bankingInstitutionName')}
                formControl={control}
            />
            <FormInput
                name="bankAccountNumber"
                formLabel={t('form.labels.bankAccountNumber')}
                formControl={control}
                inputType='number'
            />
            <FormSelect
                name="bankCode"
                formLabel={t('form.labels.bankCode')}
                formControl={control}
                formTriggerClass='w-full'
                options={[
                    { value: "-", label: "-" },
                    { value: "0100", label: "0100" },
                    { value: "0300", label: "0300" },
                    { value: "0600", label: "0600" },
                    { value: "0710", label: "0710" },
                    { value: "0800", label: "0800" },
                    { value: "2010", label: "2010" },
                    { value: "2060", label: "2060" },
                    { value: "2070", label: "2070" },
                    { value: "2100", label: "2100" },
                    { value: "2200", label: "2200" },
                    { value: "2220", label: "2220" },
                    { value: "2250", label: "2250" },
                    { value: "2260", label: "2260" },
                    { value: "2275", label: "2275" },
                    { value: "2600", label: "2600" },
                    { value: "2700", label: "2700" },
                    { value: "3030", label: "3030" },
                    { value: "3050", label: "3050" },
                    { value: "3060", label: "3060" },
                    { value: "3500", label: "3500" },
                    { value: "4000", label: "4000" },
                    { value: "4300", label: "4300" },
                    { value: "5500", label: "5500" },
                    { value: "5800", label: "5800" },
                    { value: "6000", label: "6000" },
                    { value: "6100", label: "6100" },
                    { value: "6200", label: "6200" },
                    { value: "6210", label: "6210" },
                    { value: "6300", label: "6300" },
                    { value: "6700", label: "6700" },
                    { value: "6800", label: "6800" },
                    { value: "7910", label: "7910" },
                    { value: "7950", label: "7950" },
                    { value: "7960", label: "7960" },
                    { value: "7970", label: "7970" },
                    { value: "7990", label: "7990" },
                    { value: "8030", label: "8030" },
                    { value: "8040", label: "8040" },
                    { value: "8060", label: "8060" },
                    { value: "8090", label: "8090" },
                    { value: "8150", label: "8150" },
                    { value: "8190", label: "8190" },
                    { value: "8198", label: "8198" },
                    { value: "8199", label: "8199" },
                    { value: "8200", label: "8200" },
                    { value: "8220", label: "8220" },
                    { value: "8230", label: "8230" },
                    { value: "8240", label: "8240" },
                    { value: "8250", label: "8250" },
                    { value: "8255", label: "8255" },
                    { value: "8265", label: "8265" },
                    { value: "8270", label: "8270" },
                    { value: "8280", label: "8280" },
                    { value: "8291", label: "8291" },
                    { value: "8293", label: "8293" },
                    { value: "8299", label: "8299" },
                    { value: "8500", label: "8500" },
                ]}
                placeholder="-"
            />
            <FormSelect
                name="healthInsurance"
                formLabel={t('form.labels.healthInsurance')}
                formControl={control}
                formTriggerClass='w-full'
                options={[
                    { value: "-", label: "-" },
                    { value: "111", label: "111 Všeobecná zdravotní pojišťovna České republiky" },
                    { value: "201", label: "201 Vojenská zdravotní pojišťovna České republiky" },
                    { value: "205", label: "205 Česká průmyslová zdravotní pojišťovna" },
                    { value: "207", label: "207 Oborová zdravotní pojišťovna zaměstnanců bank a pojišťoven" },
                    { value: "208", label: "208 Zaměstnanecká pojišťovna ŠKODA, Mladá Boleslav" },
                    { value: "211", label: "211 Zdravotní pojišťovna ministerstva vnitra České republiky" },
                    { value: "213", label: "213 Revírní bratrská pokladna, Ostrava" },
                    { value: "333", label: "333 Pojišťovna VZP pro cizince" },
                    { value: "747", label: "747 Pojišťovna Maxima" }
                ]}
                placeholder="-"
            />
            <FormInput
                name="insuranceRegistrationNumber"
                formLabel={t('form.labels.insuranceRegistrationNumber')}
                formControl={control}
                inputType='number'
            />
        </>
    );
};