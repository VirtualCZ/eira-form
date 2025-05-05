import FormInput from "@/customComponents/FormInput";
import FormSelect from "@/customComponents/FormSelect";
import { FormTable } from "@/customComponents/FormTable";
import { FormData } from "@/schemas/formSchema";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface EducationAndLanguagesTabProps {
    control: Control<FormData>
}

export const EducationAndLanguagesTab = ({ control }: EducationAndLanguagesTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <FormSelect
                name="highestEducation"
                formLabel={t('form.labels.highestEducation')}
                formControl={control}
                formTriggerClass='w-full'
                options={[
                    { value: "basicEducation", label: t('form.options.highestEducation.basicEducation') },
                    { value: "vocationalWithoutMatura", label: t('form.options.highestEducation.vocationalWithoutMatura') },
                    { value: "secondaryOrVocationalWithMatura", label: t('form.options.highestEducation.secondaryOrVocationalWithMatura') },
                    { value: "higherVocational", label: t('form.options.highestEducation.higherVocational') },
                    { value: "bachelor", label: t('form.options.highestEducation.bachelor') },
                    { value: "universityOrHigher", label: t('form.options.highestEducation.universityOrHigher') },
                    { value: "mbaOrPostgraduate", label: t('form.options.highestEducation.mbaOrPostgraduate') },
                ]}
            />
            <FormInput
                name="highestEducationSchool"
                formLabel={t('form.labels.highestEducationSchool')}
                formControl={control}
            />
            <FormInput
                name="fieldOfStudy"
                formLabel={t('form.labels.fieldOfStudy')}
                formControl={control}
            />
            <FormInput
                name="graduationYear"
                formLabel={t('form.labels.graduationYear')}
                formControl={control}
                inputType='number'
            />
            <FormInput
                name="studyCity"
                formLabel={t('form.labels.studyCity')}
                formControl={control}
            />
            <FormTable
                name="languageSkills"
                formControl={control}
                label={t('form.headlines.languageSkills')}
                columns={[
                    {
                        name: "language",
                        label: t('form.labels.language'),
                        placeholder: "",
                        errorPath: "language",
                        type: "text"
                    },
                    {
                        name: "languageProficiency",
                        label: t('form.labels.languageProficiency'),
                        errorPath: "languageProficiency",
                        type: "select",
                        options: [
                            { value: "A1", label: "A1" },
                            { value: "A2", label: "A2" },
                            { value: "B1", label: "B1" },
                            { value: "B2", label: "B2" },
                            { value: "C1", label: "C1" },
                            { value: "C2", label: "C2" },
                            { value: "native", label: t('form.options.languageProficiency.native') }
                        ]
                    },
                    {
                        name: "languageExamType",
                        label: t('form.labels.languageExamType'),
                        placeholder: "",
                        errorPath: "languageExamType",
                        type: "text"
                    },
                ]}
                errors={Array.isArray(control._formState.errors.languageSkills) ? control._formState.errors.languageSkills : undefined}
            />
        </>
    );
};