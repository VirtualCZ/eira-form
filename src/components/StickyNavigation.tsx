import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SettingsPopover from '@/customComponents/SettingsPopover';
import { Control, UseFormSetValue } from 'react-hook-form';
import { FormData } from '@/schemas/formSchema';

interface StickyNavigationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isSubmitting: boolean;
  isLastPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onClear: () => void;
  onExport: () => void;
  onExportAPI?: () => void;
  onImport: (file: File) => void;
  onCodeChange?: (value: string) => void;
  formControl: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
}

export const StickyNavigation: React.FC<StickyNavigationProps> = ({
  canGoPrevious,
  canGoNext,
  isSubmitting,
  isLastPage,
  onPrevious,
  onNext,
  onSubmit,
  onClear,
  onExport,
  onExportAPI,
  onImport,
  onCodeChange,
  formControl,
  setValue
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('form.buttons.previous')}
          </Button>

          {/* Right Side - Settings + Next/Submit */}
          <div className="flex items-center gap-2">
            <SettingsPopover
              onClear={onClear}
              onExportJSON={onExport}
              onExportAPI={onExportAPI}
              onImportJSON={onImport}
              onCodeChange={onCodeChange}
              formControl={formControl}
              setValue={setValue}
            />
            
            {isLastPage ? (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? t('form.buttons.submitting') : t('form.buttons.submit')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onNext}
                disabled={!canGoNext}
                className="flex items-center gap-2"
              >
                {t('form.buttons.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
