import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import SettingsPopover from './SettingsPopover';
import { Control } from 'react-hook-form';
import { FormData } from '@/schemas/formSchema';

interface NavigationButtonsProps {
    activeTab: string
    handlePrevious: () => void
    handleNext: () => void
    handleClear: () => void
    onExportJSON: () => void
    onImportJSON: (file: File) => void
    formControl: Control<FormData>,
}
export default function NavigationButtons({
    activeTab,
    handlePrevious,
    handleNext,
    handleClear,
    onExportJSON,
    onImportJSON,
    formControl
}: NavigationButtonsProps) {
    const { t } = useTranslation();
    const tabs = ["personalInformation", "addresses", "contacts", "foreigners", "employment",
        "educationAndLanguages", "healthAndSocialInfo", "legalInfo", "familyAndChildren",
        "documents", "agreements"];
    const currentIndex = tabs.indexOf(activeTab);

    return (
        <>
            {activeTab === "agreements" ? (
                <div className="flex flex-col px-2 pt-2 mt-2 border-t">
                    <p className="text-sm text-gray-600 text-center">
                        Poté co stisknete toto tlačítko, bude formulář odeslán do systému společnosti Axxoss.
                        Následně vám bude do e-mailu/sms zaslán odkaz na podepsání tohoto dotazníku.
                    </p>
                    <div className='flex justify-between'>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                        >
                            {t('form.buttons.previous')}
                        </Button>
                        <div className="flex gap-2">
                            <SettingsPopover
                                onClear={handleClear}
                                onExportJSON={onExportJSON}
                                onImportJSON={onImportJSON}
                                formControl={formControl}
                            />
                            <Button type="submit">{t('form.buttons.submit')}</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between px-2 pt-2 mt-2 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        {t('form.buttons.previous')}
                    </Button>
                    <div className="flex gap-2">
                        <SettingsPopover
                            onClear={handleClear}
                            onExportJSON={onExportJSON}
                            onImportJSON={onImportJSON}
                            formControl={formControl}
                        />
                        <Button
                            type="button"
                            onClick={handleNext}
                        >
                            {t('form.buttons.next')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}